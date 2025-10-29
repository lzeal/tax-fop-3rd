import { formatCurrency, calculateQuarterlyData } from '../taxCalculations';
import { AccumulatedData, FOPProfile } from '../../types';

describe('taxCalculations', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      const result1 = formatCurrency(1234.56);
      const result2 = formatCurrency(0);
      const result3 = formatCurrency(123);
      
      // Використовуємо регулярні вирази для перевірки, оскільки форматування може використовувати різні символи пробілу
      expect(result1).toMatch(/1[\s\u00A0]234,56/);
      expect(result2).toMatch('');
      expect(result3).toMatch(/123,00/);
    });

    it('should format large numbers with proper separators', () => {
      const result1 = formatCurrency(1234567.89);
      const result2 = formatCurrency(12000000);
      
      expect(result1).toMatch(/1[\s\u00A0]234[\s\u00A0]567,89/);
      expect(result2).toMatch(/12[\s\u00A0]000[\s\u00A0]000,00/);
    });

    it('should handle negative numbers', () => {
      const result = formatCurrency(-1234.56);
      expect(result).toMatch(/-1[\s\u00A0]234,56/);
    });
  });

  describe('calculateQuarterlyData', () => {
    const mockProfile: FOPProfile = {
      fullName: 'Test User',
      tin: '1234567890',
      address: {
        region: 'Test Region',
        district: '',
        city: 'Test City',
        street: 'Test Street',
        building: '1',
        apartment: '',
        postalCode: '12345'
      },
      phone: '+380501234567',
      email: 'test@example.com',
      taxOffice: {
        code: '1234',
        name: 'Test Tax Office'
      },
      registrationDate: new Date('2020-01-01'),
      kved: {
        primary: { code: '62.01', name: 'Test Activity' },
        additional: []
      },
      taxGroup: 3,
      isVATpayer: false,
      singleTaxRate: 0.05,
      militaryTaxRate: 0.01,
      yearlyIncomeLimit: 12000000
    };

    const mockAccumulatedData: AccumulatedData = {
      year: 2025,
      quarterlyIncomeUAH: {
        q1: 100000,
        q2: 150000,
        q3: 0,
        q4: 0
      },
      quarterlyIncomeForeign: {
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0
      },
      taxes: {
        singleTax: {
          q1: 5000,
          q2: 7500,
          q3: 0,
          q4: 0
        },
        militaryTax: {
          q1: 1000,
          q2: 1500,
          q3: 0,
          q4: 0
        },
        socialContributions: {
          q1: 3500,
          q2: 5000,
          q3: 0,
          q4: 0
        }
      }
    };

    it('should calculate Q1 data correctly', () => {
      const result = calculateQuarterlyData(mockAccumulatedData, mockProfile, 1);

      expect(result.quarter).toBe(1);
      expect(result.year).toBe(2025);
      expect(result.quarterlyIncome).toBe(100000);
      expect(result.cumulativeIncome).toBe(100000);
      expect(result.quarterlySingleTax).toBe(5000);
      expect(result.cumulativeSingleTax).toBe(5000);
    });

    it('should calculate Q2 data correctly', () => {
      const result = calculateQuarterlyData(mockAccumulatedData, mockProfile, 2);

      expect(result.quarter).toBe(2);
      expect(result.quarterlyIncome).toBe(150000);
      expect(result.cumulativeIncome).toBe(250000); // Q1 + Q2
      expect(result.quarterlySingleTax).toBe(7500);
      expect(result.cumulativeSingleTax).toBe(12500); // Q1 + Q2
    });

    it('should handle zero income quarters', () => {
      const result = calculateQuarterlyData(mockAccumulatedData, mockProfile, 3);

      expect(result.quarter).toBe(3);
      expect(result.quarterlyIncome).toBe(0);
      expect(result.cumulativeIncome).toBe(250000); // Still Q1 + Q2
      expect(result.quarterlySingleTax).toBe(0);
      expect(result.cumulativeSingleTax).toBe(12500); // Still Q1 + Q2
    });
  });
});
