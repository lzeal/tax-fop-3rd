import React from 'react';
import { FOPProfile, QuarterlyCalculation } from '../types';
import { generateTemplateData, populateTemplate } from '../utils/templateUtils';
import { htmlTemplate } from '../templates/previewTemplate';

interface TaxReportFormProps {
  profile: FOPProfile;
  calculation: QuarterlyCalculation;
  quarter: 1 | 2 | 3 | 4;
  year: number;
  esvTotalContribution?: number | null;
}

const TaxReportForm: React.FC<TaxReportFormProps> = ({
  profile,
  calculation,
  quarter,
  year,
  esvTotalContribution = null,
}) => {
  // Генерація даних для шаблону
  const templateData = generateTemplateData(profile, calculation, quarter, year, esvTotalContribution);
  
  // Заповнення HTML шаблону
  const filledHTML = populateTemplate(htmlTemplate, templateData);

  return (
    <div 
      style={{ 
        width: '210mm', // A4 ширина
        maxWidth: '100%',
        margin: '0 auto',
        fontFamily: '"Times New Roman", Times, serif',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
      dangerouslySetInnerHTML={{ __html: filledHTML }}
    />
  );
};

export default TaxReportForm;
