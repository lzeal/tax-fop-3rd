import { Payment } from '../types';

const STORAGE_KEY = 'fop-tax-payments';

export const savePayments = (payments: Payment[]): void => {
  try {
    const serializedPayments = payments.map(payment => ({
      ...payment,
      date: payment.date.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedPayments));
  } catch (error) {
    console.error('Error saving payments to localStorage:', error);
  }
};

export const loadPayments = (): Payment[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((payment: any) => ({
      ...payment,
      date: new Date(payment.date),
    }));
  } catch (error) {
    console.error('Error loading payments from localStorage:', error);
    return [];
  }
};

export const clearPayments = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing payments from localStorage:', error);
  }
};