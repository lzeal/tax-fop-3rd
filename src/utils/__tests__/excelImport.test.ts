import { parseWorksheetWithConfig, getWorksheetHeaders } from '../excelImport';
import { ImportConfig } from '../../types';
import * as XLSX from 'xlsx';

// Mock XLSX.utils.sheet_to_json
jest.mock('xlsx', () => ({
  utils: {
    sheet_to_json: jest.fn(),
  },
  SSF: {
    parse_date_code: jest.fn((code: number) => {
      // Simple mock: Excel date serial numbers start from 1900-01-01
      // For testing, we'll handle a few specific values
      const baseDate = new Date(1899, 11, 30); // Excel epoch
      const result = new Date(baseDate.getTime() + code * 24 * 60 * 60 * 1000);
      return result;
    }),
  },
}));

describe('excelImport', () => {
  const createMockConfig = (overrides?: Partial<ImportConfig>): ImportConfig => ({
    id: 'test-config',
    name: 'Test Config',
    headerRow: 1,
    dataStartRow: 2,
    columnMapping: {
      dateColumn: 'Дата',
      amountColumn: 'Сума',
      currencyColumn: 'Валюта',
      counterpartyColumn: 'Контрагент',
      accountColumn: 'Рахунок',
      // Note: descriptionColumn and ownAccountColumn are optional
    },
    dateFormat: 'dd.MM.yyyy',
    filterIncoming: false,
    mainAccountPrefix: '2600',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWorksheetHeaders', () => {
    it('should return headers from specified row', () => {
      const mockData = [
        ['Header1', 'Header2', 'Header3'],
        ['data1', 'data2', 'data3'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = getWorksheetHeaders({} as XLSX.WorkSheet, 1);

      expect(result).toEqual(['Header1', 'Header2', 'Header3']);
    });

    it('should return headers from custom row', () => {
      const mockData = [
        ['Skip this'],
        ['Header1', 'Header2', 'Header3'],
        ['data1', 'data2', 'data3'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = getWorksheetHeaders({} as XLSX.WorkSheet, 2);

      expect(result).toEqual(['Header1', 'Header2', 'Header3']);
    });

    it('should return empty array if row does not exist', () => {
      const mockData = [['Header1']];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = getWorksheetHeaders({} as XLSX.WorkSheet, 5);

      expect(result).toEqual([]);
    });

    it('should handle null/undefined values in headers', () => {
      const mockData = [['Header1', null, undefined, 'Header4']];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = getWorksheetHeaders({} as XLSX.WorkSheet, 1);

      expect(result).toEqual(['Header1', '', '', 'Header4']);
    });

    it('should convert numeric headers to strings', () => {
      const mockData = [[123, 456, 789]];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const result = getWorksheetHeaders({} as XLSX.WorkSheet, 1);

      expect(result).toEqual(['123', '456', '789']);
    });
  });

  describe('parseWorksheetWithConfig', () => {
    it('should parse basic payment data correctly', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'UAH', 'Test Company', 'UA123456'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(1000);
      expect(result[0].currencyCode).toBe('UAH');
      expect(result[0].counterparty).toBe('Test Company');
    });

    it('should parse dates in dd.MM.yyyy format', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].date.getDate()).toBe(15);
      expect(result[0].date.getMonth()).toBe(0); // January
      expect(result[0].date.getFullYear()).toBe(2025);
    });

    it('should parse dates in dd/MM/yyyy format', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15/01/2025', 1000, 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({ dateFormat: 'dd/MM/yyyy' });
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].date.getDate()).toBe(15);
      expect(result[0].date.getMonth()).toBe(0);
      expect(result[0].date.getFullYear()).toBe(2025);
    });

    it('should parse dates in yyyy-MM-dd format', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['2025-01-15', 1000, 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({ dateFormat: 'yyyy-MM-dd' });
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].date.getFullYear()).toBe(2025);
      expect(result[0].date.getMonth()).toBe(0);
      expect(result[0].date.getDate()).toBe(15);
    });

    it('should parse amounts with comma decimal separator', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', '1234,56', 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].amount).toBe(1234.56);
    });

    it('should parse amounts with period decimal separator', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', '1234.56', 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].amount).toBe(1234.56);
    });

    it('should parse amounts with thousand separators (comma)', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', '1,234,567', 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].amount).toBe(1234567);
    });

    it('should parse amounts with both thousand separators and decimal', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', '1,234.56', 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].amount).toBe(1234.56);
    });

    it('should parse amounts with space thousand separators', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', '1 234 567,89', 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].amount).toBe(1234567.89);
    });

    it('should normalize currency code ГРИВНЯ to UAH', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'ГРИВНЯ', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].currencyCode).toBe('UAH');
    });

    it('should normalize currency code ГРН to UAH', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'ГРН', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].currencyCode).toBe('UAH');
    });

    it('should normalize currency code ЄВРО to EUR', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'ЄВРО', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].currencyCode).toBe('EUR');
    });

    it('should normalize currency code ДОЛАР США to USD', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'ДОЛАР США', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].currencyCode).toBe('USD');
    });

    it('should filter by incoming transactions using K sign', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок', 'Тип'],
        ['15.01.2025', 1000, 'UAH', 'Income', '123', 'К'],
        ['16.01.2025', 500, 'UAH', 'Expense', '123', 'Д'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({
        amountSignColumn: 'Тип',
        filterIncoming: true,
      });
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(1);
      expect(result[0].counterparty).toBe('Income');
    });

    it('should filter out distribution account payments (2603 prefix)', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок', 'Рахунок отримувача'],
        ['15.01.2025', 1000, 'UAH', 'Test1', '123', 'UA2600123456'],
        ['16.01.2025', 500, 'UAH', 'Test2', '123', 'UA2603654321'], // Distribution account
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({
        distributionAccountPrefix: '2603',
        columnMapping: {
          dateColumn: 'Дата',
          amountColumn: 'Сума',
          currencyColumn: 'Валюта',
          counterpartyColumn: 'Контрагент',
          accountColumn: 'Рахунок',
          ownAccountColumn: 'Рахунок отримувача',
        },
      });
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(1);
      expect(result[0].counterparty).toBe('Test1');
    });

    it('should filter out own bank transactions', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'UAH', 'Test Company', '123'],
        ['16.01.2025', 500, 'UAH', 'АТ КБ ПРИВАТБАНК', '123'], // Own bank
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({
        ownBankName: 'ПРИВАТБАНК',
      });
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(1);
      expect(result[0].counterparty).toBe('Test Company');
    });

    it('should skip rows with missing required fields', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'UAH', 'Valid', '123'],
        [null, 500, 'UAH', 'MissingDate', '123'], // Missing date
        ['16.01.2025', null, 'UAH', 'MissingAmount', '123'], // Missing amount
        ['17.01.2025', 300, 'UAH', null, '123'], // Missing counterparty
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(1);
      expect(result[0].counterparty).toBe('Valid');
    });

    it('should throw error if required column not found', () => {
      const mockData = [
        ['Date', 'Amount', 'Currency', 'Party', 'Account'], // Wrong column names
        ['15.01.2025', 1000, 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();

      expect(() => {
        parseWorksheetWithConfig({} as XLSX.WorkSheet, config);
      }).toThrow('Помилка в маппінгу колонок');
    });

    it('should throw error if file has fewer rows than header row', () => {
      const mockData: any[][] = [];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({ headerRow: 5 });

      expect(() => {
        parseWorksheetWithConfig({} as XLSX.WorkSheet, config);
      }).toThrow('Файл містить менше рядків, ніж вказано в конфігурації');
    });

    it('should handle numeric amount values directly', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 12345.67, 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].amount).toBe(12345.67);
    });

    it('should take absolute value of negative amounts', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', -1000, 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].amount).toBe(1000);
    });

    it('should parse multiple rows correctly', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'UAH', 'Company A', '123'],
        ['16.01.2025', 2000, 'EUR', 'Company B', '456'],
        ['17.01.2025', 3000, 'USD', 'Company C', '789'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(3);
      expect(result[0].counterparty).toBe('Company A');
      expect(result[1].counterparty).toBe('Company B');
      expect(result[2].counterparty).toBe('Company C');
    });

    it('should handle column name matching case-insensitively', () => {
      const mockData = [
        ['ДАТА', 'СУМА', 'ВАЛЮТА', 'КОНТРАГЕНТ', 'РАХУНОК'],
        ['15.01.2025', 1000, 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({
        columnMapping: {
          dateColumn: 'дата',
          amountColumn: 'сума',
          currencyColumn: 'валюта',
          counterpartyColumn: 'контрагент',
          accountColumn: 'рахунок',
        },
      });
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(1);
    });

    it('should handle partial column name matching', () => {
      const mockData = [
        ['Дата операції', 'Сума платежу', 'Код валюти', 'Назва контрагента', 'Номер рахунку'],
        ['15.01.2025', 1000, 'UAH', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({
        columnMapping: {
          dateColumn: 'Дата',
          amountColumn: 'Сума',
          currencyColumn: 'валюти',
          counterpartyColumn: 'контрагент',
          accountColumn: 'рахунку',
        },
      });
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(1);
    });

    it('should skip empty rows', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, 'UAH', 'Test1', '123'],
        [], // Empty row
        ['16.01.2025', 2000, 'UAH', 'Test2', '456'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result).toHaveLength(2);
    });

    it('should default to UAH if currency is missing', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок'],
        ['15.01.2025', 1000, '', 'Test', '123'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig();
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].currencyCode).toBe('UAH');
    });

    it('should include description when column is configured', () => {
      const mockData = [
        ['Дата', 'Сума', 'Валюта', 'Контрагент', 'Рахунок', 'Призначення'],
        ['15.01.2025', 1000, 'UAH', 'Test', '123', 'Payment for services'],
      ];
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

      const config = createMockConfig({
        columnMapping: {
          dateColumn: 'Дата',
          amountColumn: 'Сума',
          currencyColumn: 'Валюта',
          counterpartyColumn: 'Контрагент',
          accountColumn: 'Рахунок',
          descriptionColumn: 'Призначення',
        },
      });
      const result = parseWorksheetWithConfig({} as XLSX.WorkSheet, config);

      expect(result[0].description).toBe('Payment for services');
    });
  });
});
