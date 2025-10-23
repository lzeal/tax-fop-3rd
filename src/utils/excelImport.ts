import * as XLSX from 'xlsx';
import { ImportConfig, ExcelRow, ParsedPayment } from '../types';

export const readExcelFile = (file: File): Promise<XLSX.WorkBook> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook);
      } catch (error) {
        reject(new Error('Помилка при читанні Excel файлу'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Помилка при завантаженні файлу'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const parseWorksheetWithConfig = (
  worksheet: XLSX.WorkSheet,
  config: ImportConfig
): ParsedPayment[] => {
  // Конвертуємо worksheet в JSON
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    blankrows: false 
  });

  if (jsonData.length < config.headerRow) {
    throw new Error('Файл містить менше рядків, ніж вказано в конфігурації');
  }

  // Отримуємо заголовки
  const headers = jsonData[config.headerRow - 1] as string[];
  
  // Створюємо мапінг колонок
  const columnIndices: Record<string, number> = {};
  
  const findColumnIndex = (columnName: string): number => {
    const index = headers.findIndex(header => 
      header && header.toString().toLowerCase().includes(columnName.toLowerCase())
    );
    if (index === -1) {
      throw new Error(`Не знайдено колонку: ${columnName}`);
    }
    return index;
  };

  try {
    columnIndices.date = findColumnIndex(config.columnMapping.dateColumn);
    columnIndices.amount = findColumnIndex(config.columnMapping.amountColumn);
    columnIndices.currency = findColumnIndex(config.columnMapping.currencyColumn);
    columnIndices.counterparty = findColumnIndex(config.columnMapping.counterpartyColumn);
    columnIndices.account = findColumnIndex(config.columnMapping.accountColumn);
    
    if (config.columnMapping.descriptionColumn) {
      columnIndices.description = findColumnIndex(config.columnMapping.descriptionColumn);
    }
    
    if (config.amountSignColumn) {
      columnIndices.amountSign = findColumnIndex(config.amountSignColumn);
    }
  } catch (error) {
    throw new Error(`Помилка в маппінгу колонок: ${error}`);
  }

  // Обробляємо дані
  const payments: ParsedPayment[] = [];
  for (let i = config.dataStartRow - 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    try {
      const payment = parseRowToPayment(row, columnIndices, config);
      console.log(`Parsed payment from row ${i + 1}:`, payment, columnIndices);
      if (payment && (!config.filterIncoming || payment.isIncoming)) {
        payments.push(payment);
      }
    } catch (error) {
      console.warn(`Помилка при обробці рядка ${i + 1}:`, error);
      // Продовжуємо обробку інших рядків
    }
  }

  return payments;
};

const parseRowToPayment = (
  row: any[],
  columnIndices: Record<string, number>,
  config: ImportConfig
): ParsedPayment | null => {
  // Перевіряємо, чи є всі необхідні дані
  const dateValue = row[columnIndices.date];
  const amountValue = row[columnIndices.amount];
  const currencyValue = row[columnIndices.currency];
  const counterpartyValue = row[columnIndices.counterparty];
  const accountValue = row[columnIndices.account];

  if (!dateValue || !amountValue || !counterpartyValue) {
    return null;
  }

  // Парсимо дату
  let date: Date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'number') {
    // Excel дати як числа
    date = XLSX.SSF.parse_date_code(dateValue);
  } else {
    // Парсимо рядок дати
    date = parseDate(dateValue.toString(), config.dateFormat);
  }
  // Парсимо суму
  let amount: number;
  if (typeof amountValue === 'number') {
    amount = amountValue;
  } else {
    // Обробляємо різні формати сум
    let amountString = amountValue.toString().trim();
    
    // Видаляємо всі пробіли та розділювачі тисяч
    amountString = amountString.replace(/\s/g, ''); // видаляємо пробіли
    
    // Якщо є кома та крапка, то кома - розділювач тисяч, крапка - десяткова
    if (amountString.includes(',') && amountString.includes('.')) {
      // Формат: 1,234.56
      amountString = amountString.replace(/,/g, '');
    } 
    // Якщо тільки кома, перевіряємо позицію (якщо в кінці - десяткова, інакше - тисячі)
    else if (amountString.includes(',')) {
      const commaIndex = amountString.lastIndexOf(',');
      const afterComma = amountString.substring(commaIndex + 1);
      
      if (afterComma.length <= 2) {
        // Кома як десяткова: 123,45
        amountString = amountString.replace(',', '.');
      } else {
        // Кома як розділювач тисяч: 1,234,567
        amountString = amountString.replace(/,/g, '');
      }
    }
    
    amount = parseFloat(amountString);
    if (isNaN(amount)) {
      throw new Error(`Неможливо розпарсити суму: ${amountValue}`);
    }
  }

  // Перевіряємо знак суми
  let isIncoming = amount > 0;
  if (columnIndices.amountSign !== undefined) {
    const signValue = row[columnIndices.amountSign];
    if (signValue) {
      console.log(`Знак суми для рядка ${row}: ${signValue}`);
      const sign = signValue.toString().trim();
      // isIncoming = sign === '+' || sign.toLowerCase() === 'дебет';
      isIncoming = sign.toLowerCase() === 'к';
    }
  }

  // Беремо абсолютне значення суми
  amount = Math.abs(amount);

  // Парсимо валюту
  let currencyCode = currencyValue ? currencyValue.toString().toUpperCase() : 'UAH';
  // Нормалізуємо назви валют
  if (currencyCode === 'ГРИВНЯ' || currencyCode === 'ГРН') {
    currencyCode = 'UAH';
  } else if (currencyCode === 'ДОЛАР США' || currencyCode === 'ДОЛЛАР США') {
    currencyCode = 'USD';
  } else if (currencyCode === 'ЄВРО') {
    currencyCode = 'EUR';
  }

  return {
    date,
    amount,
    currencyCode,
    counterparty: counterpartyValue.toString().trim(),
    counterpartyAccount: accountValue ? accountValue.toString().trim() : '',
    description: columnIndices.description !== undefined ? 
      row[columnIndices.description]?.toString().trim() : undefined,
    isIncoming
  };
};

const parseDate = (dateString: string, format: string): Date => {
  // Простий парсер дат для найпоширеніших форматів
  const cleanDateString = dateString.trim();
  
  if (format === 'dd.MM.yyyy' || format === 'dd/MM/yyyy') {
    const parts = cleanDateString.split(/[./]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  } else if (format === 'yyyy-MM-dd') {
    return new Date(cleanDateString);
  }
  
  // Fallback - спробуємо стандартний парсер
  const parsed = new Date(cleanDateString);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Неможливо розпарсити дату: ${dateString}`);
  }
  
  return parsed;
};

export const getWorksheetHeaders = (worksheet: XLSX.WorkSheet, headerRow: number = 1): string[] => {
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length < headerRow) {
    return [];
  }
  
  return jsonData[headerRow - 1]?.map(header => header?.toString() || '') || [];
};