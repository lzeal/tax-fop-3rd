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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
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
  validateReport,
  generateDPSFilename,
  getPeriodTypeCode,
} from '../utils/xmlGenerator';
import { calculateQuarterlyData } from '../utils/taxCalculations';
import TaxReportForm from '../components/TaxReportForm';
import ESVSettingsModal from '../components/ESVSettingsModal';
import ESVReportPreview from '../components/ESVReportPreview';
import { 
  generateESVReportData, 
  generateESVReport, 
  generateESVXML, 
  downloadESVXML,
  validateESVReport 
} from '../utils/esvXmlGenerator';

export const ReportsPage: React.FC = () => {
  const [profile, setProfile] = useState<FOPProfile | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(getCurrentQuarter());
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showESVSettings, setShowESVSettings] = useState(false);
  const [showESVPreview, setShowESVPreview] = useState(false);

  useEffect(() => {
    const savedProfile = loadFOPProfile();
    setProfile(savedProfile);
  }, []);

  const handlePrintReport = () => {
    window.print();
  };

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

      const periodType = getPeriodTypeCode(selectedQuarter.quarter);
      const periodMonth = selectedQuarter.quarter * 3;
      const mainFilename = generateDPSFilename(profile, '033', periodType, periodMonth, selectedQuarter.year);

      const linkedESVFilename = selectedQuarter.quarter === 4
        ? generateDPSFilename(profile, '331', '5', 12, selectedQuarter.year)
        : null;

      const xml = generateXML(report, profile, linkedESVFilename);

      downloadXML(xml, mainFilename);
      setSuccess(`Звіт F0103309 успішно згенеровано: ${mainFilename}`);
      setErrors([]);
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error generating report:', error);
      setErrors(['Помилка генерації звіту']);
    }
  };

  const handleGenerateESVReport = () => {
    if (!profile) {
      setErrors(['Спочатку заповніть профіль ФОП']);
      return;
    }

    if (!isProfileComplete(profile)) {
      setErrors(['Профіль ФОП заповнений не повністю']);
      return;
    }

    try {
      const reportData = generateESVReportData(selectedQuarter.year);
      const report = generateESVReport(reportData);
      const reportErrors = validateESVReport(report, profile);
      
      if (reportErrors.length > 0) {
        setErrors(reportErrors);
        return;
      }

      const mainFilename = generateDPSFilename(profile, '033', '5', 12, selectedQuarter.year);
      const esvFilename = generateDPSFilename(profile, '331', '5', 12, selectedQuarter.year);

      const xml = generateESVXML(report, profile, mainFilename);
      downloadESVXML(xml, selectedQuarter.year, esvFilename);

      setSuccess(`Звіт ЄСВ F0133109 успішно згенеровано: ${esvFilename}`);
      setErrors([]);
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error generating ESV report:', error);
      setErrors(['Помилка генерації звіту ЄСВ']);
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
          Звіт платника єдиного податку (3-тя група, неплатник ПДВ)
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
                        Доходи в іноземній валюті
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

          {/* Кнопки генерації */}
          <Box sx={{ textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<VisibilityIcon />}
              onClick={() => setShowPreview(true)}
              disabled={!profileComplete || !reportData}
              sx={{ minWidth: 200 }}
            >
              Переглянути звіт F0103309
            </Button>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleGenerateReport}
              disabled={!profileComplete || !reportData}
              sx={{ minWidth: 200 }}
            >
              Згенерувати F0103309 XML
            </Button>
          </Box>

          {/* Розділ для звіту ЄСВ F0133109 - показуємо тільки для 4 кварталу */}
          {selectedQuarter.quarter === 4 && (
            <Card sx={{ mt: 3, borderLeft: '4px solid #1976d2' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Звіт ЄСВ F0133109 (річний)
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Звіт про суми нарахованого єдиного внеску на загальнообов'язкове державне соціальне страхування
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                  Звіт ЄСВ подається за весь {selectedQuarter.year} рік. 
                  Перед генерацією переконайтеся, що налаштування ЄСВ для кожного місяця заповнені коректно.
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowESVSettings(true)}
                    sx={{ minWidth: 200 }}
                  >
                    Налаштування ЄСВ
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setShowESVPreview(true)}
                    disabled={!profileComplete}
                    sx={{ minWidth: 200 }}
                  >
                    Переглянути звіт ЄСВ
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleGenerateESVReport}
                    disabled={!profileComplete}
                    sx={{ minWidth: 200 }}
                  >
                    Згенерувати F0133109 XML
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {profileComplete && reportData && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Переглянь звіт перед завантаженням XML файлу
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Діалог попереднього перегляду звіту */}
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          Попередній перегляд звіту F0103309 - {selectedQuarter.quarter} квартал {selectedQuarter.year}
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }} className="report-dialog-content">
          {profile && reportData && (() => {
            // Створюємо дані для попереднього перегляду
            const accumulatedData = updateAccumulatedDataWithPayments(
              loadPayments(), 
              selectedQuarter.year
            );
            const calculation = calculateQuarterlyData(accumulatedData, profile, selectedQuarter.quarter);
            
            return (
              <div className="report-content">
                <TaxReportForm
                  profile={profile}
                  calculation={calculation}
                  quarter={selectedQuarter.quarter}
                  year={selectedQuarter.year}
                />
              </div>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Закрити
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrintReport}
          >
            Друк/PDF
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              setShowPreview(false);
              handleGenerateReport();
            }}
          >
            Завантажити XML
          </Button>
        </DialogActions>
      </Dialog>

      {/* Діалог налаштувань ЄСВ */}
      <ESVSettingsModal
        year={selectedQuarter.year}
        isOpen={showESVSettings}
        onClose={() => setShowESVSettings(false)}
        onSave={() => {
          setSuccess('Налаштування ЄСВ збережено');
          setTimeout(() => setSuccess(null), 3000);
        }}
      />

      {/* Діалог попереднього перегляду звіту ЄСВ */}
      <Dialog 
        open={showESVPreview} 
        onClose={() => setShowESVPreview(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          Попередній перегляд звіту ЄСВ F0133109 - {selectedQuarter.year} рік
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }} className="report-dialog-content">
          {profile && (() => {
            const reportData = generateESVReportData(selectedQuarter.year);
            return (
              <div className="report-content">
                <ESVReportPreview
                  profile={profile}
                  reportData={reportData}
                />
              </div>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowESVPreview(false)}>
            Закрити
          </Button>
          <Button 
            onClick={() => setShowESVSettings(true)}
            variant="outlined"
          >
            Налаштування
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrintReport}
          >
            Друк/PDF
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              setShowESVPreview(false);
              handleGenerateESVReport();
            }}
          >
            Завантажити XML
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};