export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'NGN';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface Wallet {
  id: string;
  balance: Money;
  accountNumber: string;
  bankName: string;
  ownerName: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'SWAP' | 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
  amount: Money;
  fee: Money;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  timestamp: string;
  description: string;
}
