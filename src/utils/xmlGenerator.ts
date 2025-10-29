import { TaxReportF0103309, FOPProfile, AccumulatedData } from '../types';
import { getCumulativeData, getQuarterData } from './accumulatedData';

// Генерація звіту F0103309 на основі профілю ФОП та накопичувальних даних
export const generateTaxReport = (
  profile: FOPProfile,
  accumulatedData: AccumulatedData,
  quarter: 1 | 2 | 3 | 4
): TaxReportF0103309 => {
  const cumulativeData = getCumulativeData(accumulatedData, quarter);
  const quarterData = getQuarterData(accumulatedData, quarter);

  return {
    reportingPeriod: {
      year: accumulatedData.year,
      quarter
    },

    incomeSection: {
      nationalCurrencyIncome: {
        currentQuarter: quarterData.incomeUAH,
        cumulativeFromYearStart: cumulativeData.incomeUAH
      },
      foreignCurrencyIncome: {
        currentQuarter: quarterData.incomeForeign,
        cumulativeFromYearStart: cumulativeData.incomeForeign
      },
      totalIncome: {
        currentQuarter: quarterData.incomeTotal,
        cumulativeFromYearStart: cumulativeData.incomeTotal
      }
    },
    
    singleTaxSection: {
      taxableIncome: cumulativeData.incomeTotal,
      taxRate: profile.singleTaxRate,
      calculatedTax: cumulativeData.singleTax,
      previouslyPaid: cumulativeData.singleTax - quarterData.singleTax,
      toPay: quarterData.singleTax
    },
    
    militaryTaxSection: {
      taxableIncome: cumulativeData.incomeTotal,
      taxRate: profile.militaryTaxRate,
      calculatedTax: cumulativeData.militaryTax,
      previouslyPaid: cumulativeData.militaryTax - quarterData.militaryTax,
      toPay: quarterData.militaryTax
    }
  };
};

// Перетворення звіту в XML формат
export const generateXML = (report: TaxReportF0103309, profile: FOPProfile): string => {
  const formatDateToXML = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}${month}${year}`;
  };

  // Визначення типу періоду: 1-місяць, 2-квартал, 3-півріччя, 4-9міс, 5-рік
  const getPeriodType = (): string => {
    switch (report.reportingPeriod.quarter) {
      case 1: return '2'; // 1-й квартал
      case 2: return '3'; // півріччя (за 6 місяців)
      case 3: return '4'; // 9 місяців
      case 4: return '5'; // рік
      default: return '2';
    }
  };

  const currentDate = formatDateToXML(new Date());
  const reportDate = formatDateToXML(new Date());
  
  const { region, district } = parseTaxOfficeCode(profile.taxOffice.code);

  // const xml = `<?xml version="1.0" encoding="windows-1251"?>
  const xml = `<?xml version="1.0"?>
<DECLAR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:noNamespaceSchemaLocation="F0103309.xsd">
  <DECLARHEAD>
    <TIN>${profile.tin}</TIN>
    <C_DOC>F01</C_DOC>
    <C_DOC_SUB>033</C_DOC_SUB>
    <C_DOC_VER>9</C_DOC_VER>
    <C_DOC_TYPE>0</C_DOC_TYPE>
    <C_DOC_CNT>1</C_DOC_CNT>
    <C_REG>${region}</C_REG>
    <C_RAJ>${district}</C_RAJ>
    <PERIOD_MONTH>${report.reportingPeriod.quarter * 3}</PERIOD_MONTH>
    <PERIOD_TYPE>${getPeriodType()}</PERIOD_TYPE>
    <PERIOD_YEAR>${report.reportingPeriod.year}</PERIOD_YEAR>
    <C_STI_ORIG>${profile.taxOffice.code}</C_STI_ORIG>
    <C_DOC_STAN>1</C_DOC_STAN>
    <LINKED_DOCS xsi:nil="true"/>
    <D_FILL>${currentDate}</D_FILL>
    <SOFTWARE>ФОП Калькулятор v1.0</SOFTWARE>
  </DECLARHEAD>
  
  <DECLARBODY>
    <HZ>1</HZ>
    
    ${report.reportingPeriod.quarter === 1 ? '<H1KV>1</H1KV>' : ''}
    ${report.reportingPeriod.quarter === 2 ? '<HHY>1</HHY>' : ''}
    ${report.reportingPeriod.quarter === 3 ? '<H3KV>1</H3KV>' : ''}
    ${report.reportingPeriod.quarter === 4 ? '<HY>1</HY>' : ''}
    
    <HZY>${report.reportingPeriod.year}</HZY>
    
    <HSTI>${profile.taxOffice.name}</HSTI>
    
    <HNAME>${profile.fullName}</HNAME>
    
    <HLOC>${formatAddress(profile.address)}</HLOC>
    
    ${profile.email ? `<HEMAIL>${profile.email}</HEMAIL>` : ''}
    
    ${profile.phone ? `<HTEL>${profile.phone}</HTEL>` : ''}
    
    <HTIN>${profile.tin}</HTIN>
    
    <HNACTL>0</HNACTL>
    
    <T1RXXXXG1S ROWNUM="1">${profile.kved.primary.code}</T1RXXXXG1S>
    ${profile.kved.additional.map((kved, index) => `<T1RXXXXG1S ROWNUM="${index + 2}">${kved.code}</T1RXXXXG1S>`).join('')}
    <T1RXXXXG2S ROWNUM="1">${profile.kved.primary.name}</T1RXXXXG2S>
    ${profile.kved.additional.map((kved, index) => `<T1RXXXXG2S ROWNUM="${index + 2}">${kved.name}</T1RXXXXG2S>`).join('')}
    
    <R006G3>${(report.incomeSection.totalIncome.cumulativeFromYearStart).toFixed(2)}</R006G3>
    <R008G3>${(report.incomeSection.totalIncome.cumulativeFromYearStart).toFixed(2)}</R008G3>
    <R011G3>${(report.singleTaxSection.calculatedTax).toFixed(2)}</R011G3>
    <R012G3>${(report.singleTaxSection.calculatedTax).toFixed(2)}</R012G3>
    <R013G3>${(report.singleTaxSection.previouslyPaid).toFixed(2)}</R013G3>
    <R0141G3>${(report.singleTaxSection.toPay).toFixed(2)}</R0141G3>
    <R014G3>${(report.singleTaxSection.toPay).toFixed(2)}</R014G3>

    <R08G1 xsi:nil="true"/>
    <R08G2 xsi:nil="true"/>
    <R08G3 xsi:nil="true"/>
    <R08G4 xsi:nil="true"/>
    <R08G5 xsi:nil="true"/>
    <R08G6 xsi:nil="true"/>
    <R08G7 xsi:nil="true"/>
    <R08G8 xsi:nil="true"/>
    <R08G9 xsi:nil="true"/>
    <R08G10 xsi:nil="true"/>
    <R08G11 xsi:nil="true"/>
    <R08G12 xsi:nil="true"/>

    <R023G3>${(report.militaryTaxSection.calculatedTax).toFixed(2)}</R023G3>
    <R024G3>${(report.militaryTaxSection.previouslyPaid).toFixed(2)}</R024G3>
    <R025G3>${(report.militaryTaxSection.toPay).toFixed(2)}</R025G3>
    <HD1 xsi:nil="true"/>
    <HD2 xsi:nil="true"/>
    <HFILL>${reportDate}</HFILL>
    <HKEXECUTOR>${profile.tin}</HKEXECUTOR>
    <HBOS>${profile.fullName}</HBOS>
  </DECLARBODY>
</DECLAR>`;

  return xml;
};

