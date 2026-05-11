-- ============================================================
-- STONEGATE BANK — Supabase Database Schema
-- Run this in the Supabase SQL editor for your project.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  phone                 text,
  date_of_birth         date,
  nationality           text,
  country_of_residence  text,
  source_of_funds       text,
  avatar_url            text,
  kyc_status            text not null default 'pending',  -- pending | verified | rejected
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- WALLETS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.wallets (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  currency       text not null,
  balance        numeric(18, 6) not null default 0,
  account_number text not null default lpad(floor(random() * 1e10)::bigint::text, 10, '0'),
  iban           text,
  sort_code      text,
  is_primary     boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint wallets_user_currency_unique unique (user_id, currency),
  constraint wallets_balance_nonneg check (balance >= 0)
);

alter table public.wallets enable row level security;

create policy "Users can view their own wallets"
  on public.wallets for select
  using (auth.uid() = user_id);

create policy "Users can update their own wallets"
  on public.wallets for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- TRANSACTIONS
-- ─────────────────────────────────────────────────────────────
create type public.tx_type   as enum ('swap', 'transfer_out', 'transfer_in', 'deposit', 'withdrawal');
create type public.tx_status as enum ('pending', 'completed', 'failed', 'reversed');

create table if not exists public.transactions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  type             public.tx_type not null,
  status           public.tx_status not null default 'completed',
  from_currency    text,
  to_currency      text,
  from_amount      numeric(18, 6),
  to_amount        numeric(18, 6),
  fee              numeric(18, 6) not null default 0,
  rate             numeric(18, 8),
  description      text,
  recipient_name   text,
  recipient_account text,
  reference        text not null default 'STG-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  created_at       timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create index transactions_user_created_idx on public.transactions (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- BENEFICIARIES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.beneficiaries (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  bank_name       text,
  account_number  text,
  iban            text,
  sort_code       text,
  currency        text not null default 'GBP',
  country         text,
  created_at      timestamptz not null default now()
);

alter table public.beneficiaries enable row level security;

create policy "Users can view their own beneficiaries"
  on public.beneficiaries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own beneficiaries"
  on public.beneficiaries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own beneficiaries"
  on public.beneficiaries for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: create profile + primary wallets on signup
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id, full_name, phone, date_of_birth,
    nationality, country_of_residence, source_of_funds
  ) values (
    new.id,
    _meta->>'full_name',
    _meta->>'phone',
    nullif(_meta->>'date_of_birth', '')::date,
    _meta->>'nationality',
    _meta->>'country_of_residence',
    _meta->>'source_of_funds'
  )
  on conflict (id) do nothing;

  -- Create default wallets: GBP (primary) + USD + EUR
  insert into public.wallets (user_id, currency, balance, is_primary) values
    (new.id, 'GBP', 0, true),
    (new.id, 'USD', 0, false),
    (new.id, 'EUR', 0, false)
  on conflict (user_id, currency) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- RPC: perform_swap
-- Atomically debit from_currency wallet and credit to_currency wallet.
-- Returns json: { success: bool, error?: text }
-- ─────────────────────────────────────────────────────────────
create or replace function public.perform_swap(
  p_user_id        uuid,
  p_from_currency  text,
  p_to_currency    text,
  p_from_amount    numeric,
  p_to_amount      numeric,
  p_rate           numeric,
  p_fee            numeric
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  _from_balance numeric;
  _to_wallet_id uuid;
begin
  -- Caller must be the owner
  if auth.uid() != p_user_id then
    return json_build_object('success', false, 'error', 'Unauthorized');
  end if;

  -- Lock and read from-wallet
  select balance into _from_balance
  from public.wallets
  where user_id = p_user_id and currency = p_from_currency
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Source wallet not found');
  end if;

  if _from_balance < p_from_amount then
    return json_build_object('success', false, 'error', 'Insufficient funds');
  end if;

  -- Debit from-wallet
  update public.wallets
  set balance = balance - p_from_amount
  where user_id = p_user_id and currency = p_from_currency;

  -- Upsert to-wallet (create if it doesn't exist yet)
  insert into public.wallets (user_id, currency, balance, is_primary)
  values (p_user_id, p_to_currency, p_to_amount, false)
  on conflict (user_id, currency)
  do update set balance = public.wallets.balance + excluded.balance;

  -- Record transaction
  insert into public.transactions (
    user_id, type, status,
    from_currency, to_currency,
    from_amount, to_amount,
    fee, rate, description
  ) values (
    p_user_id, 'swap', 'completed',
    p_from_currency, p_to_currency,
    p_from_amount, p_to_amount,
    p_fee, p_rate,
    'Currency conversion: ' || p_from_currency || ' → ' || p_to_currency
  );

  return json_build_object('success', true);

exception when others then
  return json_build_object('success', false, 'error', sqlerrm);
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- RPC: perform_transfer
-- Debit from the sender's wallet and record an outbound transaction.
-- (Inbound credit to recipient is handled server-side / via a separate webhook
--  for real cross-account transfers; this covers same-bank transfers.)
-- ─────────────────────────────────────────────────────────────
create or replace function public.perform_transfer(
  p_user_id          uuid,
  p_currency         text,
  p_amount           numeric,
  p_fee              numeric,
  p_recipient_name   text,
  p_recipient_account text,
  p_description      text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  _balance numeric;
  _total   numeric := p_amount + p_fee;
begin
  if auth.uid() != p_user_id then
    return json_build_object('success', false, 'error', 'Unauthorized');
  end if;

  select balance into _balance
  from public.wallets
  where user_id = p_user_id and currency = p_currency
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Wallet not found');
  end if;

  if _balance < _total then
    return json_build_object('success', false, 'error', 'Insufficient funds');
  end if;

  update public.wallets
  set balance = balance - _total
  where user_id = p_user_id and currency = p_currency;

  insert into public.transactions (
    user_id, type, status,
    from_currency, from_amount, fee,
    recipient_name, recipient_account, description
  ) values (
    p_user_id, 'transfer_out', 'completed',
    p_currency, p_amount, p_fee,
    p_recipient_name, p_recipient_account,
    coalesce(p_description, 'Transfer to ' || p_recipient_name)
  );

  return json_build_object('success', true);

exception when others then
  return json_build_object('success', false, 'error', sqlerrm);
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- REALTIME: enable for live balance + transaction updates
-- ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.wallets;
alter publication supabase_realtime add table public.transactions;
