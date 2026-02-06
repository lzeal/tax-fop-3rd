import { getCurrentQuarter, getQuarterRange, formatDate, getQuarterDisplayName } from '../dateUtils';
import { Quarter } from '../../types';

describe('dateUtils', () => {
  describe('getCurrentQuarter', () => {
    const RealDate = Date;

    afterEach(() => {
      global.Date = RealDate;
    });

    const mockDate = (dateString: string) => {
      const mockNow = new RealDate(dateString).getTime();
      global.Date = class extends RealDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(mockNow);
          } else {
            // @ts-ignore
            super(...args);
          }
        }
        static now() {
          return mockNow;
        }
      } as DateConstructor;
    };

    it('should return Q4 of previous year when in Q1', () => {
      mockDate('2025-02-15');
      const result = getCurrentQuarter();
      expect(result.quarter).toBe(4);
      expect(result.year).toBe(2024);
    });

    it('should return Q1 when in Q2', () => {
      mockDate('2025-05-15');
      const result = getCurrentQuarter();
      expect(result.quarter).toBe(1);
      expect(result.year).toBe(2025);
    });

    it('should return Q2 when in Q3', () => {
      mockDate('2025-08-15');
      const result = getCurrentQuarter();
      expect(result.quarter).toBe(2);
      expect(result.year).toBe(2025);
    });

    it('should return Q3 when in Q4', () => {
      mockDate('2025-11-15');
      const result = getCurrentQuarter();
      expect(result.quarter).toBe(3);
      expect(result.year).toBe(2025);
    });

    it('should handle January correctly (Q4 of previous year)', () => {
      mockDate('2025-01-01');
      const result = getCurrentQuarter();
      expect(result.quarter).toBe(4);
      expect(result.year).toBe(2024);
    });

    it('should handle April correctly (Q1 of current year)', () => {
      mockDate('2025-04-01');
      const result = getCurrentQuarter();
      expect(result.quarter).toBe(1);
      expect(result.year).toBe(2025);
    });
  });

  describe('getQuarterRange', () => {
    it('should return correct range for Q1', () => {
      const quarter: Quarter = { year: 2025, quarter: 1 };
      const result = getQuarterRange(quarter);

      expect(result.start.getFullYear()).toBe(2025);
      expect(result.start.getMonth()).toBe(0); // January
      expect(result.start.getDate()).toBe(1);

      expect(result.end.getFullYear()).toBe(2025);
      expect(result.end.getMonth()).toBe(2); // March
      expect(result.end.getDate()).toBe(31);
    });

    it('should return correct range for Q2', () => {
      const quarter: Quarter = { year: 2025, quarter: 2 };
      const result = getQuarterRange(quarter);

      expect(result.start.getMonth()).toBe(3); // April
      expect(result.start.getDate()).toBe(1);

      expect(result.end.getMonth()).toBe(5); // June
      expect(result.end.getDate()).toBe(30);
    });

    it('should return correct range for Q3', () => {
      const quarter: Quarter = { year: 2025, quarter: 3 };
      const result = getQuarterRange(quarter);

      expect(result.start.getMonth()).toBe(6); // July
      expect(result.start.getDate()).toBe(1);

      expect(result.end.getMonth()).toBe(8); // September
      expect(result.end.getDate()).toBe(30);
    });

    it('should return correct range for Q4', () => {
      const quarter: Quarter = { year: 2025, quarter: 4 };
      const result = getQuarterRange(quarter);

      expect(result.start.getMonth()).toBe(9); // October
      expect(result.start.getDate()).toBe(1);

      expect(result.end.getMonth()).toBe(11); // December
      expect(result.end.getDate()).toBe(31);
    });

    it('should set end date to 23:59:59.999', () => {
      const quarter: Quarter = { year: 2025, quarter: 1 };
      const result = getQuarterRange(quarter);

      expect(result.end.getHours()).toBe(23);
      expect(result.end.getMinutes()).toBe(59);
      expect(result.end.getSeconds()).toBe(59);
      expect(result.end.getMilliseconds()).toBe(999);
    });

    it('should handle leap year February correctly', () => {
      const quarter: Quarter = { year: 2024, quarter: 1 };
      const result = getQuarterRange(quarter);

      // 2024 is a leap year, but Q1 ends March 31 regardless
      expect(result.end.getMonth()).toBe(2); // March
      expect(result.end.getDate()).toBe(31);
    });
  });

  describe('formatDate', () => {
    it('should format date in Ukrainian locale', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      const result = formatDate(date);

      // Ukrainian format: dd.MM.yyyy
      expect(result).toMatch(/15\.01\.2025/);
    });

    it('should handle single digit day and month', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      const result = formatDate(date);

      // Should be zero-padded
      expect(result).toMatch(/05\.01\.2025/);
    });

    it('should handle December correctly', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      const result = formatDate(date);

      expect(result).toMatch(/31\.12\.2025/);
    });
  });

  describe('getQuarterDisplayName', () => {
    it('should return correct display name for Q1', () => {
      const quarter: Quarter = { year: 2025, quarter: 1 };
      const result = getQuarterDisplayName(quarter);

      expect(result).toBe('1 квартал 2025');
    });

    it('should return correct display name for Q2', () => {
      const quarter: Quarter = { year: 2025, quarter: 2 };
      const result = getQuarterDisplayName(quarter);

      expect(result).toBe('2 квартал 2025');
    });

    it('should return correct display name for Q3', () => {
      const quarter: Quarter = { year: 2024, quarter: 3 };
      const result = getQuarterDisplayName(quarter);

      expect(result).toBe('3 квартал 2024');
    });

    it('should return correct display name for Q4', () => {
      const quarter: Quarter = { year: 2024, quarter: 4 };
      const result = getQuarterDisplayName(quarter);

      expect(result).toBe('4 квартал 2024');
    });
  });
});
