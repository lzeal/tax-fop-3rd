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

  const currentDate = formatDateToXML(new Date());
  const reportDate = formatDateToXML(new Date());

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
    <C_REG>${getRegionCode(profile.address.region)}</C_REG>
    <C_RAJ>00</C_RAJ>
    <PERIOD_MONTH>${report.reportingPeriod.quarter * 3}</PERIOD_MONTH>
    <PERIOD_TYPE>2</PERIOD_TYPE>
    <PERIOD_YEAR>${report.reportingPeriod.year}</PERIOD_YEAR>
    <C_STI_ORIG>0000</C_STI_ORIG>
    <C_DOC_STAN>1</C_DOC_STAN>
    <LINKED_DOCS>0</LINKED_DOCS>
    <D_FILL>${currentDate}</D_FILL>
    <SOFTWARE>ФОП Калькулятор v1.0</SOFTWARE>
  </DECLARHEAD>
  
  <DECLARBODY>
    <HZN>1</HZN>
    
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
    
    <T1RXXXXG1S ROWNUM="1">
      <R001C1>${profile.kved.primary.code}</R001C1>
    </T1RXXXXG1S>
    
    ${profile.kved.additional.map((kved, index) => `
    <T1RXXXXG1S ROWNUM="${index + 2}">
      <R001C1>${kved.code}</R001C1>
    </T1RXXXXG1S>`).join('')}
    
    <R006G3>${(report.incomeSection.totalIncome.cumulativeFromYearStart).toFixed(2)}</R006G3>
    <R008G3>${(report.incomeSection.totalIncome.cumulativeFromYearStart).toFixed(2)}</R008G3>
    <R011G3>${(report.singleTaxSection.calculatedTax).toFixed(2)}</R011G3>
    <R012G3>${(report.singleTaxSection.calculatedTax).toFixed(2)}</R012G3>
    <R013G3>${(report.singleTaxSection.previouslyPaid).toFixed(2)}</R013G3>
    <R0141G3>${(report.singleTaxSection.toPay).toFixed(2)}</R0141G3>
    <R014G3>${(report.singleTaxSection.toPay).toFixed(2)}</R014G3>

    <R023G3>${(report.militaryTaxSection.calculatedTax).toFixed(2)}</R023G3>
    <R024G3>${(report.militaryTaxSection.previouslyPaid).toFixed(2)}</R024G3>
    <R025G3>${(report.militaryTaxSection.toPay).toFixed(2)}</R025G3>
    
    <HFILL>${reportDate}</HFILL>
    <HKEXECUTOR>${profile.tin}</HKEXECUTOR>
    <HBOS>${profile.fullName}</HBOS>
  </DECLARBODY>
</DECLAR>`;

  return xml;
};

// Допоміжна функція для отримання коду регіону
const getRegionCode = (region: string): string => {
  const regionCodes: Record<string, string> = {
    'Вінницька область': '05',
    'Волинська область': '07',
    'Дніпропетровська область': '12',
    'Донецька область': '14',
    'Житомирська область': '18',
    'Закарпатська область': '21',
    'Запорізька область': '23',
    'Івано-Франківська область': '26',
    'Київська область': '32',
    'Кіровоградська область': '35',
    'Луганська область': '44',
    'Львівська область': '46',
    'Миколаївська область': '48',
    'Одеська область': '51',
    'Полтавська область': '53',
    'Рівненська область': '56',
    'Сумська область': '59',
    'Тернопільська область': '61',
    'Харківська область': '63',
    'Херсонська область': '65',
    'Хмельницька область': '68',
    'Черкаська область': '71',
    'Чернівецька область': '73',
    'Чернігівська область': '74',
    'м. Київ': '80',
    'м. Севастополь': '85'
  };
  
  return regionCodes[region] || '00';
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