import { FOPProfile } from '../../types';
import { 
  createEmptyFOPProfile, 
  validateFOPProfile, 
  saveFOPProfile, 
  loadFOPProfile 
} from '../fopProfile';

// Mock localStorage
const mockStorage: Record<string, string> = {};
let setItemCalled = false;
let getItemCalled = false;

const localStorageMock = {
  getItem: (key: string) => {
    getItemCalled = true;
    return mockStorage[key] || null;
  },
  setItem: (key: string, value: string) => {
    setItemCalled = true;
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('fopProfile', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    setItemCalled = false;
    getItemCalled = false;
  });

  describe('createEmptyFOPProfile', () => {
    it('should create a valid empty profile', () => {
      const profile = createEmptyFOPProfile();
      
      expect(profile.fullName).toBe('');
      expect(profile.tin).toBe('');
      expect(profile.email).toBe('');
      expect(profile.phone).toBe('');
      expect(profile.taxOffice.name).toBe('');
      expect(profile.kved.primary.code).toBe('');
      expect(profile.kved.primary.name).toBe('');
      expect(profile.kved.additional).toEqual([]);
      expect(profile.taxGroup).toBe(3);
      expect(profile.isVATpayer).toBe(false);
      expect(profile.singleTaxRate).toBe(0.05);
      expect(profile.militaryTaxRate).toBe(0.01);
      expect(profile.yearlyIncomeLimit).toBe(12000000);
    });

    it('should have valid address structure', () => {
      const profile = createEmptyFOPProfile();
      
      expect(profile.address).toEqual({
        region: '',
        district: '',
        city: '',
        street: '',
        building: '',
        apartment: '',
        postalCode: ''
      });
    });
  });

  describe('validateFOPProfile', () => {
    let validProfile: FOPProfile;

    beforeEach(() => {
      validProfile = {
        fullName: 'Іван Петрович Сидоренко',
        tin: '1234567890',
        address: {
          region: 'Київська',
          district: '',
          city: 'Київ',
          street: 'Хрещатик',
          building: '1',
          apartment: '',
          postalCode: '01001'
        },
        phone: '+380501234567',
        email: 'ivan@example.com',
        taxOffice: {
          name: 'Перша державна податкова інспекція'
        },
        registrationDate: new Date('2020-01-01'),
        kved: {
          primary: { code: '62.01', name: 'Комп\'ютерне програмування' },
          additional: []
        },
        taxGroup: 3,
        isVATpayer: false,
        singleTaxRate: 0.05,
        militaryTaxRate: 0.01,
        yearlyIncomeLimit: 12000000
      };
    });

    it('should return no errors for valid profile', () => {
      const errors = validateFOPProfile(validProfile);
      expect(errors).toEqual([]);
    });

    it('should validate required fields', () => {
      const emptyProfile = createEmptyFOPProfile();
      const errors = validateFOPProfile(emptyProfile);
      
      expect(errors).toContain('ПІБ є обов\'язковим');
      expect(errors).toContain('ІПН є обов\'язковим');
      expect(errors).toContain('Email є обов\'язковим');
      expect(errors).toContain('Телефон є обов\'язковим');
      expect(errors).toContain('Назва податкової є обов\'язковою');
      expect(errors).toContain('Код основного КВЕДу є обов\'язковим');
    });

    it('should validate email format', () => {
      const testProfile = { ...validProfile };
      testProfile.email = 'invalid-email';
      const errors = validateFOPProfile(testProfile);
      expect(errors).toContain('Некоректний формат email');
    });

    it('should validate TIN format', () => {
      const testProfile = { ...validProfile };
      testProfile.tin = '123'; // Invalid length
      let errors = validateFOPProfile(testProfile);
      expect(errors).toContain('ІПН повинен містити 10 цифр');

      testProfile.tin = '12345abcde'; // Invalid characters
      errors = validateFOPProfile(testProfile);
      expect(errors).toContain('ІПН повинен містити 10 цифр');
    });

    it('should validate address fields', () => {
      const testProfile = { ...validProfile };
      testProfile.address = {
        region: '',
        district: '',
        city: '',
        street: '',
        building: '',
        apartment: '',
        postalCode: ''
      };
      
      const errors = validateFOPProfile(testProfile);
      expect(errors).toContain('Область є обов\'язковою');
      expect(errors).toContain('Місто/селище є обов\'язковим');
      expect(errors).toContain('Вулиця є обов\'язковою');
      expect(errors).toContain('Номер будинку є обов\'язковим');
      expect(errors).toContain('Поштовий індекс є обов\'язковим');
    });
  });

  describe('saveFOPProfile and loadFOPProfile', () => {
    const testProfile: FOPProfile = {
      fullName: 'Тест Тестович',
      tin: '1234567890',
      address: {
        region: 'Тестова область',
        district: '',
        city: 'Тестове місто',
        street: 'Тестова вулиця',
        building: '1',
        apartment: '',
        postalCode: '12345'
      },
      phone: '+380501234567',
      email: 'test@test.ua',
      taxOffice: {
        name: 'Тестова податкова'
      },
      registrationDate: new Date('2020-01-01'),
      kved: {
        primary: { code: '62.01', name: 'Тест діяльність' },
        additional: [
          { code: '62.02', name: 'Інша діяльність' }
        ]
      },
      taxGroup: 3,
      isVATpayer: false,
      singleTaxRate: 0.05,
      militaryTaxRate: 0.01,
      yearlyIncomeLimit: 12000000
    };

    it('should save and load profile correctly', () => {
      saveFOPProfile(testProfile);
      expect(setItemCalled).toBe(true);
      
      const loadedProfile = loadFOPProfile();
      expect(loadedProfile).toBeTruthy();
      expect(loadedProfile?.fullName).toBe(testProfile.fullName);
      expect(loadedProfile?.tin).toBe(testProfile.tin);
      expect(loadedProfile?.email).toBe(testProfile.email);
      expect(loadedProfile?.taxOffice.name).toBe(testProfile.taxOffice.name);
    });

    it('should return null when no profile exists', () => {
      const loadedProfile = loadFOPProfile();
      expect(loadedProfile).toBeNull();
      expect(getItemCalled).toBe(true);
    });

    it('should handle corrupted data gracefully', () => {
      mockStorage['fop-profile'] = 'invalid json';
      
      const loadedProfile = loadFOPProfile();
      expect(loadedProfile).toBeNull();
    });
  });
});
