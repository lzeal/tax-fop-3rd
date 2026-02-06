import {
  createEmptyAccumulatedData,
  loadAccumulatedData,
  saveAccumulatedData,
  getPaymentQuarter,
  updateAccumulatedDataWithPayments,
  getCumulativeData,
  getQuarterData,
  checkSimplifiedSystemLimit,
  getSimplifiedSystemLimitUsage,
} from '../accumulatedData';
import { Payment, AccumulatedData } from '../../types';

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

describe('accumulatedData', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    jest.clearAllMocks();
  });

  describe('createEmptyAccumulatedData', () => {
    it('should create structure with correct year', () => {
      const data = createEmptyAccumulatedData(2025);
      expect(data.year).toBe(2025);
    });

    it('should have all quarterly income values at 0', () => {
      const data = createEmptyAccumulatedData(2025);

      expect(data.quarterlyIncomeUAH.q1).toBe(0);
      expect(data.quarterlyIncomeUAH.q2).toBe(0);
      expect(data.quarterlyIncomeUAH.q3).toBe(0);
      expect(data.quarterlyIncomeUAH.q4).toBe(0);

      expect(data.quarterlyIncomeForeign.q1).toBe(0);
      expect(data.quarterlyIncomeForeign.q2).toBe(0);
      expect(data.quarterlyIncomeForeign.q3).toBe(0);
      expect(data.quarterlyIncomeForeign.q4).toBe(0);
    });

    it('should have all tax values at 0', () => {
      const data = createEmptyAccumulatedData(2025);

      expect(data.taxes.singleTax.q1).toBe(0);
      expect(data.taxes.singleTax.q2).toBe(0);
      expect(data.taxes.singleTax.q3).toBe(0);
      expect(data.taxes.singleTax.q4).toBe(0);

      expect(data.taxes.militaryTax.q1).toBe(0);
      expect(data.taxes.militaryTax.q2).toBe(0);
      expect(data.taxes.militaryTax.q3).toBe(0);
      expect(data.taxes.militaryTax.q4).toBe(0);

      expect(data.taxes.socialContributions.q1).toBe(0);
      expect(data.taxes.socialContributions.q2).toBe(0);
      expect(data.taxes.socialContributions.q3).toBe(0);
      expect(data.taxes.socialContributions.q4).toBe(0);
    });
  });

  describe('loadAccumulatedData', () => {
    it('should return empty data when nothing is stored', () => {
      const data = loadAccumulatedData(2025);

      expect(data.year).toBe(2025);
      expect(data.quarterlyIncomeUAH.q1).toBe(0);
    });

    it('should load stored data correctly', () => {
      const storedData: AccumulatedData = {
        year: 2025,
        quarterlyIncomeUAH: { q1: 100000, q2: 0, q3: 0, q4: 0 },
        quarterlyIncomeForeign: { q1: 50000, q2: 0, q3: 0, q4: 0 },
        taxes: {
          singleTax: { q1: 7500, q2: 0, q3: 0, q4: 0 },
          militaryTax: { q1: 1500, q2: 0, q3: 0, q4: 0 },
          socialContributions: { q1: 0, q2: 0, q3: 0, q4: 0 },
        },
      };

      mockStorage['fop-accumulated-data-2025'] = JSON.stringify(storedData);

      const data = loadAccumulatedData(2025);

      expect(data.quarterlyIncomeUAH.q1).toBe(100000);
      expect(data.quarterlyIncomeForeign.q1).toBe(50000);
      expect(data.taxes.singleTax.q1).toBe(7500);
    });

    it('should return empty data on parse error', () => {
      mockStorage['fop-accumulated-data-2025'] = 'invalid json';

      const data = loadAccumulatedData(2025);

      expect(data.year).toBe(2025);
      expect(data.quarterlyIncomeUAH.q1).toBe(0);
    });
  });

  describe('saveAccumulatedData', () => {
    it('should save data to localStorage', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 100000;

      saveAccumulatedData(data);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fop-accumulated-data-2025',
        expect.any(String)
      );

      const saved = JSON.parse(mockStorage['fop-accumulated-data-2025']);
      expect(saved.quarterlyIncomeUAH.q1).toBe(100000);
    });
  });

  describe('getPaymentQuarter', () => {
    it('should return 1 for January', () => {
      const payment = { date: new Date(2025, 0, 15) } as Payment;
      expect(getPaymentQuarter(payment)).toBe(1);
    });

    it('should return 1 for March', () => {
      const payment = { date: new Date(2025, 2, 31) } as Payment;
      expect(getPaymentQuarter(payment)).toBe(1);
    });

    it('should return 2 for April', () => {
      const payment = { date: new Date(2025, 3, 1) } as Payment;
      expect(getPaymentQuarter(payment)).toBe(2);
    });

    it('should return 2 for June', () => {
      const payment = { date: new Date(2025, 5, 30) } as Payment;
      expect(getPaymentQuarter(payment)).toBe(2);
    });

    it('should return 3 for July', () => {
      const payment = { date: new Date(2025, 6, 1) } as Payment;
      expect(getPaymentQuarter(payment)).toBe(3);
    });

    it('should return 3 for September', () => {
      const payment = { date: new Date(2025, 8, 30) } as Payment;
      expect(getPaymentQuarter(payment)).toBe(3);
    });

    it('should return 4 for October', () => {
      const payment = { date: new Date(2025, 9, 1) } as Payment;
      expect(getPaymentQuarter(payment)).toBe(4);
    });

    it('should return 4 for December', () => {
      const payment = { date: new Date(2025, 11, 31) } as Payment;
      expect(getPaymentQuarter(payment)).toBe(4);
    });
  });

  describe('updateAccumulatedDataWithPayments', () => {
    const createPayment = (
      date: Date,
      amountUAH: number,
      currencyCode: 'UAH' | 'EUR' | 'USD' = 'UAH'
    ): Payment => ({
      id: Math.random().toString(),
      date,
      currencyCode,
      amount: amountUAH,
      amountUAH,
      counterparty: 'Test',
      counterpartyAccount: '1234',
    });

    it('should correctly separate UAH and foreign currency', () => {
      const payments: Payment[] = [
        createPayment(new Date(2025, 0, 15), 100000, 'UAH'),
        createPayment(new Date(2025, 0, 20), 50000, 'USD'),
      ];

      const data = updateAccumulatedDataWithPayments(payments, 2025);

      expect(data.quarterlyIncomeUAH.q1).toBe(100000);
      expect(data.quarterlyIncomeForeign.q1).toBe(50000);
    });

    it('should filter payments by year', () => {
      const payments: Payment[] = [
        createPayment(new Date(2025, 0, 15), 100000, 'UAH'),
        createPayment(new Date(2024, 0, 15), 50000, 'UAH'), // Different year
      ];

      const data = updateAccumulatedDataWithPayments(payments, 2025);

      expect(data.quarterlyIncomeUAH.q1).toBe(100000);
    });

    it('should calculate 5% single tax', () => {
      const payments: Payment[] = [
        createPayment(new Date(2025, 0, 15), 100000, 'UAH'),
      ];

      const data = updateAccumulatedDataWithPayments(payments, 2025);

      expect(data.taxes.singleTax.q1).toBe(5000); // 5% of 100000
    });

    it('should calculate 1% military tax', () => {
      const payments: Payment[] = [
        createPayment(new Date(2025, 0, 15), 100000, 'UAH'),
      ];

      const data = updateAccumulatedDataWithPayments(payments, 2025);

      expect(data.taxes.militaryTax.q1).toBe(1000); // 1% of 100000
    });

    it('should calculate taxes on combined UAH and foreign income', () => {
      const payments: Payment[] = [
        createPayment(new Date(2025, 0, 15), 100000, 'UAH'),
        createPayment(new Date(2025, 0, 20), 50000, 'USD'),
      ];

      const data = updateAccumulatedDataWithPayments(payments, 2025);

      // Total income is 150000
      expect(data.taxes.singleTax.q1).toBe(7500); // 5% of 150000
      expect(data.taxes.militaryTax.q1).toBe(1500); // 1% of 150000
    });

    it('should round taxes to 2 decimal places', () => {
      const payments: Payment[] = [
        createPayment(new Date(2025, 0, 15), 33333.33, 'UAH'),
      ];

      const data = updateAccumulatedDataWithPayments(payments, 2025);

      // 33333.33 * 0.05 = 1666.6665, rounded to 1666.67
      expect(data.taxes.singleTax.q1).toBe(1666.67);
      // 33333.33 * 0.01 = 333.3333, rounded to 333.33
      expect(data.taxes.militaryTax.q1).toBe(333.33);
    });

    it('should aggregate payments by quarter', () => {
      const payments: Payment[] = [
        createPayment(new Date(2025, 0, 15), 100000, 'UAH'), // Q1
        createPayment(new Date(2025, 1, 15), 50000, 'UAH'), // Q1
        createPayment(new Date(2025, 4, 15), 75000, 'UAH'), // Q2
      ];

      const data = updateAccumulatedDataWithPayments(payments, 2025);

      expect(data.quarterlyIncomeUAH.q1).toBe(150000);
      expect(data.quarterlyIncomeUAH.q2).toBe(75000);
      expect(data.quarterlyIncomeUAH.q3).toBe(0);
      expect(data.quarterlyIncomeUAH.q4).toBe(0);
    });
  });

  describe('getCumulativeData', () => {
    const mockData: AccumulatedData = {
      year: 2025,
      quarterlyIncomeUAH: { q1: 100000, q2: 150000, q3: 200000, q4: 250000 },
      quarterlyIncomeForeign: { q1: 50000, q2: 75000, q3: 100000, q4: 125000 },
      taxes: {
        singleTax: { q1: 7500, q2: 11250, q3: 15000, q4: 18750 },
        militaryTax: { q1: 1500, q2: 2250, q3: 3000, q4: 3750 },
        socialContributions: { q1: 1000, q2: 1000, q3: 1000, q4: 1000 },
      },
    };

    it('should return only Q1 data for throughQuarter 1', () => {
      const result = getCumulativeData(mockData, 1);

      expect(result.incomeUAH).toBe(100000);
      expect(result.incomeForeign).toBe(50000);
      expect(result.incomeTotal).toBe(150000);
      expect(result.singleTax).toBe(7500);
      expect(result.militaryTax).toBe(1500);
    });

    it('should return Q1+Q2 data for throughQuarter 2', () => {
      const result = getCumulativeData(mockData, 2);

      expect(result.incomeUAH).toBe(250000); // 100000 + 150000
      expect(result.incomeForeign).toBe(125000); // 50000 + 75000
      expect(result.incomeTotal).toBe(375000);
      expect(result.singleTax).toBe(18750); // 7500 + 11250
      expect(result.militaryTax).toBe(3750); // 1500 + 2250
    });

    it('should return Q1+Q2+Q3 data for throughQuarter 3', () => {
      const result = getCumulativeData(mockData, 3);

      expect(result.incomeUAH).toBe(450000);
      expect(result.incomeForeign).toBe(225000);
      expect(result.incomeTotal).toBe(675000);
    });

    it('should return full year data for throughQuarter 4', () => {
      const result = getCumulativeData(mockData, 4);

      expect(result.incomeUAH).toBe(700000);
      expect(result.incomeForeign).toBe(350000);
      expect(result.incomeTotal).toBe(1050000);
      expect(result.singleTax).toBe(52500);
      expect(result.militaryTax).toBe(10500);
      expect(result.socialContributions).toBe(4000);
    });
  });

  describe('getQuarterData', () => {
    const mockData: AccumulatedData = {
      year: 2025,
      quarterlyIncomeUAH: { q1: 100000, q2: 150000, q3: 200000, q4: 250000 },
      quarterlyIncomeForeign: { q1: 50000, q2: 75000, q3: 100000, q4: 125000 },
      taxes: {
        singleTax: { q1: 7500, q2: 11250, q3: 15000, q4: 18750 },
        militaryTax: { q1: 1500, q2: 2250, q3: 3000, q4: 3750 },
        socialContributions: { q1: 1000, q2: 2000, q3: 3000, q4: 4000 },
      },
    };

    it('should return correct data for Q1', () => {
      const result = getQuarterData(mockData, 1);

      expect(result.incomeUAH).toBe(100000);
      expect(result.incomeForeign).toBe(50000);
      expect(result.incomeTotal).toBe(150000);
      expect(result.singleTax).toBe(7500);
      expect(result.militaryTax).toBe(1500);
      expect(result.socialContributions).toBe(1000);
    });

    it('should return correct data for Q2', () => {
      const result = getQuarterData(mockData, 2);

      expect(result.incomeUAH).toBe(150000);
      expect(result.incomeForeign).toBe(75000);
      expect(result.incomeTotal).toBe(225000);
      expect(result.singleTax).toBe(11250);
      expect(result.militaryTax).toBe(2250);
    });

    it('should return correct data for Q3', () => {
      const result = getQuarterData(mockData, 3);

      expect(result.incomeUAH).toBe(200000);
      expect(result.incomeForeign).toBe(100000);
    });

    it('should return correct data for Q4', () => {
      const result = getQuarterData(mockData, 4);

      expect(result.incomeUAH).toBe(250000);
      expect(result.incomeForeign).toBe(125000);
      expect(result.socialContributions).toBe(4000);
    });
  });

  describe('checkSimplifiedSystemLimit', () => {
    it('should return true when income is under 12M limit', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 1000000;
      data.quarterlyIncomeForeign.q1 = 500000;

      const result = checkSimplifiedSystemLimit(data, 1);

      expect(result).toBe(true);
    });

    it('should return false when income exceeds 12M limit', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 10000000;
      data.quarterlyIncomeForeign.q1 = 3000000;

      const result = checkSimplifiedSystemLimit(data, 1);

      expect(result).toBe(false);
    });

    it('should return true when income is exactly at 12M limit', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 12000000;

      const result = checkSimplifiedSystemLimit(data, 1);

      expect(result).toBe(true);
    });

    it('should check cumulative income across quarters', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 4000000;
      data.quarterlyIncomeUAH.q2 = 4000000;
      data.quarterlyIncomeUAH.q3 = 4000000;
      data.quarterlyIncomeUAH.q4 = 1000000; // Total: 13M

      // Through Q3: 12M - should be true
      expect(checkSimplifiedSystemLimit(data, 3)).toBe(true);

      // Through Q4: 13M - should be false
      expect(checkSimplifiedSystemLimit(data, 4)).toBe(false);
    });
  });

  describe('getSimplifiedSystemLimitUsage', () => {
    it('should return correct percentage for income under limit', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 6000000; // 50% of 12M

      const result = getSimplifiedSystemLimitUsage(data, 1);

      expect(result).toBe(50);
    });

    it('should return 100 at the limit', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 12000000;

      const result = getSimplifiedSystemLimitUsage(data, 1);

      expect(result).toBe(100);
    });

    it('should return percentage over 100 when over limit', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 15000000; // 125% of 12M

      const result = getSimplifiedSystemLimitUsage(data, 1);

      expect(result).toBe(125);
    });

    it('should round percentage to nearest integer', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 3333333; // 27.77...%

      const result = getSimplifiedSystemLimitUsage(data, 1);

      expect(result).toBe(28);
    });

    it('should include both UAH and foreign income in calculation', () => {
      const data = createEmptyAccumulatedData(2025);
      data.quarterlyIncomeUAH.q1 = 3000000;
      data.quarterlyIncomeForeign.q1 = 3000000; // Total 6M = 50%

      const result = getSimplifiedSystemLimitUsage(data, 1);

      expect(result).toBe(50);
    });
  });
});
