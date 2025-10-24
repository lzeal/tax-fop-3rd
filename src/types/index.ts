export interface Payment {
  id: string;
  date: Date;
  currencyCode: 'UAH' | 'EUR' | 'USD';
  amount: number;
  amountUAH: number;
  counterparty: string;
  counterpartyAccount: string;
  description?: string; // Призначення платежу
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
  ownAccountColumn?: string; // Назва колонки з власним рахунком
  descriptionColumn?: string; // Опціональна колонка з описом/призначенням
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
  // Нові поля для фільтрації
  ownBankName?: string; // Назва свого банку для фільтрації продажу валюти
  mainAccountPrefix: string; // Префікс основного рахунку (наприклад "2600")
  distributionAccountPrefix?: string; // Префікс розподільчого рахунку (наприклад "2603")
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

// Профіль ФОП для звітності F0103309
export interface FOPProfile {
  // Особисті дані
  fullName: string; // ПІБ повністю
  tin: string; // ІПН (РНОКПП)
  
  // Контактна інформація
  address: {
    region: string; // Область
    district?: string; // Район
    city: string; // Місто/селище
    street: string; // Вулиця
    building: string; // Будинок
    apartment?: string; // Квартира
    postalCode: string; // Поштовий індекс
  };
  phone: string;
  email: string;
  
  // Податкова інформація
  taxOffice: {
    code: string; // Код податкової інспекції (4 цифри)
    name: string; // Найменування податкової інспекції
  };
  
  // Статус підприємця
  registrationDate: Date; // Дата реєстрації як ФОП
  kved: {
    primary: string; // Основний КВЕД
    additional: string[]; // Додаткові КВЕДи
  };
  
  // Податкові параметри (фіксовані для 3-ї групи неплатників ПДВ)
  taxGroup: 3;
  isVATpayer: false;
  singleTaxRate: 0.05; // 5% для неплатників ПДВ
  militaryTaxRate: 0.01; // 1% з січня 2025
  
  // Ліміти для 3-ї групи (2025)
  yearlyIncomeLimit: 12000000; // 12 млн грн
}

// Накопичувальні дані з початку року
export interface AccumulatedData {
  year: number;
  
  // Доходи по кварталах в гривнях
  quarterlyIncomeUAH: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  
  // Доходи по кварталах в іноземній валюті (у грн еквіваленті)
  quarterlyIncomeForeign: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  
  // Розрахунки податків
  taxes: {
    // Єдиний податок (5%)
    singleTax: {
      q1: number;
      q2: number;
      q3: number;
      q4: number;
    };
    
    // Військовий збір (1%)
    militaryTax: {
      q1: number;
      q2: number;
      q3: number;
      q4: number;
    };
    
    // ЄСВ (розраховується окремо)
    socialContributions: {
      q1: number;
      q2: number;
      q3: number;
      q4: number;
    };
  };
  
  // Попередні періоди (для коригувань)
  previousPeriodCorrections?: {
    income: number;
    singleTax: number;
    militaryTax: number;
    socialContributions: number;
  };
}

// Розрахунки для конкретного кварталу
export interface QuarterlyCalculation {
  quarter: number;
  year: number;
  
  // Доходи за квартал
  quarterlyIncome: number;
  cumulativeIncome: number;
  
  // Єдиний податок
  quarterlySingleTax: number;
  cumulativeSingleTax: number;
  quarterlySingleTaxPaid: number;
  cumulativeSingleTaxPaid: number;
  
  // Військовий збір
  quarterlyMilitaryTax: number;
  cumulativeMilitaryTax: number;
  quarterlyMilitaryTaxPaid: number;
  cumulativeMilitaryTaxPaid: number;
  
  // ЄСВ
  quarterlySocialContributions: number;
  cumulativeSocialContributions: number;
}

// Структура XML звіту F0103309
export interface TaxReportF0103309 {
  reportingPeriod: {
    year: number;
    quarter: 1 | 2 | 3 | 4;
  };
  
  // Розділ I - Доходи
  incomeSection: {
    // 1. Доходи в національній валюті
    nationalCurrencyIncome: {
      currentQuarter: number;
      cumulativeFromYearStart: number;
    };
    
    // 2. Доходи в іноземній валюті
    foreignCurrencyIncome: {
      currentQuarter: number;
      cumulativeFromYearStart: number;
    };
    
    // 3. Загальна сума доходів
    totalIncome: {
      currentQuarter: number;
      cumulativeFromYearStart: number;
    };
  };
  
  // Розділ II - Розрахунок єдиного податку
  singleTaxSection: {
    taxableIncome: number; // База оподаткування
    taxRate: number; // Ставка (5%)
    calculatedTax: number; // Нарахований податок
    previouslyPaid: number; // Сплачено раніше
    toPay: number; // До доплати
  };
  
  // Розділ III - Військовий збір
  militaryTaxSection: {
    taxableIncome: number; // База оподаткування
    taxRate: number; // Ставка (1%)
    calculatedTax: number; // Нарахований збір
    previouslyPaid: number; // Сплачено раніше
    toPay: number; // До доплати
  };
  
  // Розділ IV - ЄСВ (опціонально, може розраховуватися окремо)
  socialContributionsSection?: {
    minimumWage: number; // Мінімальна зарплата
    contributionBase: number; // База нарахування
    contributionRate: number; // Ставка ЄСВ
    calculatedContribution: number; // Нарахований ЄСВ
    previouslyPaid: number; // Сплачено раніше
    toPay: number; // До доплати
  };
}