// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  country_of_residence: string | null;
  source_of_funds: string | null;
  avatar_url: string | null;
  kyc_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  account_number: string;
  iban: string | null;
  sort_code: string | null;
  is_primary: boolean;
  created_at: string;
}

export type TxType   = 'swap' | 'transfer_out' | 'transfer_in' | 'deposit' | 'withdrawal';
export type TxStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface Transaction {
  id: string;
  user_id: string;
  type: TxType;
  status: TxStatus;
  from_currency: string | null;
  to_currency: string | null;
  from_amount: number | null;
  to_amount: number | null;
  fee: number;
  rate: number | null;
  description: string | null;
  recipient_name: string | null;
  recipient_account: string | null;
  reference: string;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  bank_name: string | null;
  account_number: string | null;
  iban: string | null;
  sort_code: string | null;
  currency: string;
  country: string | null;
  created_at: string;
}

// ─── Supabase DB schema types ──────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      wallets: {
        Row: Wallet;
        Insert: Partial<Wallet> & { user_id: string; currency: string };
        Update: Partial<Wallet>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'reference' | 'created_at'> & { id?: string; reference?: string };
        Update: Partial<Transaction>;
      };
      beneficiaries: {
        Row: Beneficiary;
        Insert: Omit<Beneficiary, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Beneficiary>;
      };
    };
    Functions: {
      perform_swap: {
        Args: {
          p_user_id: string;
          p_from_currency: string;
          p_to_currency: string;
          p_from_amount: number;
          p_to_amount: number;
          p_rate: number;
          p_fee: number;
        };
        Returns: { success: boolean; error?: string };
      };
      perform_transfer: {
        Args: {
          p_user_id: string;
          p_currency: string;
          p_amount: number;
          p_fee: number;
          p_recipient_name: string;
          p_recipient_account: string;
          p_description?: string | null;
        };
        Returns: { success: boolean; error?: string };
      };
    };
  };
};
