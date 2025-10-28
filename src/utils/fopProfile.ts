import { FOPProfile } from '../types';

const FOP_PROFILE_STORAGE_KEY = 'fop-profile';

// Створення шаблону профілю ФОП
export const createEmptyFOPProfile = (): FOPProfile => ({
  fullName: '',
  tin: '',
  address: {
    region: '',
    district: '',
    city: '',
    street: '',
    building: '',
    apartment: '',
    postalCode: ''
  },
  phone: '',
  email: '',
  taxOffice: {
    name: ''
  },
  registrationDate: new Date(),
  kved: {
    primary: {
      code: '',
      name: ''
    },
    additional: []
  },
  taxGroup: 3,
  isVATpayer: false,
  singleTaxRate: 0.05,
  militaryTaxRate: 0.01,
  yearlyIncomeLimit: 12000000
});

// Збереження профілю ФОП
export const saveFOPProfile = (profile: FOPProfile): void => {
  try {
    localStorage.setItem(FOP_PROFILE_STORAGE_KEY, JSON.stringify({
      ...profile,
      registrationDate: profile.registrationDate.toISOString()
    }));
  } catch (error) {
    console.error('Error saving FOP profile:', error);
    throw new Error('Не вдалося зберегти профіль ФОП');
  }
};

// Завантаження профілю ФОП
export const loadFOPProfile = (): FOPProfile | null => {
  try {
    const stored = localStorage.getItem(FOP_PROFILE_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    
    const parsed = JSON.parse(stored);
    
    return {
      ...parsed,
      registrationDate: new Date(parsed.registrationDate)
    };
  } catch (error) {
    console.error('Error loading FOP profile:', error);
    return null;
  }
};

// Валідація профілю ФОП
export const validateFOPProfile = (profile: Partial<FOPProfile>): string[] => {
  const errors: string[] = [];
  
  if (!profile.fullName?.trim()) {
    errors.push('ПІБ є обов\'язковим');
  }
  
  if (!profile.tin?.trim()) {
    errors.push('ІПН є обов\'язковим');
  } else if (!/^\d{10}$/.test(profile.tin.trim())) {
    errors.push('ІПН повинен містити 10 цифр');
  }
  
  if (!profile.address?.region?.trim()) {
    errors.push('Область є обов\'язковою');
  }
  
  if (!profile.address?.city?.trim()) {
    errors.push('Місто/селище є обов\'язковим');
  }
  
  if (!profile.address?.street?.trim()) {
    errors.push('Вулиця є обов\'язковою');
  }
  
  if (!profile.address?.building?.trim()) {
    errors.push('Номер будинку є обов\'язковим');
  }
  
  if (!profile.address?.postalCode?.trim()) {
    errors.push('Поштовий індекс є обов\'язковим');
  } else if (!/^\d{5}$/.test(profile.address.postalCode.trim())) {
    errors.push('Поштовий індекс повинен містити 5 цифр');
  }
  
  if (!profile.phone?.trim()) {
    errors.push('Телефон є обов\'язковим');
  }
  
  if (!profile.email?.trim()) {
    errors.push('Email є обов\'язковим');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.push('Некоректний формат email');
  }
  
  if (!profile.taxOffice?.name?.trim()) {
    errors.push('Назва податкової є обов\'язковою');
  }
  
  if (!profile.kved?.primary?.code?.trim()) {
    errors.push('Код основного КВЕДу є обов\'язковим');
  }
  
  if (!profile.kved?.primary?.name?.trim()) {
    errors.push('Назва основного КВЕДу є обов\'язковою');
  }
  
  return errors;
};

// Форматування адреси для відображення
export const formatAddress = (address: FOPProfile['address']): string => {
  const parts = [
    address.postalCode,
    address.region,
    address.district,
    address.city,
    address.street,
    address.building + (address.apartment ? `, кв. ${address.apartment}` : '')
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Перевірка чи заповнений профіль
export const isProfileComplete = (profile: FOPProfile | null): boolean => {
  if (!profile) return false;
  return validateFOPProfile(profile).length === 0;
};