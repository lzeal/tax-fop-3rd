import { FOPProfile, QuarterlyCalculation } from '../types';
import { formatCurrency } from './taxCalculations';

export interface TemplateData {
  // Заголовок та документ
  HZ: string;
  HZN: string;
  HZU: string;
  HD: string;
  
  // Період
  H1KV: string;
  HHY: string;
  H3KV: string;
  HY: string;
  HZM: string;
  HZY: string;
  
  // Період для уточнення
  H1KVP: string;
  HHYP: string;
  H3KVP: string;
  HYP: string;
  HZYP: string;
  
  // Контролюючий орган
  HSTI: string;
  
  // Платник
  HNAME: string;
  HLOC: string;
  HEMAIL: string;
  HTEL: string;
  HTIN: string;
  
  // Особливі відмітки
  M081: string;
  M082: string;
  
  // Працівники
  HNACTL: string;
  
  // КВЕДи (динамічні)
  KVED_ROWS: string;
  
  // Авансові внески 1-2 група
  R02G1: string;
  R02G2: string;
  R02G3: string;
  R02G4: string;
  R001G3: string;
  R002G3: string;
  
  R03G1: string;
  R03G2: string;
  R03G3: string;
  R03G4: string;
  R003G3: string;
  R004G3: string;
  
  // 3 група - доходи
  R005G3: string;
  R006G3: string;
  R007G3: string;
  
  // Податкові зобов'язання
  R008G3: string;
  R009G3: string;
  R010G3: string;
  R011G3: string;
  R012G3: string;
  R013G3: string;
  R0141G3: string;
  R0142G3: string;
  R014G3: string;
  
  // Виправлення помилок
  R015G3: string;
  R016G3: string;
  R017G3: string;
  R018G3: string;
  R019G1: string;
  R019G3: string;
  R020G3: string;
  
  // ЄСВ
  R021G3: string;
  
  // Військовий збір 1-2 група
  R08G1: string;
  R08G2: string;
  R08G3: string;
  R08G4: string;
  R08G5: string;
  R08G6: string;
  R08G7: string;
  R08G8: string;
  R08G9: string;
  R08G10: string;
  R08G11: string;
  R08G12: string;
  R022G3: string;
  
  // Військовий збір 3 група
  R023G3: string;
  R024G3: string;
  R025G3: string;
  R026G3: string;
  R027G3: string;
  R028G3: string;
  R029G3: string;
  
  // Додатки
  HJAR: string;
  T2R0001G2S: string;
  HD1: string;
  HD2: string;
  
  // Підпис
  HFILL: string;
  HEXECUTOR: string;
  HKEXECUTOR: string;
  HBOS: string;
}

/**
 * Генерує HTML рядки для КВЕДів у таблиці
 */
function generateKvedRows(profile: FOPProfile): string {
  const allKveds = [];
  
  // Додаємо основний КВЕД
  if (profile.kved.primary.code) {
    allKveds.push({
      number: 1,
      code: profile.kved.primary.code,
      name: profile.kved.primary.name
    });
  }
  
  // Додаємо додаткові КВЕДи
  profile.kved.additional.forEach((kved, index) => {
    if (kved.code) {
      allKveds.push({
        number: index + 2,
        code: kved.code,
        name: kved.name
      });
    }
  });
  
  // Генеруємо HTML рядки
  return allKveds.map(kved => `
    <tr>
      <td>${kved.number}&nbsp;</td>
      <td class=" text-center"> ${kved.code}</td>
      <td class=" text-center" colspan="2"> ${kved.name}</td>
    </tr>`).join('');
}

/**
 * Генерує дані для заповнення HTML шаблону декларації F0103309
 */
