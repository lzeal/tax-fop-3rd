import {
  validateImportData,
  importDataFromJson,
  applyImportedData,
  clearAllData,
  getStorageInfo,
  formatFileSize,
} from '../dataExport';

// Mock localStorage
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock Object.keys to work with our mock
const originalKeys = Object.keys;
jest.spyOn(Object, 'keys').mockImplementation((obj) => {
  if (obj === localStorage) {
    return originalKeys(mockStorage);
  }
  return originalKeys(obj);
});

describe('dataExport', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  describe('validateImportData', () => {
    it('should return no errors for valid data', () => {
      const validData = {
        version: '1.0',
        exportDate: '2025-01-15T00:00:00.000Z',
        payments: [
          {
            id: '1',
            date: '2025-01-15T00:00:00.000Z',
            amount: 1000,
            currencyCode: 'UAH',
            amountUAH: 1000,
            counterparty: 'Test',
            counterpartyAccount: '1234',
          },
        ],
        profile: null,
        importConfigs: [],
        accumulatedData: {},
      };

      const errors = validateImportData(validData);

      expect(errors).toEqual([]);
    });

    it('should return error for non-object data', () => {
      const errors = validateImportData(null);

      expect(errors).toContain('Некоректний формат файлу');
    });

    it('should return error for string data', () => {
      const errors = validateImportData('invalid');

      expect(errors).toContain('Некоректний формат файлу');
    });

    it('should return error for missing version', () => {
      const data = {
        exportDate: '2025-01-15T00:00:00.000Z',
        payments: [],
        importConfigs: [],
      };

      const errors = validateImportData(data);

      expect(errors).toContain('Відсутня інформація про версію файлу');
    });

    it('should return error for non-array payments', () => {
      const data = {
        version: '1.0',
        payments: 'not an array',
        importConfigs: [],
      };

      const errors = validateImportData(data);

      expect(errors).toContain('Відсутні або некоректні дані про платежі');
    });

    it('should return error for non-array importConfigs', () => {
      const data = {
        version: '1.0',
        payments: [],
        importConfigs: 'not an array',
      };

      const errors = validateImportData(data);

      expect(errors).toContain('Відсутні або некоректні конфігурації імпорту');
    });

    it('should return error for payment with missing required fields', () => {
      const data = {
        version: '1.0',
        payments: [
          { id: '1', date: '2025-01-15' }, // Missing amount and currencyCode
        ],
        importConfigs: [],
      };

      const errors = validateImportData(data);

      expect(errors).toContain("Платіж 1: відсутні обов'язкові поля");
    });

    it('should validate multiple payments and report all errors', () => {
      const data = {
        version: '1.0',
        payments: [
          { id: '1' }, // Missing date, amount, currencyCode
          { date: '2025-01-15' }, // Missing id, amount, currencyCode
          {
            id: '3',
            date: '2025-01-15',
            amount: 1000,
            currencyCode: 'UAH',
          }, // Valid
        ],
        importConfigs: [],
      };

      const errors = validateImportData(data);

      expect(errors).toContain("Платіж 1: відсутні обов'язкові поля");
      expect(errors).toContain("Платіж 2: відсутні обов'язкові поля");
      expect(errors.length).toBe(2);
    });
  });

  describe('importDataFromJson', () => {
    it('should return success with parsed data for valid JSON', () => {
      const validData = {
        version: '1.0',
        exportDate: '2025-01-15T00:00:00.000Z',
        payments: [
          {
            id: '1',
            date: '2025-01-15T00:00:00.000Z',
            amount: 1000,
            currencyCode: 'UAH',
            amountUAH: 1000,
            counterparty: 'Test',
            counterpartyAccount: '1234',
          },
        ],
        profile: { fullName: 'Test User' },
        importConfigs: [{ id: '1', name: 'Config' }],
        accumulatedData: { '2025': { year: 2025 } },
      };

      const result = importDataFromJson(JSON.stringify(validData));

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.imported).toBeDefined();
      expect(result.imported.payments).toHaveLength(1);
      expect(result.imported.profile.fullName).toBe('Test User');
    });

    it('should convert date strings back to Date objects', () => {
      const validData = {
        version: '1.0',
        payments: [
          {
            id: '1',
            date: '2025-01-15T00:00:00.000Z',
            amount: 1000,
            currencyCode: 'UAH',
            amountUAH: 1000,
            counterparty: 'Test',
            counterpartyAccount: '1234',
          },
        ],
        importConfigs: [],
      };

      const result = importDataFromJson(JSON.stringify(validData));

      expect(result.success).toBe(true);
      expect(result.imported.payments[0].date).toBeInstanceOf(Date);
    });

    it('should return errors for invalid JSON', () => {
      const result = importDataFromJson('not valid json {{{');

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Помилка читання файлу. Перевірте, що файл не пошкоджений.'
      );
      expect(result.imported).toBeNull();
    });

    it('should return validation errors for invalid data structure', () => {
      const invalidData = {
        // Missing version
        payments: 'not an array',
      };

      const result = importDataFromJson(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('applyImportedData', () => {
    const importedData = {
      payments: [
        {
          id: '1',
          date: new Date('2025-01-15'),
          amount: 1000,
          currencyCode: 'UAH',
        },
      ],
      profile: {
        fullName: 'Test User',
        registrationDate: '2020-01-01T00:00:00.000Z',
      },
      importConfigs: [{ id: '1', name: 'Config' }],
      accumulatedData: {
        '2025': { year: 2025, quarterlyIncomeUAH: { q1: 1000 } },
        '2024': { year: 2024, quarterlyIncomeUAH: { q1: 500 } },
      },
    };

    it('should save payments when replacePayments is true', () => {
      applyImportedData(importedData, {
        replacePayments: true,
        replaceProfile: false,
        replaceConfigs: false,
        replaceAccumulatedData: false,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fop-payments',
        expect.any(String)
      );
    });

    it('should not save payments when replacePayments is false', () => {
      applyImportedData(importedData, {
        replacePayments: false,
        replaceProfile: false,
        replaceConfigs: false,
        replaceAccumulatedData: false,
      });

      expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
        'fop-payments',
        expect.anything()
      );
    });

    it('should save profile when replaceProfile is true', () => {
      applyImportedData(importedData, {
        replacePayments: false,
        replaceProfile: true,
        replaceConfigs: false,
        replaceAccumulatedData: false,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fop-profile',
        expect.any(String)
      );
    });

    it('should save configs when replaceConfigs is true', () => {
      applyImportedData(importedData, {
        replacePayments: false,
        replaceProfile: false,
        replaceConfigs: true,
        replaceAccumulatedData: false,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fop-import-configs',
        expect.any(String)
      );
    });

    it('should save accumulated data for each year when replaceAccumulatedData is true', () => {
      applyImportedData(importedData, {
        replacePayments: false,
        replaceProfile: false,
        replaceConfigs: false,
        replaceAccumulatedData: true,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fop-accumulated-data-2025',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fop-accumulated-data-2024',
        expect.any(String)
      );
    });

    it('should save all data when all options are true', () => {
      applyImportedData(importedData, {
        replacePayments: true,
        replaceProfile: true,
        replaceConfigs: true,
        replaceAccumulatedData: true,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(5); // payments, profile, configs, 2 years of accumulated
    });
  });

  describe('clearAllData', () => {
    it('should remove all fop-* keys from localStorage', () => {
      mockStorage['fop-payments'] = '[]';
      mockStorage['fop-profile'] = '{}';
      mockStorage['fop-accumulated-data-2025'] = '{}';
      mockStorage['other-key'] = 'value';

      clearAllData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('fop-payments');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('fop-profile');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'fop-accumulated-data-2025'
      );
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other-key');
    });

    it('should not remove non-fop keys', () => {
      mockStorage['other-app-data'] = 'value';
      mockStorage['fop-profile'] = '{}';

      clearAllData();

      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith(
        'other-app-data'
      );
    });
  });

  describe('getStorageInfo', () => {
    it('should return correct total size and item count', () => {
      mockStorage['fop-payments'] = '[{"id":"1"}]';
      mockStorage['fop-profile'] = '{"name":"test"}';
      mockStorage['other-key'] = 'ignored';

      const info = getStorageInfo();

      expect(info.itemCount).toBe(2);
      expect(info.items).toHaveLength(2);
      expect(info.totalSize).toBeGreaterThan(0);
    });

    it('should only count fop-* keys', () => {
      mockStorage['fop-payments'] = '[]';
      mockStorage['non-fop-key'] = 'large data string';

      const info = getStorageInfo();

      expect(info.itemCount).toBe(1);
    });

    it('should sort items by size descending', () => {
      mockStorage['fop-small'] = 'a';
      mockStorage['fop-large'] = 'aaaaaaaaaaaaaaaaaaaaa';
      mockStorage['fop-medium'] = 'aaaaaaaaaa';

      const info = getStorageInfo();

      expect(info.items[0].key).toBe('fop-large');
      expect(info.items[1].key).toBe('fop-medium');
      expect(info.items[2].key).toBe('fop-small');
    });

    it('should return empty info when no fop keys exist', () => {
      mockStorage['other-key'] = 'value';

      const info = getStorageInfo();

      expect(info.itemCount).toBe(0);
      expect(info.totalSize).toBe(0);
      expect(info.items).toEqual([]);
    });
  });

  describe('formatFileSize', () => {
    it('should return "0 Bytes" for 0', () => {
      const result = formatFileSize(0);
      expect(result).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      const result = formatFileSize(500);
      expect(result).toBe('500 Bytes');
    });

    it('should convert to KB correctly', () => {
      const result = formatFileSize(1024);
      expect(result).toBe('1 KB');
    });

    it('should convert to KB with decimals', () => {
      const result = formatFileSize(1536); // 1.5 KB
      expect(result).toBe('1.5 KB');
    });

    it('should convert to MB correctly', () => {
      const result = formatFileSize(1024 * 1024);
      expect(result).toBe('1 MB');
    });

    it('should convert to MB with decimals', () => {
      const result = formatFileSize(1.5 * 1024 * 1024);
      expect(result).toBe('1.5 MB');
    });

    it('should convert to GB correctly', () => {
      const result = formatFileSize(1024 * 1024 * 1024);
      expect(result).toBe('1 GB');
    });

    it('should limit decimal places to 2', () => {
      const result = formatFileSize(1234567); // ~1.177 MB
      expect(result).toMatch(/^\d+\.?\d{0,2} MB$/);
    });
  });
});
