import {
  generateTaxReport,
  generateXML,
  parseTaxOfficeCode,
  validateReport,
} from '../xmlGenerator';
import { FOPProfile, AccumulatedData, TaxReportF0103309 } from '../../types';

describe('xmlGenerator', () => {
  const createMockProfile = (): FOPProfile => ({
    fullName: 'Іван Петрович Сидоренко',
    tin: '1234567890',
    address: {
      region: 'Київська',
      district: 'Бориспільський',
      city: 'Київ',
      street: 'Хрещатик',
      building: '1',
      apartment: '10',
      postalCode: '01001',
    },
    phone: '+380501234567',
    email: 'test@example.com',
    taxOffice: {
      code: '1309',
      name: 'ДПІ у Дарницькому районі',
    },
    registrationDate: new Date('2020-01-01'),
    kved: {
      primary: { code: '62.01', name: "Комп'ютерне програмування" },
      additional: [{ code: '62.02', name: 'Консультування з питань інформатизації' }],
    },
    taxGroup: 3,
    isVATpayer: false,
    singleTaxRate: 0.05,
    militaryTaxRate: 0.01,
    yearlyIncomeLimit: 12000000,
  });

  const createMockAccumulatedData = (): AccumulatedData => ({
    year: 2025,
    quarterlyIncomeUAH: { q1: 100000, q2: 150000, q3: 200000, q4: 250000 },
    quarterlyIncomeForeign: { q1: 50000, q2: 75000, q3: 100000, q4: 125000 },
    taxes: {
      singleTax: { q1: 7500, q2: 11250, q3: 15000, q4: 18750 },
      militaryTax: { q1: 1500, q2: 2250, q3: 3000, q4: 3750 },
      socialContributions: { q1: 0, q2: 0, q3: 0, q4: 0 },
    },
  });

  describe('parseTaxOfficeCode', () => {
    it('should parse "1309" to region "13" and district "09"', () => {
      const result = parseTaxOfficeCode('1309');

      expect(result.region).toBe('13');
      expect(result.district).toBe('09');
    });

    it('should parse "8001" correctly', () => {
      const result = parseTaxOfficeCode('8001');

      expect(result.region).toBe('80');
      expect(result.district).toBe('01');
    });

    it('should throw for code with less than 4 digits', () => {
      expect(() => parseTaxOfficeCode('123')).toThrow(
        'Код податкової повинен містити 4 цифри'
      );
    });

    it('should throw for code with more than 4 digits', () => {
      expect(() => parseTaxOfficeCode('12345')).toThrow(
        'Код податкової повинен містити 4 цифри'
      );
    });

    it('should throw for non-numeric code', () => {
      expect(() => parseTaxOfficeCode('12ab')).toThrow(
        'Код податкової повинен містити 4 цифри'
      );
    });

    it('should throw for empty code', () => {
      expect(() => parseTaxOfficeCode('')).toThrow(
        'Код податкової повинен містити 4 цифри'
      );
    });
  });

  describe('generateTaxReport', () => {
    it('should create correct structure for Q1', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();

      const report = generateTaxReport(profile, data, 1);

      expect(report.reportingPeriod.year).toBe(2025);
      expect(report.reportingPeriod.quarter).toBe(1);

      // Q1 income
      expect(report.incomeSection.nationalCurrencyIncome.currentQuarter).toBe(100000);
      expect(report.incomeSection.foreignCurrencyIncome.currentQuarter).toBe(50000);
      expect(report.incomeSection.totalIncome.currentQuarter).toBe(150000);

      // Cumulative (same as Q1 for first quarter)
      expect(report.incomeSection.totalIncome.cumulativeFromYearStart).toBe(150000);
    });

    it('should create correct structure for Q2 with cumulative data', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();

      const report = generateTaxReport(profile, data, 2);

      // Q2 only income
      expect(report.incomeSection.nationalCurrencyIncome.currentQuarter).toBe(150000);
      expect(report.incomeSection.foreignCurrencyIncome.currentQuarter).toBe(75000);
      expect(report.incomeSection.totalIncome.currentQuarter).toBe(225000);

      // Cumulative Q1 + Q2
      expect(report.incomeSection.nationalCurrencyIncome.cumulativeFromYearStart).toBe(250000);
      expect(report.incomeSection.foreignCurrencyIncome.cumulativeFromYearStart).toBe(125000);
      expect(report.incomeSection.totalIncome.cumulativeFromYearStart).toBe(375000);
    });

    it('should create correct structure for Q4', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();

      const report = generateTaxReport(profile, data, 4);

      // Q4 only income
      expect(report.incomeSection.totalIncome.currentQuarter).toBe(375000); // 250000 + 125000

      // Full year cumulative
      expect(report.incomeSection.totalIncome.cumulativeFromYearStart).toBe(1050000);
    });

    it('should calculate previouslyPaid correctly for Q2', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();

      const report = generateTaxReport(profile, data, 2);

      // Q2: cumulativeTax - quarterlyTax = previouslyPaid
      // Cumulative through Q2: 7500 + 11250 = 18750
      // Q2 only: 11250
      // Previously paid: 7500 (Q1)
      expect(report.singleTaxSection.calculatedTax).toBe(18750);
      expect(report.singleTaxSection.toPay).toBe(11250);
      expect(report.singleTaxSection.previouslyPaid).toBe(7500);
    });

    it('should use profile tax rate', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();

      const report = generateTaxReport(profile, data, 1);

      expect(report.singleTaxSection.taxRate).toBe(0.05);
      expect(report.militaryTaxSection.taxRate).toBe(0.01);
    });
  });

  describe('validateReport', () => {
    it('should return no errors for valid data', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toEqual([]);
    });

    it('should return error for invalid TIN length', () => {
      const profile = createMockProfile();
      profile.tin = '123'; // Invalid
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toContain('ІПН повинен містити 10 цифр');
    });

    it('should return error for empty TIN', () => {
      const profile = createMockProfile();
      profile.tin = '';
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toContain('ІПН повинен містити 10 цифр');
    });

    it('should return error for invalid tax office code length', () => {
      const profile = createMockProfile();
      profile.taxOffice.code = '13'; // Invalid
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toContain('Код податкової повинен містити 4 цифри');
    });

    it('should return error for missing fullName', () => {
      const profile = createMockProfile();
      profile.fullName = '   '; // Empty after trim
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toContain("ПІБ є обов'язковим");
    });

    it('should return error for missing KVED code', () => {
      const profile = createMockProfile();
      profile.kved.primary.code = '';
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toContain("Код основного КВЕДу є обов'язковим");
    });

    it('should return error for missing KVED name', () => {
      const profile = createMockProfile();
      profile.kved.primary.name = '';
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toContain("Назва основного КВЕДу є обов'язковою");
    });

    it('should return error for zero income', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      data.quarterlyIncomeUAH = { q1: 0, q2: 0, q3: 0, q4: 0 };
      data.quarterlyIncomeForeign = { q1: 0, q2: 0, q3: 0, q4: 0 };
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toContain('Сума доходів повинна бути більшою за 0');
    });

    it('should return error for income over 12M limit', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      data.quarterlyIncomeUAH.q1 = 15000000; // Over limit
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors).toContain(
        'Доходи перевищують ліміт для 3-ї групи (12 000 000 грн)'
      );
    });

    it('should return multiple errors when multiple validations fail', () => {
      const profile = createMockProfile();
      profile.tin = '123';
      profile.fullName = '';
      profile.kved.primary.code = '';
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const errors = validateReport(report, profile);

      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('generateXML', () => {
    it('should generate valid XML structure', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain('<?xml version="1.0"?>');
      expect(xml).toContain('<DECLAR');
      expect(xml).toContain('</DECLAR>');
      expect(xml).toContain('<DECLARHEAD>');
      expect(xml).toContain('<DECLARBODY>');
    });

    it('should include TIN in XML', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain(`<TIN>${profile.tin}</TIN>`);
      expect(xml).toContain(`<HTIN>${profile.tin}</HTIN>`);
    });

    it('should include correct PERIOD_TYPE for Q1 (2 - quarter)', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain('<PERIOD_TYPE>2</PERIOD_TYPE>');
      expect(xml).toContain('<H1KV>1</H1KV>');
    });

    it('should include correct PERIOD_TYPE for Q2 (3 - half year)', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 2);

      const xml = generateXML(report, profile);

      expect(xml).toContain('<PERIOD_TYPE>3</PERIOD_TYPE>');
      expect(xml).toContain('<HHY>1</HHY>');
    });

    it('should include correct PERIOD_TYPE for Q3 (4 - 9 months)', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 3);

      const xml = generateXML(report, profile);

      expect(xml).toContain('<PERIOD_TYPE>4</PERIOD_TYPE>');
      expect(xml).toContain('<H3KV>1</H3KV>');
    });

    it('should include correct PERIOD_TYPE for Q4 (5 - year)', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 4);

      const xml = generateXML(report, profile);

      expect(xml).toContain('<PERIOD_TYPE>5</PERIOD_TYPE>');
      expect(xml).toContain('<HY>1</HY>');
    });

    it('should include KVED information', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain(`<T1RXXXXG1S ROWNUM="1">${profile.kved.primary.code}</T1RXXXXG1S>`);
      expect(xml).toContain(`<T1RXXXXG2S ROWNUM="1">${profile.kved.primary.name}</T1RXXXXG2S>`);
    });

    it('should include additional KVEDs', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain(`<T1RXXXXG1S ROWNUM="2">${profile.kved.additional[0].code}</T1RXXXXG1S>`);
      expect(xml).toContain(`<T1RXXXXG2S ROWNUM="2">${profile.kved.additional[0].name}</T1RXXXXG2S>`);
    });

    it('should format numbers with 2 decimal places', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      // Check that income values are formatted with .00
      expect(xml).toContain('<R006G3>150000.00</R006G3>');
      expect(xml).toContain('<R011G3>7500.00</R011G3>');
    });

    it('should include region and district from tax office code', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain('<C_REG>13</C_REG>');
      expect(xml).toContain('<C_RAJ>09</C_RAJ>');
    });

    it('should include address in formatted form', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain('<HLOC>');
      expect(xml).toContain('Київ');
      expect(xml).toContain('Хрещатик');
    });

    it('should include email if provided', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain(`<HEMAIL>${profile.email}</HEMAIL>`);
    });

    it('should include phone if provided', () => {
      const profile = createMockProfile();
      const data = createMockAccumulatedData();
      const report = generateTaxReport(profile, data, 1);

      const xml = generateXML(report, profile);

      expect(xml).toContain(`<HTEL>${profile.phone}</HTEL>`);
    });
  });
});
