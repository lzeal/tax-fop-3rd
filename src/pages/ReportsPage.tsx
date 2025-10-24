import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import { Quarter, FOPProfile } from '../types';
import { loadFOPProfile, isProfileComplete } from '../utils/fopProfile';
import { loadPayments } from '../utils/localStorage';
import { getCurrentQuarter } from '../utils/dateUtils';
import { 
  updateAccumulatedDataWithPayments, 
  getCumulativeData, 
  getSimplifiedSystemLimitUsage,
  checkSimplifiedSystemLimit
} from '../utils/accumulatedData';
import { 
  generateTaxReport, 
  generateXML, 
  downloadXML, 
  validateReport 
} from '../utils/xmlGenerator';

export const ReportsPage: React.FC = () => {
  const [profile, setProfile] = useState<FOPProfile | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(getCurrentQuarter());
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = loadFOPProfile();
    setProfile(savedProfile);
  }, []);

  const handleGenerateReport = () => {
    if (!profile) {
      setErrors(['Спочатку заповніть профіль ФОП']);
      return;
    }

    if (!isProfileComplete(profile)) {
      setErrors(['Профіль ФОП заповнений не повністю']);
      return;
    }

    try {
      const payments = loadPayments();
      const accumulatedData = updateAccumulatedDataWithPayments(payments, selectedQuarter.year);
      
      const report = generateTaxReport(profile, accumulatedData, selectedQuarter.quarter);
      const reportErrors = validateReport(report, profile);
      
      if (reportErrors.length > 0) {
        setErrors(reportErrors);
        return;
      }

      const xml = generateXML(report, profile);
      const filename = `F0103309_${profile.tin}_${selectedQuarter.year}_Q${selectedQuarter.quarter}.xml`;
      
      downloadXML(xml, filename);
      setSuccess(`Звіт F0103309 успішно згенеровано: ${filename}`);
      setErrors([]);
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error generating report:', error);
      setErrors(['Помилка генерації звіту']);
    }
  };

  // Форматування валюти
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Отримання даних для відображення
  const getReportData = () => {
    if (!profile) return null;
    
    const payments = loadPayments();
    const accumulatedData = updateAccumulatedDataWithPayments(payments, selectedQuarter.year);
    const cumulativeData = getCumulativeData(accumulatedData, selectedQuarter.quarter);
    const limitUsage = getSimplifiedSystemLimitUsage(accumulatedData, selectedQuarter.quarter);
    const withinLimit = checkSimplifiedSystemLimit(accumulatedData, selectedQuarter.quarter);
    
    return {
      accumulatedData,
      cumulativeData,
      limitUsage,
      withinLimit
    };
  };

  const reportData = getReportData();
  const profileComplete = profile && isProfileComplete(profile);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Генерація звітів F0103309
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Звіт про доходи з джерелами їх отримання (3-тя група, неплатник ПДВ)
        </Typography>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Статус профілю */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6">Статус готовності до звітності</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {profileComplete ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Профіль ФОП заповнений"
                    color="success"
                  />
                ) : (
                  <Chip
                    icon={<WarningIcon />}
                    label="Профіль ФОП не заповнений"
                    color="warning"
                  />
                )}
                
                {reportData && (
                  <Chip
                    icon={reportData.withinLimit ? <CheckCircleIcon /> : <WarningIcon />}
                    label={`Ліміт: ${reportData.limitUsage}%`}
                    color={reportData.withinLimit ? 'success' : 'warning'}
                  />
                )}
              </Box>
              
              {!profileComplete && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Для генерації звіту необхідно заповнити профіль ФОП. 
                  Перейдіть на сторінку "Профіль ФОП" та введіть всі обов'язкові дані.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Вибір періоду */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Звітний період
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Рік</InputLabel>
                  <Select
                    value={selectedQuarter.year}
                    onChange={(e) => setSelectedQuarter(prev => ({ 
                      ...prev, 
                      year: Number(e.target.value) 
                    }))}
                    label="Рік"
                  >
                    {[2024, 2025, 2026].map(year => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Квартал</InputLabel>
                  <Select
                    value={selectedQuarter.quarter}
                    onChange={(e) => setSelectedQuarter(prev => ({ 
                      ...prev, 
                      quarter: Number(e.target.value) as 1 | 2 | 3 | 4
                    }))}
                    label="Квартал"
                  >
                    <MenuItem value={1}>1 квартал</MenuItem>
                    <MenuItem value={2}>2 квартал</MenuItem>
                    <MenuItem value={3}>3 квартал</MenuItem>
                    <MenuItem value={4}>4 квартал</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>

          {/* Попередній перегляд звіту */}
          {reportData && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Попередній перегляд звіту
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedQuarter.quarter} квартал {selectedQuarter.year} року
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Card variant="outlined" sx={{ minWidth: 200, flex: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Доходи в гривнях
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(reportData.cumulativeData.incomeUAH)}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ minWidth: 200, flex: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Доходи в інвалюті
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(reportData.cumulativeData.incomeForeign)}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ minWidth: 200, flex: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Загальні доходи
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(reportData.cumulativeData.incomeTotal)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Розрахунок податків (накопичувально з початку року)
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Card variant="outlined" sx={{ minWidth: 180, flex: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Єдиний податок (5%)
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(reportData.cumulativeData.singleTax)}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ minWidth: 180, flex: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Військовий збір (1%)
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(reportData.cumulativeData.militaryTax)}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ minWidth: 180, flex: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Всього до сплати
                      </Typography>
                      <Typography variant="h6" color="secondary">
                        {formatCurrency(
                          reportData.cumulativeData.singleTax + 
                          reportData.cumulativeData.militaryTax
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Статус ліміту */}
                <Typography variant="subtitle1" gutterBottom>
                  Статус ліміту спрощеної системи
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Використання ліміту: {reportData.limitUsage}%
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(12000000)} (ліміт на рік)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(reportData.limitUsage, 100)}
                    color={reportData.withinLimit ? 'success' : 'warning'}
                  />
                </Box>

                {!reportData.withinLimit && (
                  <Alert severity="warning">
                    <strong>Увага!</strong> Доходи перевищують ліміт для 3-ї групи спрощеної системи оподаткування. 
                    Можливо, необхідно перейти на загальну систему оподаткування.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Кнопка генерації */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleGenerateReport}
              disabled={!profileComplete || !reportData}
              sx={{ minWidth: 200 }}
            >
              Згенерувати XML звіт
            </Button>
            
            {profileComplete && reportData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Файл буде завантажено на ваш комп'ютер
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};