import React, { useState } from 'react';
import { ESVSettings } from '../types';
import { 
  loadESVSettings, 
  saveESVSettings 
} from '../utils/esvSettings';

interface ESVSettingsModalProps {
  year: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ESVSettingsModal: React.FC<ESVSettingsModalProps> = ({ 
  year, 
  isOpen, 
  onClose,
  onSave 
}) => {
  const [settings, setSettings] = useState<ESVSettings>(loadESVSettings(year));

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const handleMonthChange = (
    month: number, 
    field: 'incomeBase' | 'contributionRate', 
    value: number
  ) => {
    const updatedSettings = { ...settings };
    const monthSettings = updatedSettings.monthlySettings.find(m => m.month === month);
    
    if (monthSettings) {
      monthSettings[field] = value;
      setSettings(updatedSettings);
    }
  };

  const handleApplyFromMonth = (month: number, incomeBase: number, contributionRate: number) => {
    const updatedSettings = { ...settings };
    
    for (let m = month; m <= 12; m++) {
      const monthSettings = updatedSettings.monthlySettings.find(ms => ms.month === m);
      if (monthSettings) {
        monthSettings.incomeBase = incomeBase;
        monthSettings.contributionRate = contributionRate;
      }
    }
    
    setSettings(updatedSettings);
  };

  const handleSave = () => {
    saveESVSettings(settings);
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <h2>Налаштування ЄСВ для {year} року</h2>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Місяць</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Сума доходу (грн)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ставка ЄСВ (%)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Сума ЄСВ (грн)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {settings.monthlySettings.map((monthSettings) => {
              const esvAmount = (monthSettings.incomeBase * monthSettings.contributionRate / 100).toFixed(2);
              
              return (
                <tr key={monthSettings.month}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {monthNames[monthSettings.month - 1]}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <input
                      type="number"
                      value={monthSettings.incomeBase}
                      onChange={(e) => handleMonthChange(
                        monthSettings.month, 
                        'incomeBase', 
                        parseFloat(e.target.value) || 0
                      )}
                      style={{ width: '100px', padding: '4px' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <input
                      type="number"
                      value={monthSettings.contributionRate}
                      onChange={(e) => handleMonthChange(
                        monthSettings.month, 
                        'contributionRate', 
                        parseFloat(e.target.value) || 0
                      )}
                      style={{ width: '80px', padding: '4px' }}
                      step="0.1"
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                    {esvAmount}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button
                      onClick={() => handleApplyFromMonth(
                        monthSettings.month,
                        monthSettings.incomeBase,
                        monthSettings.contributionRate
                      )}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Застосувати далі
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ESVSettingsModal;
