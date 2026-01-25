import { ESVSettings, MonthESVSettings } from '../types';

const ESV_SETTINGS_KEY = 'fop-esv-settings';

// Створення налаштувань ЄСВ для року з дефолтними значеннями
export const createDefaultESVSettings = (year: number): ESVSettings => {
  const monthlySettings: MonthESVSettings[] = [];
  
  for (let month = 1; month <= 12; month++) {
    monthlySettings.push({
      month,
      incomeBase: 8000, // По замовчуванню 8000 грн
      contributionRate: 22, // По замовчуванню 22%
    });
  }
  
  return {
    year,
    monthlySettings,
  };
};

// Збереження налаштувань ЄСВ в localStorage
export const saveESVSettings = (settings: ESVSettings): void => {
  try {
    const allSettings = loadAllESVSettings();
    const existingIndex = allSettings.findIndex(s => s.year === settings.year);
    
    if (existingIndex >= 0) {
      allSettings[existingIndex] = settings;
    } else {
      allSettings.push(settings);
    }
    
    localStorage.setItem(ESV_SETTINGS_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.error('Error saving ESV settings:', error);
  }
};

// Завантаження всіх налаштувань ЄСВ з localStorage
export const loadAllESVSettings = (): ESVSettings[] => {
  try {
    const stored = localStorage.getItem(ESV_SETTINGS_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading ESV settings:', error);
    return [];
  }
};

// Завантаження налаштувань ЄСВ для конкретного року
export const loadESVSettings = (year: number): ESVSettings => {
  const allSettings = loadAllESVSettings();
  const yearSettings = allSettings.find(s => s.year === year);
  
  if (yearSettings) {
    return yearSettings;
  }
  
  // Якщо немає налаштувань для цього року, створюємо дефолтні
  const defaultSettings = createDefaultESVSettings(year);
  saveESVSettings(defaultSettings);
  return defaultSettings;
};

// Оновлення налаштувань для конкретного місяця
export const updateMonthSettings = (
  year: number,
  month: number,
  incomeBase: number,
  contributionRate: number
): void => {
  const settings = loadESVSettings(year);
  const monthSettings = settings.monthlySettings.find(m => m.month === month);
  
  if (monthSettings) {
    monthSettings.incomeBase = incomeBase;
    monthSettings.contributionRate = contributionRate;
  }
  
  saveESVSettings(settings);
};

// Оновлення налаштувань починаючи з конкретного місяця до кінця року
export const updateMonthSettingsFrom = (
  year: number,
  startMonth: number,
  incomeBase: number,
  contributionRate: number
): void => {
  const settings = loadESVSettings(year);
  
  for (let month = startMonth; month <= 12; month++) {
    const monthSettings = settings.monthlySettings.find(m => m.month === month);
    if (monthSettings) {
      monthSettings.incomeBase = incomeBase;
      monthSettings.contributionRate = contributionRate;
    }
  }
  
  saveESVSettings(settings);
};

// Отримання налаштувань для конкретного місяця
export const getMonthSettings = (year: number, month: number): MonthESVSettings | undefined => {
  const settings = loadESVSettings(year);
  return settings.monthlySettings.find(m => m.month === month);
};

// Розрахунок суми ЄСВ для місяця
export const calculateMonthESV = (incomeBase: number, contributionRate: number): number => {
  return Math.round(incomeBase * contributionRate / 100 * 100) / 100;
};

// Розрахунок загальної суми ЄСВ за рік
export const calculateYearESV = (year: number): number => {
  const settings = loadESVSettings(year);
  let total = 0;
  
  settings.monthlySettings.forEach(month => {
    total += calculateMonthESV(month.incomeBase, month.contributionRate);
  });
  
  return Math.round(total * 100) / 100;
};
