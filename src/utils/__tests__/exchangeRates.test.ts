import { getExchangeRate, getExchangeRatesForDate, convertToUAH } from '../exchangeRates';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('exchangeRates', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getExchangeRate', () => {
    it('should return exchange rate for valid currency and date', async () => {
      const mockRate = {
        r030: 840,
        txt: 'Долар США',
        rate: 41.5,
        cc: 'USD',
        exchangedate: '15.01.2025',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockRate],
      });

      const date = new Date(2025, 0, 15);
      const result = await getExchangeRate('USD', date);

      expect(result).toEqual(mockRate);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&date=20250115&json'
      );
    });

    it('should return null when API returns empty array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const date = new Date(2025, 0, 15);
      const result = await getExchangeRate('XYZ', date);

      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const date = new Date(2025, 0, 15);
      const result = await getExchangeRate('USD', date);

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const date = new Date(2025, 0, 15);
      const result = await getExchangeRate('USD', date);

      expect(result).toBeNull();
    });

    it('should format date correctly as YYYYMMDD', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Test single digit month and day
      const date = new Date(2025, 0, 5); // January 5, 2025
      await getExchangeRate('USD', date);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date=20250105')
      );
    });

    it('should handle December correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const date = new Date(2025, 11, 31); // December 31, 2025
      await getExchangeRate('EUR', date);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date=20251231')
      );
    });

    it('should include currency code in request URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const date = new Date(2025, 0, 15);
      await getExchangeRate('EUR', date);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('valcode=EUR')
      );
    });
  });

  describe('getExchangeRatesForDate', () => {
    it('should return rates for EUR and USD', async () => {
      const mockUSDRate = {
        r030: 840,
        txt: 'Долар США',
        rate: 41.5,
        cc: 'USD',
        exchangedate: '15.01.2025',
      };
      const mockEURRate = {
        r030: 978,
        txt: 'Євро',
        rate: 43.2,
        cc: 'EUR',
        exchangedate: '15.01.2025',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockEURRate],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockUSDRate],
        });

      const date = new Date(2025, 0, 15);
      const result = await getExchangeRatesForDate(date);

      expect(result).toHaveProperty('EUR');
      expect(result).toHaveProperty('USD');
      expect(result.EUR?.rate).toBe(43.2);
      expect(result.USD?.rate).toBe(41.5);
    });

    it('should return empty object on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const date = new Date(2025, 0, 15);
      const result = await getExchangeRatesForDate(date);

      expect(result).toEqual({});
    });

    it('should return partial results if one currency fails', async () => {
      const mockEURRate = {
        r030: 978,
        txt: 'Євро',
        rate: 43.2,
        cc: 'EUR',
        exchangedate: '15.01.2025',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockEURRate],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [], // USD not found
        });

      const date = new Date(2025, 0, 15);
      const result = await getExchangeRatesForDate(date);

      expect(result.EUR).toBeDefined();
      expect(result.USD).toBeUndefined();
    });
  });

  describe('convertToUAH', () => {
    it('should return original amount for UAH currency', () => {
      const result = convertToUAH(1000, 'UAH', 41.5);
      expect(result).toBe(1000);
    });

    it('should convert amount using exchange rate', () => {
      const result = convertToUAH(100, 'USD', 41.5);
      expect(result).toBe(4150);
    });

    it('should round result to 2 decimal places', () => {
      // 100 * 41.333 = 4133.3 -> should round to 4133.30
      const result = convertToUAH(100, 'USD', 41.333);
      expect(result).toBe(4133.3);
    });

    it('should handle complex rounding', () => {
      // 33.33 * 41.5555 = 1385.055315 -> should round to 1385.06
      const result = convertToUAH(33.33, 'EUR', 41.5555);
      expect(result).toBe(1385.06);
    });

    it('should return original amount if no exchange rate provided', () => {
      const result = convertToUAH(100, 'USD');
      expect(result).toBe(100);
    });

    it('should return original amount if exchange rate is 0', () => {
      const result = convertToUAH(100, 'USD', 0);
      // 0 is falsy, so should return original amount
      expect(result).toBe(100);
    });

    it('should handle large amounts correctly', () => {
      const result = convertToUAH(1000000, 'USD', 41.5);
      expect(result).toBe(41500000);
    });

    it('should handle small amounts correctly', () => {
      const result = convertToUAH(0.01, 'USD', 41.5);
      expect(result).toBe(0.42); // 0.01 * 41.5 = 0.415, rounded to 0.42
    });
  });
});
