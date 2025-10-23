import { Quarter } from '../types';

export const getCurrentQuarter = (): Quarter => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let quarter = Math.floor(month / 3) + 1;
  
  // Повертаємо попередній квартал
  quarter--;
  if (quarter === 0) {
    quarter = 4;
    year--;
  }
  
  return { year, quarter: quarter as 1 | 2 | 3 | 4 };
};

export const getQuarterRange = (quarter: Quarter): { start: Date; end: Date } => {
  const start = new Date(quarter.year, (quarter.quarter - 1) * 3, 1);
  const end = new Date(quarter.year, quarter.quarter * 3, 0, 23, 59, 59, 999);
  
  return { start, end };
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const getQuarterDisplayName = (quarter: Quarter): string => {
  return `${quarter.quarter} квартал ${quarter.year}`;
};