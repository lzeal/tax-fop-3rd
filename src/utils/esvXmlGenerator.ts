import { TaxReportF0133109, FOPProfile, ESVReportData } from '../types';
import { loadESVSettings, calculateMonthESV } from './esvSettings';
import { parseTaxOfficeCode } from './xmlGenerator';

// Генерація даних звіту ЄСВ на основі налаштувань
export const generateESVReportData = (year: number): ESVReportData => {
  const settings = loadESVSettings(year);
  
  const months = settings.monthlySettings.map(monthSettings => ({
    month: monthSettings.month,
    incomeBase: monthSettings.incomeBase,
    contributionRate: monthSettings.contributionRate,
    contributionAmount: calculateMonthESV(monthSettings.incomeBase, monthSettings.contributionRate),
  }));
  
  const totalIncomeBase = months.reduce((sum, m) => sum + m.incomeBase, 0);
  const totalContributionAmount = months.reduce((sum, m) => sum + m.contributionAmount, 0);
  
  return {
    year,
    months,
    totalIncomeBase: Math.round(totalIncomeBase * 100) / 100,
    totalContributionAmount: Math.round(totalContributionAmount * 100) / 100,
  };
};

// Перетворення даних у формат звіту F0133109
export const generateESVReport = (
  reportData: ESVReportData
): TaxReportF0133109 => {
  return {
    reportingPeriod: {
      year: reportData.year,
    },
    monthlyData: reportData.months,
    totals: {
      totalIncomeBase: reportData.totalIncomeBase,
      totalContributionAmount: reportData.totalContributionAmount,
    },
  };
};

// Генерація XML для звіту ЄСВ F0133109
export const generateESVXML = (
  report: TaxReportF0133109,
  profile: FOPProfile,
  linkedMainFilename: string,
): string => {
  const formatDateToXML = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}${month}${year}`;
  };

  const currentDate = formatDateToXML(new Date());
  const { region, district } = parseTaxOfficeCode(profile.taxOffice.code);

  // Генерація полів R09xxG2, R09xxG3, R09xxG4 для кожного місяця
  const monthlyFields = report.monthlyData.map((monthData, index) => {
    const monthNum = (index + 1).toString();
    return `    <R09${monthNum}G2>${monthData.incomeBase.toFixed(2)}</R09${monthNum}G2>
    <R09${monthNum}G3>${monthData.contributionRate.toFixed(2)}</R09${monthNum}G3>
    <R09${monthNum}G4>${monthData.contributionAmount.toFixed(2)}</R09${monthNum}G4>`;
  }).join('\n');

  const xml = `<?xml version="1.0"?>
<DECLAR xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:noNamespaceSchemaLocation="F0133109.xsd">
  <DECLARHEAD>
    <TIN>${profile.tin}</TIN>
    <C_DOC>F01</C_DOC>
    <C_DOC_SUB>331</C_DOC_SUB>
    <C_DOC_VER>9</C_DOC_VER>
    <C_DOC_TYPE>0</C_DOC_TYPE>
    <C_DOC_CNT>1</C_DOC_CNT>
    <C_REG>${region}</C_REG>
    <C_RAJ>${district}</C_RAJ>
    <PERIOD_MONTH>12</PERIOD_MONTH>
    <PERIOD_TYPE>5</PERIOD_TYPE>
    <PERIOD_YEAR>${report.reportingPeriod.year}</PERIOD_YEAR>
    <C_STI_ORIG>${profile.taxOffice.code}</C_STI_ORIG>
    <C_DOC_STAN>1</C_DOC_STAN>
    <LINKED_DOCS>
      <DOC NUM="1" TYPE="2">
        <C_DOC>F01</C_DOC>
        <C_DOC_SUB>033</C_DOC_SUB>
        <C_DOC_VER>9</C_DOC_VER>
        <C_DOC_TYPE>0</C_DOC_TYPE>
        <C_DOC_CNT>1</C_DOC_CNT>
        <C_DOC_STAN>1</C_DOC_STAN>
        <FILENAME>${linkedMainFilename}</FILENAME>
      </DOC>
    </LINKED_DOCS>
    <D_FILL>${currentDate}</D_FILL>
    <SOFTWARE>ФОП Калькулятор v1.0</SOFTWARE>
  </DECLARHEAD>
  
  <DECLARBODY>
    <HZ>1</HZ>
    <HTIN>${profile.tin}</HTIN>
    <HNAME>${profile.fullName}</HNAME>
    <HY>1</HY>
    <HZY>${report.reportingPeriod.year}</HZY>
    <HKVED>${profile.kved.primary.code}</HKVED>
    <R08G1D>${formatDateToXML(new Date(report.reportingPeriod.year, 0, 1))}</R08G1D>
    <R08G2D>${formatDateToXML(new Date(report.reportingPeriod.year, 11, 31))}</R08G2D>
    <R081G1>${profile.insuranceCategoryCode}</R081G1>
${monthlyFields}
    <R09G2>${report.totals.totalIncomeBase.toFixed(2)}</R09G2>
    <R09G4>${report.totals.totalContributionAmount.toFixed(2)}</R09G4>
    <HBOS>${profile.fullName}</HBOS>
  </DECLARBODY>
</DECLAR>`;

  return xml;
};

// Завантаження XML файлу
export const downloadESVXML = (xml: string, year: number, filename?: string): void => {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `F0133109_${year}.xml`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Валідація звіту ЄСВ перед генерацією
export const validateESVReport = (report: TaxReportF0133109, profile: FOPProfile): string[] => {
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
  
  if (report.monthlyData.length !== 12) {
    errors.push('Звіт повинен містити дані за всі 12 місяців');
  }
  
  report.monthlyData.forEach((monthData, index) => {
    if (monthData.incomeBase < 0) {
      errors.push(`Сума доходу за ${index + 1} місяць не може бути від'ємною`);
    }
    if (monthData.contributionRate <= 0 || monthData.contributionRate > 100) {
      errors.push(`Ставка ЄСВ за ${index + 1} місяць повинна бути від 0 до 100%`);
    }
  });
  
  return errors;
};
