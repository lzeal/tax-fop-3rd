import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import QuarterSelector from '../components/QuarterSelector';
import PaymentsTable from '../components/PaymentsTable';
import AddPaymentModal from '../components/AddPaymentModal';
import ImportModal from '../components/ImportModal';
import { Payment, Quarter } from '../types';
import { loadPayments, savePayments } from '../utils/localStorage';
import { getCurrentQuarter } from '../utils/dateUtils';
import { 
  updateAccumulatedDataWithPayments, 
  getCumulativeData, 
  getQuarterData,
  getSimplifiedSystemLimitUsage,
  checkSimplifiedSystemLimit
} from '../utils/accumulatedData';

const IncomesPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(getCurrentQuarter());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const loadedPayments = loadPayments();
    setPayments(loadedPayments);
  }, []);

  // Оновлюємо накопичувальні дані при зміні платежів
  useEffect(() => {
    if (payments.length > 0) {
      updateAccumulatedDataWithPayments(payments, selectedQuarter.year);
    }
  }, [payments, selectedQuarter.year]);

  const handleAddPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    savePayments(updatedPayments);
  };

  const handleImportPayments = (importedPayments: Payment[]) => {
    const updatedPayments = [...payments, ...importedPayments];
    setPayments(updatedPayments);
    savePayments(updatedPayments);
  };

  const handleDeletePayment = (paymentId: string) => {
    const updatedPayments = payments.filter(p => p.id !== paymentId);
    setPayments(updatedPayments);
    savePayments(updatedPayments);
  };

  const handleImportFile = () => {
    setIsImportModalOpen(true);
  };

  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    const quarterStart = new Date(selectedQuarter.year, (selectedQuarter.quarter - 1) * 3, 1);
    const quarterEnd = new Date(selectedQuarter.year, selectedQuarter.quarter * 3, 0);
    return paymentDate >= quarterStart && paymentDate <= quarterEnd;
  });

  // Отримуємо накопичувальні дані
  const accumulatedData = updateAccumulatedDataWithPayments(payments, selectedQuarter.year);
  const quarterData = getQuarterData(accumulatedData, selectedQuarter.quarter);
  const cumulativeData = getCumulativeData(accumulatedData, selectedQuarter.quarter);
  const limitUsage = getSimplifiedSystemLimitUsage(accumulatedData, selectedQuarter.quarter);
  const withinLimit = checkSimplifiedSystemLimit(accumulatedData, selectedQuarter.quarter);

  // Форматування валюти
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Надходження ФОП
      </Typography>
      
      {/* Статистика та ліміти */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Статистика за {selectedQuarter.year} рік
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="subtitle2">Квартальний дохід</Typography>
              </Box>
              <Typography variant="h6">
                {formatCurrency(quarterData.incomeTotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedQuarter.quarter} квартал {selectedQuarter.year}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceIcon color="secondary" />
                <Typography variant="subtitle2">Накопичувальний дохід</Typography>
              </Box>
              <Typography variant="h6">
                {formatCurrency(cumulativeData.incomeTotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                З початку року
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 220, flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {withinLimit ? (
                  <TrendingUpIcon color="success" />
                ) : (
                  <WarningIcon color="warning" />
                )}
                <Typography variant="subtitle2">Ліміт спрощеної системи</Typography>
              </Box>
              <Typography variant="h6" color={withinLimit ? 'success.main' : 'warning.main'}>
                {limitUsage}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(limitUsage, 100)}
                color={withinLimit ? 'success' : 'warning'}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                з 12 млн грн на рік
              </Typography>
              {!withinLimit && (
                <Chip
                  label="Перевищення ліміту!"
                  color="warning"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Розрахунок податків за квартал */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          Розрахунок податків за {selectedQuarter.quarter} квартал {selectedQuarter.year}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ minWidth: 180, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Єдиний податок (5%)
              </Typography>
              <Typography variant="h6">
                {formatCurrency(quarterData.singleTax)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                За поточний квартал
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 180, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Військовий збір (1%)
              </Typography>
              <Typography variant="h6">
                {formatCurrency(quarterData.militaryTax)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                За поточний квартал
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 180, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Всього за квартал
              </Typography>
              <Typography variant="h6" color="secondary">
                {formatCurrency(quarterData.singleTax + quarterData.militaryTax)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                До сплати за період
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Розрахунок податків (накопичувально) */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Розрахунок податків (накопичувально з початку року)
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card sx={{ minWidth: 180, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Єдиний податок (5%)
              </Typography>
              <Typography variant="h6">
                {formatCurrency(cumulativeData.singleTax)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                З початку року
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 180, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Військовий збір (1%)
              </Typography>
              <Typography variant="h6">
                {formatCurrency(cumulativeData.militaryTax)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                З початку року
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 180, flex: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Всього накопичувально
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(cumulativeData.singleTax + cumulativeData.militaryTax)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                З початку року
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 3
        }}>
          <Box sx={{ flex: { md: 1 } }}>
            <QuarterSelector
              selectedQuarter={selectedQuarter}
              onQuarterChange={setSelectedQuarter}
            />
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: { xs: 'stretch', md: 'flex-end' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleImportFile}
            >
              Імпорт з виписки
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Додати надходження
            </Button>
          </Box>
        </Box>
      </Paper>

      <PaymentsTable
        payments={filteredPayments}
        onDeletePayment={handleDeletePayment}
      />

      <AddPaymentModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPayment={handleAddPayment}
      />

      <ImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportPayments={handleImportPayments}
      />
    </Box>
  );
};

export default IncomesPage;