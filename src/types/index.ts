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

// Конфігурація для імпорту Excel файлів
export interface ImportColumnMapping {
  dateColumn: string; // Назва колонки з датою
  amountColumn: string; // Назва колонки з сумою
  currencyColumn: string; // Назва колонки з валютою
  counterpartyColumn: string; // Назва колонки з контрагентом
  accountColumn: string; // Назва колонки з рахунком
  descriptionColumn?: string; // Опціональна колонка з описом
}

export interface ImportConfig {
  id: string;
  name: string; // Назва конфігурації (наприклад "ПриватБанк")
  headerRow: number; // Номер рядка з заголовками (1-based)
  dataStartRow: number; // Номер рядка, з якого починаються дані (1-based)
  columnMapping: ImportColumnMapping;
  dateFormat: string; // Формат дати (наприклад "dd.MM.yyyy")
  filterIncoming: boolean; // Чи фільтрувати тільки надходження
  amountSignColumn?: string; // Колонка з знаком суми (+ або -)
}

// Дані з Excel файлу
export interface ExcelRow {
  [columnName: string]: string | number | Date | null;
}

export interface ParsedPayment {
  date: Date;
  amount: number;
  currencyCode: string;
  counterparty: string;
  counterpartyAccount: string;
  description?: string;
  isIncoming: boolean;
}