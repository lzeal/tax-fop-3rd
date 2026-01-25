import React from 'react';
import { FOPProfile, ESVReportData } from '../types';
import { generateESVTemplateData, populateTemplate } from '../utils/templateUtils';
import { esvPreviewTemplate } from '../templates/esvPreviewTemplate';

interface ESVReportPreviewProps {
  profile: FOPProfile;
  reportData: ESVReportData;
}

const ESVReportPreview: React.FC<ESVReportPreviewProps> = ({ 
  profile, 
  reportData 
}) => {
  // Генеруємо дані для шаблону
  const templateData = generateESVTemplateData(profile, reportData);
  
  // Заповнюємо HTML шаблон
  const filledHTML = populateTemplate(esvPreviewTemplate, templateData);

  return (
    <div 
      style={{ 
        width: '210mm',
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

export default ESVReportPreview;
