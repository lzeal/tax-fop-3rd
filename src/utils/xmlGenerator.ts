import { TaxReportF0103309, FOPProfile, AccumulatedData } from '../types';
import { getCumulativeData, getQuarterData } from './accumulatedData';

// Визначення типу періоду для кварталу: 1-місяць, 2-квартал, 3-півріччя, 4-9міс, 5-рік
export const getPeriodTypeCode = (quarter: 1 | 2 | 3 | 4): string => {
  switch (quarter) {
    case 1: return '2';
    case 2: return '3';
    case 3: return '4';
    case 4: return '5';
    default: return '2';
  }
};

// Генерація офіційного імені файлу за стандартом ДПС
// Формат: {C_STI_ORIG}{TIN}{C_DOC}{C_DOC_SUB}{C_DOC_VER(02)}{C_DOC_STAN}{C_DOC_CNT(00000001)}{PERIOD_TYPE}{PERIOD_MONTH(02)}{PERIOD_YEAR}{C_STI_ORIG}.xml
export const generateDPSFilename = (
  profile: FOPProfile,
  docSub: string,
  periodType: string,
  periodMonth: number,
  year: number,
): string => {
  const cDoc = 'F01';
  const cDocVer = '09';
  const cDocStan = '1';
  const cDocCnt = '00000001';

  return [
    profile.taxOffice.code,
    profile.tin,
    cDoc,
    docSub,
    cDocVer,
    cDocStan,
    cDocCnt,
    periodType,
    periodMonth.toString().padStart(2, '0'),
    year.toString(),
    profile.taxOffice.code,
  ].join('') + '.xml';
};

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
export const generateXML = (report: TaxReportF0103309, profile: FOPProfile, linkedESVFilename: string | null = null): string => {
  const formatDateToXML = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}${month}${year}`;
  };

  const currentDate = formatDateToXML(new Date());
  const reportDate = formatDateToXML(new Date());

  const { region, district } = parseTaxOfficeCode(profile.taxOffice.code);

  const linkedDocsXml = linkedESVFilename
    ? `<LINKED_DOCS>
      <DOC NUM="1" TYPE="1">
        <C_DOC>F01</C_DOC>
        <C_DOC_SUB>331</C_DOC_SUB>
        <C_DOC_VER>9</C_DOC_VER>
        <C_DOC_TYPE>0</C_DOC_TYPE>
        <C_DOC_CNT>1</C_DOC_CNT>
        <C_DOC_STAN>1</C_DOC_STAN>
        <FILENAME>${linkedESVFilename}</FILENAME>
      </DOC>
    </LINKED_DOCS>`
    : '<LINKED_DOCS xsi:nil="true"/>';

  const xml = `<?xml version="1.0" encoding="windows-1251"?>
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
    <PERIOD_TYPE>${getPeriodTypeCode(report.reportingPeriod.quarter)}</PERIOD_TYPE>
    <PERIOD_YEAR>${report.reportingPeriod.year}</PERIOD_YEAR>
    <C_STI_ORIG>${profile.taxOffice.code}</C_STI_ORIG>
    <C_DOC_STAN>1</C_DOC_STAN>
    ${linkedDocsXml}
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
    ${linkedESVFilename ? '<HD1>1</HD1>' : '<HD1 xsi:nil="true"/>'}
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

// Таблиця відповідності Unicode → Windows-1251 для символів 0x80-0xFF
const unicodeToWin1251: Record<number, number> = {
  0x0402:0x80,0x0403:0x81,0x201A:0x82,0x0453:0x83,0x201E:0x84,0x2026:0x85,
  0x2020:0x86,0x2021:0x87,0x20AC:0x88,0x2030:0x89,0x0409:0x8A,0x2039:0x8B,
  0x040A:0x8C,0x040C:0x8D,0x040B:0x8E,0x040F:0x8F,0x0452:0x90,0x2018:0x91,
  0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,
  0x2122:0x99,0x0459:0x9A,0x203A:0x9B,0x045A:0x9C,0x045C:0x9D,0x045B:0x9E,
  0x045F:0x9F,0x00A0:0xA0,0x040E:0xA1,0x045E:0xA2,0x0408:0xA3,0x00A4:0xA4,
  0x0490:0xA5,0x00A6:0xA6,0x00A7:0xA7,0x0401:0xA8,0x00A9:0xA9,0x0404:0xAA,
  0x00AB:0xAB,0x00AC:0xAC,0x00AD:0xAD,0x00AE:0xAE,0x0407:0xAF,0x00B0:0xB0,
  0x00B1:0xB1,0x0406:0xB2,0x0456:0xB3,0x0491:0xB4,0x00B5:0xB5,0x00B6:0xB6,
  0x00B7:0xB7,0x0451:0xB8,0x2116:0xB9,0x0454:0xBA,0x00BB:0xBB,0x0458:0xBC,
  0x0405:0xBD,0x0455:0xBE,0x0457:0xBF,
};

// Кодування рядка в Windows-1251
export const encodeWindows1251 = (str: string): Uint8Array => {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0x7F) {
      bytes[i] = code;
    } else if (code >= 0x0410 && code <= 0x042F) {
      bytes[i] = code - 0x0410 + 0xC0; // А-Я
    } else if (code >= 0x0430 && code <= 0x044F) {
      bytes[i] = code - 0x0430 + 0xE0; // а-я
    } else {
      bytes[i] = unicodeToWin1251[code] ?? 0x3F; // ? для невідомих символів
    }
  }
  return bytes;
};

// Завантаження XML файлу в кодуванні Windows-1251
export const downloadXML = (xml: string, filename: string = 'F0103309.xml'): void => {
  const encoded = encodeWindows1251(xml);
  const blob = new Blob([encoded.buffer as ArrayBuffer], { type: 'application/xml' });
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