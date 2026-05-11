// Live FX rates from Open Exchange Rates (base: USD)

const OXR_APP_ID = import.meta.env.VITE_OXR_APP_ID as string;
const OXR_URL    = `https://openexchangerates.org/api/latest.json?app_id=${OXR_APP_ID}&base=USD`;

let cache: { rates: Record<string, number>; ts: number } | null = null;
const TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.ts < TTL) return cache.rates;

  try {
    const res  = await fetch(OXR_URL);
    if (!res.ok) throw new Error(`OXR ${res.status}`);
    const json = await res.json() as { rates: Record<string, number> };
    cache = { rates: json.rates, ts: Date.now() };
    return json.rates;
  } catch (e) {
    console.warn('[FX] Failed to fetch live rates, using fallback:', e);
    // Fallback rates (USD base) so UI never breaks
    return { USD: 1, GBP: 0.7912, EUR: 0.9241, CAD: 1.3621, JPY: 149.82, CHF: 0.8982, AUD: 1.5234 };
  }
}

/** Rate to convert `from` → `to` using USD-base rates */
export function getRate(from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return 1;
  const f = rates[from] ?? 1;
  const t = rates[to]   ?? 1;
  return t / f;
}