export function generateTemplateData(
  profile: FOPProfile, 
  calculation: QuarterlyCalculation, 
  quarter: number, 
  year: number
): TemplateData {
  // Формуємо адресу з компонентів
  const fullAddress = [
    profile.address.postalCode,
    profile.address.region,
    profile.address.district,
    profile.address.city,
    profile.address.street,
    profile.address.building,
    profile.address.apartment
  ].filter(Boolean).join(', ');
  return {
    // Заголовок та документ
    HZ: 'X',
    HZN: '',
    HZU: '',
    HD: '',
    
    // Період
    H1KV: quarter === 1 ? 'X' : '',
    HHY: quarter === 2 ? 'X' : '',
    H3KV: quarter === 3 ? 'X' : '',
    HY: quarter === 4 ? 'X' : '',
    HZM: '',
    HZY: year.toString(),
    
    // Період для уточнення
    H1KVP: '',
    HHYP: '',
    H3KVP: '',
    HYP: '',
    HZYP: '',
    
    // Контролюючий орган
    HSTI: profile.taxOffice?.name || '',
    
    // Платник
    HNAME: profile.fullName,
    HLOC: fullAddress,
    HEMAIL: profile.email,
    HTEL: profile.phone,
    HTIN: profile.tin,
    
    // Особливі відмітки
    M081: '',
    M082: '',
    
    // Працівники
    HNACTL: '',
    
    // КВЕДи (динамічні)
    KVED_ROWS: generateKvedRows(profile),
    
    // Авансові внески 1-2 група (для 3 групи пусті)
    R02G1: '',
    R02G2: '',
    R02G3: '',
    R02G4: '',
    R001G3: '',
    R002G3: '',
    
    R03G1: '',
    R03G2: '',
    R03G3: '',
    R03G4: '',
    R003G3: '',
    R004G3: '',
    
    // 3 група - доходи (використовуємо дані з розрахунку)
    R005G3: '',
    R006G3: formatCurrency(calculation.cumulativeIncome),
    R007G3: '',
    
    // Податкові зобов'язання - Єдиний податок
    R008G3: formatCurrency(calculation.cumulativeIncome),
    R009G3: '',
    R010G3: '',
    R011G3: formatCurrency(calculation.cumulativeSingleTax),
    R012G3: formatCurrency(calculation.cumulativeSingleTax),
    R013G3: formatCurrency(Math.max(0, calculation.cumulativeSingleTax - calculation.quarterlySingleTax)),
    R0141G3: formatCurrency(calculation.quarterlySingleTax),
    R0142G3: '',
    R014G3: formatCurrency(calculation.quarterlySingleTax),
    
    // Виправлення помилок
    R015G3: '',
    R016G3: '',
    R017G3: '',
    R018G3: '',
    R019G1: '',
    R019G3: '',
    R020G3: '',
    
    R021G3: '',
    
    // Військовий збір 1-2 група (для 3 групи пусті)
    R08G1: '',
    R08G2: '',
    R08G3: '',
    R08G4: '',
    R08G5: '',
    R08G6: '',
    R08G7: '',
    R08G8: '',
    R08G9: '',
    R08G10: '',
    R08G11: '',
    R08G12: '',
    R022G3: '',
    
    // Військовий збір 3 група (використовуємо дані з розрахунку)
    R023G3: formatCurrency(calculation.cumulativeMilitaryTax),
    R024G3: formatCurrency(Math.max(0, calculation.cumulativeMilitaryTax - calculation.quarterlyMilitaryTax)),
    R025G3: formatCurrency(calculation.quarterlyMilitaryTax), // Нарахований збір
    R026G3: '',
    R027G3: '',
    R028G3: '',
    R029G3: '',
    
    // Додатки
    HJAR: '',
    T2R0001G2S: '',
    HD1: '',
    HD2: '',
    
    // Підпис
    HFILL: new Date().toLocaleDateString('uk-UA'),
    HEXECUTOR: profile.fullName,
    HKEXECUTOR: '',
    HBOS: profile.fullName
  };
}

/**
 * Заміняє плейсхолдери {{key}} у HTML шаблоні на реальні значення
 */
export function populateTemplate(template: string, data: TemplateData): string {
  let result = template;
  
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  });
  
  return result;
}