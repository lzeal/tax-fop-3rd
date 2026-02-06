import {
  generateESVReportData,
  generateESVReport,
  generateESVXML,
  validateESVReport,
} from '../esvXmlGenerator';
import { FOPProfile, TaxReportF0133109, ESVReportData } from '../../types';
import * as esvSettings from '../esvSettings';

// Mock esvSettings module
jest.mock('../esvSettings', () => ({
  loadESVSettings: jest.fn(),
  calculateMonthESV: jest.fn((incomeBase: number, rate: number) => {
    return Math.round(incomeBase * (rate / 100) * 100) / 100;
  }),
}));

describe('esvXmlGenerator', () => {
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
      additional: [],
    },
    taxGroup: 3,
    isVATpayer: false,
    singleTaxRate: 0.05,
    militaryTaxRate: 0.01,
    yearlyIncomeLimit: 12000000,
  });

  const createMockESVSettings = () => ({
    year: 2025,
    monthlySettings: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      incomeBase: 8000,
      contributionRate: 22,
    })),
  });

  const createMockReportData = (): ESVReportData => ({
    year: 2025,
    months: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      incomeBase: 8000,
      contributionRate: 22,
      contributionAmount: 1760, // 8000 * 0.22
    })),
    totalIncomeBase: 96000, // 8000 * 12
    totalContributionAmount: 21120, // 1760 * 12
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (esvSettings.loadESVSettings as jest.Mock).mockReturnValue(createMockESVSettings());
  });

  describe('generateESVReportData', () => {
    it('should return 12 months of data', () => {
      const result = generateESVReportData(2025);

      expect(result.months).toHaveLength(12);
      expect(result.months[0].month).toBe(1);
      expect(result.months[11].month).toBe(12);
    });

    it('should use settings for each month', () => {
      (esvSettings.loadESVSettings as jest.Mock).mockReturnValue({
        year: 2025,
        monthlySettings: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          incomeBase: (i + 1) * 1000, // 1000, 2000, ... 12000
          contributionRate: 22,
        })),
      });

      const result = generateESVReportData(2025);

      expect(result.months[0].incomeBase).toBe(1000);
      expect(result.months[5].incomeBase).toBe(6000);
      expect(result.months[11].incomeBase).toBe(12000);
    });

    it('should calculate contribution amounts correctly', () => {
      const result = generateESVReportData(2025);

      // Each month: 8000 * 0.22 = 1760
      result.months.forEach((month) => {
        expect(month.contributionAmount).toBe(1760);
      });
    });

    it('should calculate totals correctly', () => {
      const result = generateESVReportData(2025);

      expect(result.totalIncomeBase).toBe(96000); // 8000 * 12
      expect(result.totalContributionAmount).toBe(21120); // 1760 * 12
    });

    it('should round totals to 2 decimal places', () => {
      (esvSettings.loadESVSettings as jest.Mock).mockReturnValue({
        year: 2025,
        monthlySettings: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          incomeBase: 8333.33,
          contributionRate: 22,
        })),
      });

      (esvSettings.calculateMonthESV as jest.Mock).mockReturnValue(1833.33);

      const result = generateESVReportData(2025);

      // Totals should be rounded
      expect(Number.isInteger(result.totalIncomeBase * 100)).toBe(true);
      expect(Number.isInteger(result.totalContributionAmount * 100)).toBe(true);
    });
  });

  describe('generateESVReport', () => {
    it('should create correct structure with year', () => {
      const reportData = createMockReportData();
      const result = generateESVReport(reportData);

      expect(result.reportingPeriod.year).toBe(2025);
    });

    it('should map monthly data correctly', () => {
      const reportData = createMockReportData();
      const result = generateESVReport(reportData);

      expect(result.monthlyData).toHaveLength(12);
      expect(result.monthlyData[0].month).toBe(1);
      expect(result.monthlyData[0].incomeBase).toBe(8000);
      expect(result.monthlyData[0].contributionRate).toBe(22);
      expect(result.monthlyData[0].contributionAmount).toBe(1760);
    });

    it('should include totals correctly', () => {
      const reportData = createMockReportData();
      const result = generateESVReport(reportData);

      expect(result.totals.totalIncomeBase).toBe(96000);
      expect(result.totals.totalContributionAmount).toBe(21120);
    });
  });

  describe('validateESVReport', () => {
    it('should return no errors for valid data', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toEqual([]);
    });

    it('should return error for invalid TIN', () => {
      const profile = createMockProfile();
      profile.tin = '123'; // Invalid
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain('ІПН повинен містити 10 цифр');
    });

    it('should return error for empty TIN', () => {
      const profile = createMockProfile();
      profile.tin = '';
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain('ІПН повинен містити 10 цифр');
    });

    it('should return error for invalid tax office code', () => {
      const profile = createMockProfile();
      profile.taxOffice.code = '13'; // Invalid
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain('Код податкової повинен містити 4 цифри');
    });

    it('should return error for missing fullName', () => {
      const profile = createMockProfile();
      profile.fullName = '   ';
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain("ПІБ є обов'язковим");
    });

    it('should return error for missing KVED', () => {
      const profile = createMockProfile();
      profile.kved.primary.code = '';
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain("Код основного КВЕДу є обов'язковим");
    });

    it('should return error for not 12 months', () => {
      const profile = createMockProfile();
      const report: TaxReportF0133109 = {
        reportingPeriod: { year: 2025 },
        monthlyData: Array.from({ length: 6 }, (_, i) => ({
          month: i + 1,
          incomeBase: 8000,
          contributionRate: 22,
          contributionAmount: 1760,
        })),
        totals: { totalIncomeBase: 48000, totalContributionAmount: 10560 },
      };

      const errors = validateESVReport(report, profile);

      expect(errors).toContain('Звіт повинен містити дані за всі 12 місяців');
    });

    it('should return error for zero income base', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      reportData.months[5].incomeBase = 0; // June has 0
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain('Сума доходу за 6 місяць повинна бути більшою за 0');
    });

    it('should return error for negative income base', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      reportData.months[0].incomeBase = -1000;
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain('Сума доходу за 1 місяць повинна бути більшою за 0');
    });

    it('should return error for invalid contribution rate (zero)', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      reportData.months[0].contributionRate = 0;
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain('Ставка ЄСВ за 1 місяць повинна бути від 0 до 100%');
    });

    it('should return error for contribution rate over 100', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      reportData.months[0].contributionRate = 150;
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors).toContain('Ставка ЄСВ за 1 місяць повинна бути від 0 до 100%');
    });

    it('should return multiple errors for multiple months with issues', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      reportData.months[0].incomeBase = 0;
      reportData.months[1].incomeBase = 0;
      reportData.months[2].contributionRate = 0;
      const report = generateESVReport(reportData);

      const errors = validateESVReport(report, profile);

      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('generateESVXML', () => {
    it('should generate valid XML structure', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      expect(xml).toContain('<?xml version="1.0"?>');
      expect(xml).toContain('<DECLAR');
      expect(xml).toContain('</DECLAR>');
      expect(xml).toContain('<DECLARHEAD>');
      expect(xml).toContain('<DECLARBODY>');
    });

    it('should include correct document type codes', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      expect(xml).toContain('<C_DOC>F01</C_DOC>');
      expect(xml).toContain('<C_DOC_SUB>331</C_DOC_SUB>');
      expect(xml).toContain('<C_DOC_VER>9</C_DOC_VER>');
    });

    it('should include TIN', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      expect(xml).toContain(`<TIN>${profile.tin}</TIN>`);
      expect(xml).toContain(`<HTIN>${profile.tin}</HTIN>`);
    });

    it('should include correct period for year', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      expect(xml).toContain('<PERIOD_MONTH>12</PERIOD_MONTH>');
      expect(xml).toContain('<PERIOD_TYPE>5</PERIOD_TYPE>');
      expect(xml).toContain('<PERIOD_YEAR>2025</PERIOD_YEAR>');
      expect(xml).toContain('<HZY>2025</HZY>');
    });

    it('should generate correct month field names for months 1-9', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      // Check month 1
      expect(xml).toContain('<R0901G2>');
      expect(xml).toContain('<R0901G3>');
      expect(xml).toContain('<R0901G4>');

      // Check month 5
      expect(xml).toContain('<R0905G2>');
      expect(xml).toContain('<R0905G3>');
      expect(xml).toContain('<R0905G4>');

      // Check month 9
      expect(xml).toContain('<R0909G2>');
      expect(xml).toContain('<R0909G3>');
      expect(xml).toContain('<R0909G4>');
    });

    it('should handle months 10-12 correctly', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      // Check month 10
      expect(xml).toContain('<R0910G2>');
      expect(xml).toContain('<R0910G3>');
      expect(xml).toContain('<R0910G4>');

      // Check month 11
      expect(xml).toContain('<R0911G2>');
      expect(xml).toContain('<R0911G3>');
      expect(xml).toContain('<R0911G4>');

      // Check month 12
      expect(xml).toContain('<R0912G2>');
      expect(xml).toContain('<R0912G3>');
      expect(xml).toContain('<R0912G4>');
    });

    it('should include totals', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      expect(xml).toContain('<R09G2>96000.00</R09G2>');
      expect(xml).toContain('<R09G4>21120.00</R09G4>');
    });

    it('should include year boundaries dates', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      // Start of year: 01012025
      expect(xml).toContain('<R08G1D>01012025</R08G1D>');
      // End of year: 31122025
      expect(xml).toContain('<R08G2D>31122025</R08G2D>');
    });

    it('should include KVED', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      expect(xml).toContain(`<HKVED>${profile.kved.primary.code}</HKVED>`);
    });

    it('should include full name', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      expect(xml).toContain(`<HNAME>${profile.fullName}</HNAME>`);
      expect(xml).toContain(`<HBOS>${profile.fullName}</HBOS>`);
    });

    it('should format numbers with 2 decimal places', () => {
      const profile = createMockProfile();
      const reportData = createMockReportData();
      reportData.months[0].incomeBase = 8000;
      reportData.months[0].contributionRate = 22;
      reportData.months[0].contributionAmount = 1760;
      const report = generateESVReport(reportData);

      const xml = generateESVXML(report, profile, 'test-main-report.xml');

      expect(xml).toContain('8000.00');
      expect(xml).toContain('22.00');
      expect(xml).toContain('1760.00');
    });
  });
});
