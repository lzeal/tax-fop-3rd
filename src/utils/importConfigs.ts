import { ImportConfig } from '../types';

const CONFIGS_STORAGE_KEY = 'fop-import-configs';
const DEFAULT_CONFIG_ID = 'default-config';

// Готова конфігурація для файлу з клієнт-банку з вашими заголовками
export const createDefaultConfig = (): ImportConfig => ({
  id: DEFAULT_CONFIG_ID,
  name: 'Клієнт-банк (стандартний)',
  headerRow: 2, // Заголовки в другому рядку
  dataStartRow: 3, // Дані починаються з третього рядка
  columnMapping: {
    dateColumn: 'Дата документа', 
    amountColumn: 'Сума',
    currencyColumn: 'Валюта',
    counterpartyColumn: 'Найменування кореспондента',
    accountColumn: 'Рахунок кореспондента',
    descriptionColumn: 'Призн.платежу'
  },
  dateFormat: 'dd.MM.yyyy',
  filterIncoming: true, // Фільтруємо тільки надходження
  amountSignColumn: 'Тип' // Колонка з ознакою платежу
});

export const saveImportConfigs = (configs: ImportConfig[]): void => {
  try {
    localStorage.setItem(CONFIGS_STORAGE_KEY, JSON.stringify(configs));
  } catch (error) {
    console.error('Error saving import configs:', error);
  }
};

export const loadImportConfigs = (): ImportConfig[] => {
  try {
    const stored = localStorage.getItem(CONFIGS_STORAGE_KEY);
    if (!stored) {
      // Якщо немає збережених конфігурацій, створюємо дефолтну
      const defaultConfig = createDefaultConfig();
      saveImportConfigs([defaultConfig]);
      return [defaultConfig];
    }
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading import configs:', error);
    const defaultConfig = createDefaultConfig();
    return [defaultConfig];
  }
};

export const getConfigById = (id: string): ImportConfig | undefined => {
  const configs = loadImportConfigs();
  return configs.find(config => config.id === id);
};

export const saveConfig = (config: ImportConfig): void => {
  const configs = loadImportConfigs();
  const existingIndex = configs.findIndex(c => c.id === config.id);
  
  if (existingIndex >= 0) {
    configs[existingIndex] = config;
  } else {
    configs.push(config);
  }
  
  saveImportConfigs(configs);
};

export const deleteConfig = (id: string): void => {
  if (id === DEFAULT_CONFIG_ID) {
    throw new Error('Неможливо видалити стандартну конфігурацію');
  }
  
  const configs = loadImportConfigs();
  const filteredConfigs = configs.filter(c => c.id !== id);
  saveImportConfigs(filteredConfigs);
};