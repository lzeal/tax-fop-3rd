# Рефакторинг: Використання generateTemplateData для ЄСВ

## Зміни

### 1. `src/utils/templateUtils.ts`
- ✅ Додано імпорт `ESVReportData`
- ✅ Створено інтерфейс `ESVTemplateData` (аналогічний до `TemplateData`)
- ✅ Додано функцію `generateMonthsRows()` - генерує HTML рядки таблиці місяців
- ✅ Додано функцію `generateESVTemplateData()` - генерує дані для заповнення шаблону ЄСВ
- ✅ Зроблено `populateTemplate()` generic функцією для роботи з різними типами даних

### 2. `src/templates/esvPreviewTemplate.ts`
- ✅ Додано імпорт `ESVTemplateData` та `populateTemplate`
- ✅ Спрощено `fillESVPreviewTemplate()` - тепер використовує `populateTemplate`
- ✅ Додано `@deprecated` тег до старої функції (може бути видалена в майбутньому)

### 3. `src/components/ESVReportPreview.tsx`
- ✅ Оновлено імпорти: `generateESVTemplateData`, `populateTemplate`, `esvPreviewTemplate`
- ✅ Видалено ручне форматування дат та складання даних
- ✅ Використовується `generateESVTemplateData()` для підготовки даних
- ✅ Використовується `populateTemplate()` для заповнення шаблону

## Переваги рефакторингу

1. **Консистентність**: Обидва звіти (F0103309 та F0133109) тепер використовують однаковий підхід
2. **DRY principle**: Видалено дублювання коду для заповнення шаблонів
3. **Типобезпека**: Generic функція `populateTemplate` працює з різними типами даних
4. **Легше підтримувати**: Вся логіка генерації даних в одному місці (`templateUtils.ts`)
5. **Легше тестувати**: Функції `generateESVTemplateData` можна легко протестувати окремо

## ESVTemplateData поля

```typescript
{
  // Тип звіту
  HZ, HZN, HZU, HD
  
  // ІПН та ПІБ
  HTIN, HTINPF, HNAME
  
  // Період звітності
  H1KV, HHY, H3KV, HZM, HY, HZY
  
  // Період для уточнення
  H1KVP, HHYP, H3KVP, HYP, HZYP
  
  // Дані таблиці
  MONTHS_ROWS - HTML рядки з усіма місяцями та підсумком
  
  // Підпис
  HBOS, FILL_DATE
}
```

## Як використовувати

```typescript
import { generateESVTemplateData, populateTemplate } from '../utils/templateUtils';
import { esvPreviewTemplate } from '../templates/esvPreviewTemplate';

// Генеруємо дані для шаблону
const templateData = generateESVTemplateData(profile, reportData);

// Заповнюємо HTML шаблон
const filledHTML = populateTemplate(esvPreviewTemplate, templateData);
```

## Зворотна сумісність

Стара функція `fillESVPreviewTemplate()` все ще працює, але помічена як `@deprecated`. Нові компоненти повинні використовувати новий підхід.
