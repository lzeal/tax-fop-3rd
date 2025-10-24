import { ExchangeRate } from '../types';

const NBU_API_BASE = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange';

export const getExchangeRate = async (
  currencyCode: string,
  date: Date
): Promise<ExchangeRate | null> => {
  try {
    console.log('Fetching exchange rate for', currencyCode, 'on', date);
    
    // Використовуємо локальну дату, щоб уникнути проблем з timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    
    console.log('dateString:', dateString);
    const url = `${NBU_API_BASE}?valcode=${currencyCode}&date=${dateString}&json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ExchangeRate[] = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error fetching exchange rate for ${currencyCode}:`, error);
    return null;
  }
};

export const getExchangeRatesForDate = async (
  date: Date
): Promise<Record<string, ExchangeRate>> => {
  const currencies = ['EUR', 'USD'];
  const rates: Record<string, ExchangeRate> = {};
  
  try {
    const promises = currencies.map(async (currency) => {
      const rate = await getExchangeRate(currency, date);
      if (rate) {
        rates[currency] = rate;
      }
      return rate;
    });
    
    await Promise.all(promises);
    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
};

export const convertToUAH = (
  amount: number,
  currencyCode: string,
  exchangeRate?: number
): number => {
  if (currencyCode === 'UAH') {
    return amount;
  }
  
  if (!exchangeRate) {
    console.warn(`No exchange rate provided for ${currencyCode}`);
    return amount; // Return original amount if no rate
  }
  
  // Заокруглюємо до копійок (2 знаки після коми)
  return Math.round((amount * exchangeRate) * 100) / 100;
};