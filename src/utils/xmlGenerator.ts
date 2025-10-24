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
      previouslyPaid: 0, // Поки що 0, потрібно додати функціонал попередніх платежів
      toPay: cumulativeData.singleTax
    },
    
    militaryTaxSection: {
      taxableIncome: cumulativeData.incomeTotal,
      taxRate: profile.militaryTaxRate,
      calculatedTax: cumulativeData.militaryTax,
      previouslyPaid: 0, // Поки що 0
      toPay: cumulativeData.militaryTax
    }
  };
};

// Перетворення звіту в XML формат
export const generateXML = (report: TaxReportF0103309, profile: FOPProfile): string => {
  const currentDate = new Date().toISOString().split('T')[0];
  const reportDate = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="windows-1251"?>
<DECLAR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:noNamespaceSchemaLocation="F0103309.xsd">
  <DECLARHEAD>
    <TIN>${profile.tin}</TIN>
    <C_DOC>F01</C_DOC>
    <C_DOC_SUB>033</C_DOC_SUB>
    <C_DOC_VER>9</C_DOC_VER>
    <C_DOC_TYPE>0</C_DOC_TYPE>
    <C_DOC_CNT>0</C_DOC_CNT>
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
    <!-- Відмітка про звітний період -->
    <HZN>1</HZN>
    
    <!-- Квартальна звітність -->
    ${report.reportingPeriod.quarter === 1 ? '<H1KV>1</H1KV>' : ''}
    ${report.reportingPeriod.quarter === 2 ? '<HHY>1</HHY>' : ''}
    ${report.reportingPeriod.quarter === 3 ? '<H3KV>1</H3KV>' : ''}
    ${report.reportingPeriod.quarter === 4 ? '<HY>1</HY>' : ''}
    
    <!-- Звітний рік -->
    <HZY>${report.reportingPeriod.year}</HZY>
    
    <!-- Код податкової -->
    <HSTI>0000</HSTI>
    
    <!-- Найменування платника податків -->
    <HNAME>${profile.fullName}</HNAME>
    
    <!-- Місцезнаходження -->
    <HLOC>${formatAddress(profile.address)}</HLOC>
    
    <!-- Email (опціонально) -->
    ${profile.email ? `<HEMAIL>${profile.email}</HEMAIL>` : ''}
    
    <!-- Телефон (опціонально) -->
    ${profile.phone ? `<HTEL>${profile.phone}</HTEL>` : ''}
    
    <!-- ІПН платника -->
    <HTIN>${profile.tin}</HTIN>
    
    <!-- Кількість листів додатків -->
    <HNACTL>0</HNACTL>
    
    <!-- Таблиця 1: КВЕДи -->
    <T1RXXXXG1S ROWNUM="1">
      <R001C1>${profile.kved.primary}</R001C1>
    </T1RXXXXG1S>
    
    <!-- Додаткові КВЕДи -->
    ${profile.kved.additional.map((kved, index) => `
    <T1RXXXXG1S ROWNUM="${index + 2}">
      <R001C1>${kved}</R001C1>
    </T1RXXXXG1S>`).join('')}
    
    <!-- Таблиця 2: Опис доходів -->
    <T1RXXXXG2S ROWNUM="1">
      <R001C2>Доходи від підприємницької діяльності</R001C2>
    </T1RXXXXG2S>
    
    <!-- Доходи у звітному кварталі -->
    <R02G1>${(report.incomeSection.nationalCurrencyIncome.currentQuarter).toFixed(2)}</R02G1>
    <R02G2>${(report.incomeSection.foreignCurrencyIncome.currentQuarter).toFixed(2)}</R02G2>
    <R02G3>${(report.incomeSection.totalIncome.currentQuarter).toFixed(2)}</R02G3>
    
    <!-- Доходи з початку звітного року -->
    <R001G3>${(report.incomeSection.nationalCurrencyIncome.cumulativeFromYearStart).toFixed(2)}</R001G3>
    <R002G3>${(report.incomeSection.foreignCurrencyIncome.cumulativeFromYearStart).toFixed(2)}</R002G3>
    
    <!-- Загальна сума доходів з початку року -->
    <R003G3>${(report.incomeSection.totalIncome.cumulativeFromYearStart).toFixed(2)}</R003G3>
    
    <!-- Сума єдиного податку до сплати -->
    <R015G3>${(report.singleTaxSection.calculatedTax).toFixed(2)}</R015G3>
    
    <!-- Сума військового збору до сплати -->
    <R021G3>${(report.militaryTaxSection.calculatedTax).toFixed(2)}</R021G3>
    
    <!-- Дата заповнення -->
    <HFILL>${reportDate}</HFILL>
    
    <!-- Особа, відповідальна за достовірність відомостей -->
    <HBOS>1</HBOS>
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
  
  if (!profile.kved.primary.trim()) {
    errors.push('Основний КВЕД є обов\'язковим');
  }
  
  if (report.incomeSection.totalIncome.cumulativeFromYearStart <= 0) {
    errors.push('Сума доходів повинна бути більшою за 0');
  }
  
  if (report.incomeSection.totalIncome.cumulativeFromYearStart > profile.yearlyIncomeLimit) {
    errors.push(`Доходи перевищують ліміт для 3-ї групи (${profile.yearlyIncomeLimit.toLocaleString('uk-UA')} грн)`);
  }
  
  return errors;
};