import React from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Alert } from '@mui/material';
import { FOPProfile, QuarterlyCalculation } from '../types';
import { calculateTaxBalance, checkTaxLimits, formatCurrency } from '../utils/taxCalculations';

interface TaxReportFormProps {
  profile: FOPProfile;
  calculation: QuarterlyCalculation;
  quarter: number;
  year: number;
}

const TaxReportForm: React.FC<TaxReportFormProps> = ({ profile, calculation, quarter, year }) => {
  // Перевірка лімітів
  const limitCheck = checkTaxLimits(calculation, profile);
  
  // Розрахунок сум до доплати/повернення
  const singleTaxBalance = calculateTaxBalance(calculation.cumulativeSingleTax, calculation.cumulativeSingleTaxPaid);
  const militaryTaxBalance = calculateTaxBalance(calculation.cumulativeMilitaryTax, calculation.cumulativeMilitaryTaxPaid);

  // Форматування дати у форматі ДД.ММ.РРРР
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('uk-UA');
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        backgroundColor: 'white',
        fontSize: '12px',
        fontFamily: 'Times New Roman, serif',
        border: '1px solid #000',
        '& .MuiTableCell-root': {
          fontSize: '12px',
          fontFamily: 'Times New Roman, serif',
          border: '1px solid #000',
          padding: '4px 8px',
        }
      }}
    >
      {/* Попередження про ліміти */}
      {!limitCheck.withinLimits && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '12px' }}>
          {limitCheck.warningMessage}
        </Alert>
      )}
      {limitCheck.withinLimits && limitCheck.warningMessage && (
        <Alert severity="warning" sx={{ mb: 2, fontSize: '12px' }}>
          {limitCheck.warningMessage}
        </Alert>
      )}

      {/* Заголовок форми */}
      <Box textAlign="center" mb={2}>
        <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 'bold', mb: 1 }}>
          ПОДАТКОВА ДЕКЛАРАЦІЯ
        </Typography>
        <Typography sx={{ fontSize: '12px', mb: 1 }}>
          про доходи фізичної особи - підприємця
        </Typography>
        <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>
          (форма F0103309)
        </Typography>
      </Box>

      {/* Інформація про період та платника */}
      <Box mb={3}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: '30%', fontWeight: 'bold' }}>
                Звітний (податковий) період:
              </TableCell>
              <TableCell>{quarter} квартал {year} року</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Податковий номер:
              </TableCell>
              <TableCell>{profile.tin}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Прізвище, ім'я, по батькові:
              </TableCell>
              <TableCell>{profile.fullName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Податкова адреса:
              </TableCell>
              <TableCell>
                {profile.address.postalCode}, {profile.address.region}, {profile.address.city}, {profile.address.street}, {profile.address.building}
                {profile.address.apartment && `, кв. ${profile.address.apartment}`}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Код та найменування ДПІ:
              </TableCell>
              <TableCell>{profile.taxOffice.code} {profile.taxOffice.name}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Таблиця доходів та податків */}
      <Box mb={3}>
        <Typography variant="h6" sx={{ fontSize: '13px', fontWeight: 'bold', mb: 2 }}>
          РОЗРАХУНОК СУМА ДОХОДУ ТА ПОДАТКОВИХ ЗОБОВ'ЯЗАНЬ
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Показники
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '15%' }}>
                  Код рядка
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>
                  За звітний період
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>
                  Наростаючим підсумком
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  Загальна сума доходу (виручки) від реалізації товарів (робіт, послуг)
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>010</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.quarterlyIncome)}
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.cumulativeIncome)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell>
                  Сума єдиного податку, обчислена до сплати
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>020</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.quarterlySingleTax)}
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.cumulativeSingleTax)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  Сума єдиного податку, сплачена у звітному періоді
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>030</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.quarterlySingleTaxPaid)}
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.cumulativeSingleTaxPaid)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  Сума військового збору, обчислена до сплати
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>040</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.quarterlyMilitaryTax)}
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.cumulativeMilitaryTax)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  Сума військового збору, сплачена у звітному періоді
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>050</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.quarterlyMilitaryTaxPaid)}
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  {formatCurrency(calculation.cumulativeMilitaryTaxPaid)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Підсумки */}
      <Box mb={3}>
        <Typography variant="h6" sx={{ fontSize: '13px', fontWeight: 'bold', mb: 2 }}>
          ПІДСУМОК
        </Typography>
        
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: '60%', fontWeight: 'bold' }}>
                Сума єдиного податку до доплати:
              </TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(singleTaxBalance.toPay)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Сума військового збору до доплати:
              </TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(militaryTaxBalance.toPay)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Сума єдиного податку до повернення:
              </TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(singleTaxBalance.toReturn)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Сума військового збору до повернення:
              </TableCell>
              <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(militaryTaxBalance.toReturn)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* КВЕД інформація */}
      <Box mb={3}>
        <Typography variant="h6" sx={{ fontSize: '13px', fontWeight: 'bold', mb: 2 }}>
          ВИДИ ЕКОНОМІЧНОЇ ДІЯЛЬНОСТІ
        </Typography>
        
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Код КВЕД
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Назва виду діяльності
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Основний/Додатковий
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ textAlign: 'center' }}>
                {profile.kved.primary}
              </TableCell>
              <TableCell>
                Основний вид діяльності
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                Основний
              </TableCell>
            </TableRow>
            {profile.kved.additional.map((kved, index) => (
              <TableRow key={index}>
                <TableCell sx={{ textAlign: 'center' }}>
                  {kved}
                </TableCell>
                <TableCell>
                  Додатковий вид діяльності
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  Додатковий
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Підпис */}
      <Box mt={4}>
        <Typography sx={{ fontSize: '12px', mb: 2 }}>
          Достовірність та повноту відомостей, зазначених у цій декларації, підтверджую:
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontSize: '12px' }}>
              Підпис ________________________
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '12px' }}>
              Дата складання: {formatDate(new Date())}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default TaxReportForm;