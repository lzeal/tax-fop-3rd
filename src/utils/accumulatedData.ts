import { Payment, AccumulatedData } from '../types';
import { getQuarter } from 'date-fns';

const ACCUMULATED_DATA_STORAGE_KEY = 'fop-accumulated-data';

// Створення порожньої накопичувальної структури для року
export const createEmptyAccumulatedData = (year: number): AccumulatedData => ({
  year,
  quarterlyIncomeUAH: {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
  },
  quarterlyIncomeForeign: {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
  },
  taxes: {
    singleTax: {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
    },
    militaryTax: {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
    },
    socialContributions: {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
    },
  },
});

// Завантаження накопичувальних даних
export const loadAccumulatedData = (year: number): AccumulatedData => {
  try {
    const stored = localStorage.getItem(`${ACCUMULATED_DATA_STORAGE_KEY}-${year}`);
    if (!stored) {
      return createEmptyAccumulatedData(year);
    }
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading accumulated data:', error);
    return createEmptyAccumulatedData(year);
  }
};

// Збереження накопичувальних даних
export const saveAccumulatedData = (data: AccumulatedData): void => {
  try {
    localStorage.setItem(`${ACCUMULATED_DATA_STORAGE_KEY}-${data.year}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving accumulated data:', error);
    throw new Error('Не вдалося зберегти накопичувальні дані');
  }
};

// Визначення номера кварталу для платежу
export const getPaymentQuarter = (payment: Payment): 1 | 2 | 3 | 4 => {
  return getQuarter(payment.date) as 1 | 2 | 3 | 4;
};

// Оновлення накопичувальних даних новими платежами
export const updateAccumulatedDataWithPayments = (
  payments: Payment[], 
  year: number
): AccumulatedData => {
  const data = loadAccumulatedData(year);
  
  // Скидаємо поточні дані для перерахунку
  data.quarterlyIncomeUAH = { q1: 0, q2: 0, q3: 0, q4: 0 };
  data.quarterlyIncomeForeign = { q1: 0, q2: 0, q3: 0, q4: 0 };
  
  // Фільтруємо платежі за роком та групуємо по кварталах
  const yearPayments = payments.filter(p => p.date.getFullYear() === year);
  
  yearPayments.forEach(payment => {
    const quarter = getPaymentQuarter(payment);
    const quarterKey = `q${quarter}` as keyof typeof data.quarterlyIncomeUAH;
    
    if (payment.currencyCode === 'UAH') {
      data.quarterlyIncomeUAH[quarterKey] += payment.amountUAH;
    } else {
      data.quarterlyIncomeForeign[quarterKey] += payment.amountUAH;
    }
  });
  
  // Перерахунок податків
  data.taxes = calculateTaxes(data);
  console.log('Updated accumulated data:', data);
  
  saveAccumulatedData(data);
  return data;
};

// Розрахунок податків на основі доходів
const calculateTaxes = (data: AccumulatedData) => {
  const singleTaxRate = 0.05; // 5%
  const militaryTaxRate = 0.01; // 1%
  
  const result = {
    singleTax: { q1: 0, q2: 0, q3: 0, q4: 0 },
    militaryTax: { q1: 0, q2: 0, q3: 0, q4: 0 },
    socialContributions: { q1: 0, q2: 0, q3: 0, q4: 0 }, // Поки що 0, розраховуємо окремо
  };
  
  // Розрахунок по кварталах
  (['q1', 'q2', 'q3', 'q4'] as const).forEach(quarter => {
    const totalIncome = data.quarterlyIncomeUAH[quarter] + data.quarterlyIncomeForeign[quarter];
    
    // Заокруглюємо податки до копійок (2 знаки після коми)
    result.singleTax[quarter] = Math.round((totalIncome * singleTaxRate) * 100) / 100;
    result.militaryTax[quarter] = Math.round((totalIncome * militaryTaxRate) * 100) / 100;
  });
  
  return result;
};

// Отримання накопичувальних сум за період
export const getCumulativeData = (data: AccumulatedData, throughQuarter: 1 | 2 | 3 | 4) => {
  const quarters = ['q1', 'q2', 'q3', 'q4'].slice(0, throughQuarter) as Array<keyof typeof data.quarterlyIncomeUAH>;
  
  const cumulativeUAH = quarters.reduce((sum, q) => sum + data.quarterlyIncomeUAH[q], 0);
  const cumulativeForeign = quarters.reduce((sum, q) => sum + data.quarterlyIncomeForeign[q], 0);
  const cumulativeTotal = cumulativeUAH + cumulativeForeign;
  
  const cumulativeSingleTax = quarters.reduce((sum, q) => sum + data.taxes.singleTax[q], 0);
  const cumulativeMilitaryTax = quarters.reduce((sum, q) => sum + data.taxes.militaryTax[q], 0);
  const cumulativeSocialContributions = quarters.reduce((sum, q) => sum + data.taxes.socialContributions[q], 0);
  
  return {
    incomeUAH: cumulativeUAH,
    incomeForeign: cumulativeForeign,
    incomeTotal: cumulativeTotal,
    singleTax: cumulativeSingleTax,
    militaryTax: cumulativeMilitaryTax,
    socialContributions: cumulativeSocialContributions,
  };
};

// Отримання даних за конкретний квартал
export const getQuarterData = (data: AccumulatedData, quarter: 1 | 2 | 3 | 4) => {
  const quarterKey = `q${quarter}` as keyof typeof data.quarterlyIncomeUAH;
  
  return {
    incomeUAH: data.quarterlyIncomeUAH[quarterKey],
    incomeForeign: data.quarterlyIncomeForeign[quarterKey],
    incomeTotal: data.quarterlyIncomeUAH[quarterKey] + data.quarterlyIncomeForeign[quarterKey],
    singleTax: data.taxes.singleTax[quarterKey],
    militaryTax: data.taxes.militaryTax[quarterKey],
    socialContributions: data.taxes.socialContributions[quarterKey],
  };
};

// Перевірка чи перевищують доходи ліміт спрощеної системи
export const checkSimplifiedSystemLimit = (data: AccumulatedData, throughQuarter: 1 | 2 | 3 | 4): boolean => {
  const yearlyLimit = 12000000; // 12 млн грн
  const cumulativeData = getCumulativeData(data, throughQuarter);
  
  return cumulativeData.incomeTotal <= yearlyLimit;
};

// Отримання відсотка використання ліміту
export const getSimplifiedSystemLimitUsage = (data: AccumulatedData, throughQuarter: 1 | 2 | 3 | 4): number => {
  const yearlyLimit = 12000000; // 12 млн грн
  const cumulativeData = getCumulativeData(data, throughQuarter);
  
  return Math.round((cumulativeData.incomeTotal / yearlyLimit) * 100);
};