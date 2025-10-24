import { Payment, FOPProfile, ImportConfig, AccumulatedData } from '../types';
import { loadPayments } from './localStorage';
import { loadFOPProfile } from './fopProfile';
import { loadImportConfigs } from './importConfigs';
import { loadAccumulatedData } from './accumulatedData';

// Структура для повного експорту даних
interface AppDataExport {
  version: string;
  exportDate: string;
  payments: Payment[];
  profile: FOPProfile | null;
  importConfigs: ImportConfig[];
  accumulatedData: Record<string, AccumulatedData>; // по роках
}

// Експорт всіх даних додатку
export const exportAllData = (): string => {
  const payments = loadPayments();
  const profile = loadFOPProfile();
  const importConfigs = loadImportConfigs();
  
  // Збираємо накопичувальні дані за всі роки
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const accumulatedData: Record<string, AccumulatedData> = {};
  
  years.forEach(year => {
    try {
      accumulatedData[year.toString()] = loadAccumulatedData(year);
    } catch (error) {
      console.warn(`Could not load accumulated data for year ${year}:`, error);
    }
  });

  const exportData: AppDataExport = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    payments: payments.map(payment => ({
      ...payment,
      date: payment.date.toISOString()
    })) as any,
    profile,
    importConfigs,
    accumulatedData
  };

  return JSON.stringify(exportData, null, 2);
};

// Завантаження експортованих даних
export const downloadDataExport = (filename?: string): void => {
  const dataString = exportAllData();
  const blob = new Blob([dataString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const currentDate = new Date().toISOString().split('T')[0];
  const defaultFilename = `fop-data-backup-${currentDate}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Валідація імпортованих даних
export const validateImportData = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Некоректний формат файлу');
    return errors;
  }
  
  if (!data.version) {
    errors.push('Відсутня інформація про версію файлу');
  }
  
  if (!Array.isArray(data.payments)) {
    errors.push('Відсутні або некоректні дані про платежі');
  }
  
  if (!Array.isArray(data.importConfigs)) {
    errors.push('Відсутні або некоректні конфігурації імпорту');
  }
  
  // Перевірка структури платежів
  if (Array.isArray(data.payments)) {
    data.payments.forEach((payment: any, index: number) => {
      if (!payment.id || !payment.date || !payment.amount || !payment.currencyCode) {
        errors.push(`Платіж ${index + 1}: відсутні обов'язкові поля`);
      }
    });
  }
  
  return errors;
};

// Імпорт даних з JSON файлу
export const importDataFromJson = (jsonString: string): { success: boolean; errors: string[]; imported: any } => {
  try {
    const data = JSON.parse(jsonString);
    const validationErrors = validateImportData(data);
    
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors, imported: null };
    }
    
    // Конвертуємо дати назад в Date об'єкти
    const payments: Payment[] = data.payments.map((payment: any) => ({
      ...payment,
      date: new Date(payment.date)
    }));
    
    return {
      success: true,
      errors: [],
      imported: {
        payments,
        profile: data.profile,
        importConfigs: data.importConfigs,
        accumulatedData: data.accumulatedData
      }
    };
  } catch (error) {
    return { 
      success: false, 
      errors: ['Помилка читання файлу. Перевірте, що файл не пошкоджений.'], 
      imported: null 
    };
  }
};

// Застосування імпортованих даних
export const applyImportedData = (
  importedData: any, 
  options: {
    replacePayments: boolean;
    replaceProfile: boolean;
    replaceConfigs: boolean;
    replaceAccumulatedData: boolean;
  }
): void => {
  // Імпорт платежів
  if (options.replacePayments && importedData.payments) {
    localStorage.setItem('fop-payments', JSON.stringify(importedData.payments));
  }
  
  // Імпорт профілю
  if (options.replaceProfile && importedData.profile) {
    const profileToSave = {
      ...importedData.profile,
      registrationDate: new Date(importedData.profile.registrationDate).toISOString()
    };
    localStorage.setItem('fop-profile', JSON.stringify(profileToSave));
  }
  
  // Імпорт конфігурацій
  if (options.replaceConfigs && importedData.importConfigs) {
    localStorage.setItem('fop-import-configs', JSON.stringify(importedData.importConfigs));
  }
  
  // Імпорт накопичувальних даних
  if (options.replaceAccumulatedData && importedData.accumulatedData) {
    Object.entries(importedData.accumulatedData).forEach(([year, data]) => {
      localStorage.setItem(`fop-accumulated-data-${year}`, JSON.stringify(data));
    });
  }
};

// Очищення всіх даних додатку
export const clearAllData = (): void => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('fop-'));
  keys.forEach(key => localStorage.removeItem(key));
};

// Отримання розміру збережених даних
export const getStorageInfo = (): { totalSize: number; itemCount: number; items: Array<{ key: string; size: number }> } => {
  const fopKeys = Object.keys(localStorage).filter(key => key.startsWith('fop-'));
  const items = fopKeys.map(key => {
    const value = localStorage.getItem(key) || '';
    return {
      key,
      size: new Blob([value]).size
    };
  });
  
  const totalSize = items.reduce((sum, item) => sum + item.size, 0);
  
  return {
    totalSize,
    itemCount: items.length,
    items: items.sort((a, b) => b.size - a.size)
  };
};

// Форматування розміру файлу
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};