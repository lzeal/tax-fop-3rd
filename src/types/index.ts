export interface Payment {
  id: string;
  date: Date;
  currencyCode: 'UAH' | 'EUR' | 'USD';
  amount: number;
  amountUAH: number;
  counterparty: string;
  counterpartyAccount: string;
  exchangeRate?: number;
}

export interface ExchangeRate {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
}

export interface Quarter {
  year: number;
  quarter: 1 | 2 | 3 | 4;
}

export interface AppState {
  payments: Payment[];
  selectedQuarter: Quarter;
  exchangeRates: Record<string, ExchangeRate>;
}