// Допоміжна функція для форматування адреси
const formatAddress = (address: FOPProfile['address']): string => {
  const parts = [
    address.postalCode,
    address.region,
    address.district,
    address.city,
    `${address.street}, ${address.building}${address.apartment ? `, кв. ${address.apartment}` : ''}`
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Допоміжна функція для розбору коду податкової
export const parseTaxOfficeCode = (code: string): { region: string; district: string } => {
  if (!/^\d{4}$/.test(code)) {
    throw new Error('Код податкової повинен містити 4 цифри');
  }
  
  return {
    region: code.substring(0, 2),
    district: code.substring(2, 4)
  };
};

// Завантаження XML файлу
export const downloadXML = (xml: string, filename: string = 'F0103309.xml'): void => {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Валідація звіту перед генерацією XML
export const validateReport = (report: TaxReportF0103309, profile: FOPProfile): string[] => {
  const errors: string[] = [];
  
  if (!profile.tin || profile.tin.length !== 10) {
    errors.push('ІПН повинен містити 10 цифр');
  }
  
  if (!profile.taxOffice.code || profile.taxOffice.code.length !== 4) {
    errors.push('Код податкової повинен містити 4 цифри');
  }
  
  if (!profile.fullName.trim()) {
    errors.push('ПІБ є обов\'язковим');
  }
  
  if (!profile.kved.primary.code.trim()) {
    errors.push('Код основного КВЕДу є обов\'язковим');
  }
  
  if (!profile.kved.primary.name.trim()) {
    errors.push('Назва основного КВЕДу є обов\'язковою');
  }
  
  if (report.incomeSection.totalIncome.cumulativeFromYearStart <= 0) {
    errors.push('Сума доходів повинна бути більшою за 0');
  }
  
  if (report.incomeSection.totalIncome.cumulativeFromYearStart > profile.yearlyIncomeLimit) {
    errors.push(`Доходи перевищують ліміт для 3-ї групи (${profile.yearlyIncomeLimit.toLocaleString('uk-UA')} грн)`);
  }
  
  return errors;
};