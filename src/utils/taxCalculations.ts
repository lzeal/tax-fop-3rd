import { AccumulatedData, QuarterlyCalculation, FOPProfile } from '../types';

// Розрахунок данных для конкретного кварталу
export const calculateQuarterlyData = (
  accumulatedData: AccumulatedData,
  profile: FOPProfile,
  targetQuarter: number
): QuarterlyCalculation => {
  
  // Доходи накопичувальним підсумком до цільового кварталу
  const getCumulativeIncome = (quarter: number): number => {
    let total = 0;
    for (let q = 1; q <= quarter; q++) {
      const qKey = `q${q}` as keyof typeof accumulatedData.quarterlyIncomeUAH;
      total += accumulatedData.quarterlyIncomeUAH[qKey] + accumulatedData.quarterlyIncomeForeign[qKey];
    }
    return total;
  };

  // Податки накопичувальним підсумком
  const getCumulativeTax = (taxType: 'singleTax' | 'militaryTax', quarter: number): number => {
    let total = 0;
    for (let q = 1; q <= quarter; q++) {
      const qKey = `q${q}` as keyof typeof accumulatedData.taxes.singleTax;
      total += accumulatedData.taxes[taxType][qKey];
    }
    return total;
  };

  // Доходи за поточний квартал
  const quarterKey = `q${targetQuarter}` as keyof typeof accumulatedData.quarterlyIncomeUAH;
  const quarterlyIncome = accumulatedData.quarterlyIncomeUAH[quarterKey] + 
                         accumulatedData.quarterlyIncomeForeign[quarterKey];
  
  // Доходи накопичувальним підсумком
  const cumulativeIncome = getCumulativeIncome(targetQuarter);

  // Розрахунок податків за квартал та накопичувальним підсумком (заокруглення до копійок)
  const quarterlySingleTax = Math.round((quarterlyIncome * profile.singleTaxRate) * 100) / 100;
  const quarterlyMilitaryTax = Math.round((quarterlyIncome * profile.militaryTaxRate) * 100) / 100;
  
  const cumulativeSingleTax = Math.round((cumulativeIncome * profile.singleTaxRate) * 100) / 100;
  const cumulativeMilitaryTax = Math.round((cumulativeIncome * profile.militaryTaxRate) * 100) / 100;

  // Фактично сплачені податки (з накопичених даних)
  const quarterlySingleTaxPaid = accumulatedData.taxes.singleTax[quarterKey];
  const quarterlyMilitaryTaxPaid = accumulatedData.taxes.militaryTax[quarterKey];
  
  const cumulativeSingleTaxPaid = getCumulativeTax('singleTax', targetQuarter);
  const cumulativeMilitaryTaxPaid = getCumulativeTax('militaryTax', targetQuarter);

  // ЄСВ розрахунки
  const quarterlySocialContributions = accumulatedData.taxes.socialContributions[quarterKey];
  const cumulativeSocialContributions = getCumulativeTax('socialContributions' as any, targetQuarter);

  return {
    quarter: targetQuarter,
    year: accumulatedData.year,
    quarterlyIncome,
    cumulativeIncome,
    quarterlySingleTax,
    cumulativeSingleTax,
    quarterlySingleTaxPaid,
    cumulativeSingleTaxPaid,
    quarterlyMilitaryTax,
    cumulativeMilitaryTax,
    quarterlyMilitaryTaxPaid,
    cumulativeMilitaryTaxPaid,
    quarterlySocialContributions,
    cumulativeSocialContributions
  };
};

// Перевірка лімітів спрощеної системи
export const checkTaxLimits = (
  calculation: QuarterlyCalculation,
  profile: FOPProfile
): { 
  withinLimits: boolean; 
  warningMessage?: string;
  limitExceeded?: boolean;
} => {
  const yearlyLimit = profile.yearlyIncomeLimit;
  const currentIncome = calculation.cumulativeIncome;
  
  if (currentIncome > yearlyLimit) {
    return {
      withinLimits: false,
      limitExceeded: true,
      warningMessage: `Перевищено річний ліміт доходів для ${profile.taxGroup} групи (${yearlyLimit.toLocaleString()} грн). Поточний дохід: ${currentIncome.toLocaleString()} грн.`
    };
  }
  
  // Попередження при досягненні 90% ліміту
  if (currentIncome > yearlyLimit * 0.9) {
    return {
      withinLimits: true,
      warningMessage: `Увага! Досягнуто 90% річного ліміту доходів. Залишилось: ${(yearlyLimit - currentIncome).toLocaleString()} грн.`
    };
  }
  
  return { withinLimits: true };
};

// Форматування грошової суми
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Розрахунок суми до доплати/повернення
export const calculateTaxBalance = (calculated: number, paid: number): {
  toPay: number;
  toReturn: number;
} => {
  const difference = calculated - paid;
  return {
    toPay: Math.max(0, difference),
    toReturn: Math.max(0, -difference)
  };
};