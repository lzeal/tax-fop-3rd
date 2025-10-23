import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { Payment } from '../types';
import { getExchangeRate, convertToUAH } from '../utils/exchangeRates';

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  open,
  onClose,
  onAddPayment,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    currencyCode: 'UAH' as 'UAH' | 'EUR' | 'USD',
    amount: '',
    counterparty: '',
    counterpartyAccount: '',
    description: '', // Призначення платежу
  });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchExchangeRate = useCallback(async () => {
    if (formData.currencyCode === 'UAH') return;
    
    setLoading(true);
    setError('');
    
    try {
      const date = new Date(formData.date);
      const rate = await getExchangeRate(formData.currencyCode, date);
      if (rate) {
        setExchangeRate(rate.rate);
      } else {
        setError(`Не вдалося отримати курс ${formData.currencyCode} на ${date.toLocaleDateString('uk-UA')}`);
      }
    } catch (err) {
      setError('Помилка при отриманні курсу валют');
    } finally {
      setLoading(false);
    }
  }, [formData.currencyCode, formData.date]);

  useEffect(() => {
    if (formData.currencyCode !== 'UAH' && formData.date) {
      fetchExchangeRate();
    } else {
      setExchangeRate(null);
    }
  }, [formData.currencyCode, formData.date, fetchExchangeRate]);

  const handleSubmit = () => {
    if (!formData.amount || !formData.counterparty || !formData.counterpartyAccount) {
      setError('Заповніть всі обов\'язкові поля');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Введіть коректну суму');
      return;
    }

    if (formData.currencyCode !== 'UAH' && !exchangeRate) {
      setError('Неможливо розрахувати суму в гривнях без курсу валют');
      return;
    }

    const amountUAH = convertToUAH(amount, formData.currencyCode, exchangeRate || undefined);

    const payment: Omit<Payment, 'id'> = {
      date: new Date(formData.date),
      currencyCode: formData.currencyCode,
      amount,
      amountUAH,
      counterparty: formData.counterparty,
      counterpartyAccount: formData.counterpartyAccount,
      description: formData.description || undefined,
      exchangeRate: formData.currencyCode !== 'UAH' ? exchangeRate || undefined : undefined,
    };

    onAddPayment(payment);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      currencyCode: 'UAH',
      amount: '',
      counterparty: '',
      counterpartyAccount: '',
      description: '',
    });
    setExchangeRate(null);
    setError('');
    onClose();
  };

  const calculatedUAH = formData.amount && exchangeRate 
    ? (parseFloat(formData.amount) * exchangeRate).toFixed(2)
    : formData.currencyCode === 'UAH' ? formData.amount : '';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Додати надходження</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Дата"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                required
                sx={{ flex: 1 }}
              />
              
              <FormControl required sx={{ flex: 1 }}>
                <InputLabel>Валюта</InputLabel>
                <Select
                  value={formData.currencyCode}
                  label="Валюта"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currencyCode: e.target.value as 'UAH' | 'EUR' | 'USD',
                    })
                  }
                >
                  <MenuItem value="UAH">UAH - Гривня</MenuItem>
                  <MenuItem value="EUR">EUR - Євро</MenuItem>
                  <MenuItem value="USD">USD - Долар США</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Сума"
                type="number"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                inputProps={{ step: '0.01', min: '0' }}
                sx={{ flex: 1 }}
              />
              
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {loading && formData.currencyCode !== 'UAH' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption">Завантаження курсу...</Typography>
                  </Box>
                )}
                {exchangeRate && (
                  <Typography variant="body2" color="text.secondary">
                    Курс {formData.currencyCode}: {exchangeRate.toFixed(4)} ₴
                  </Typography>
                )}
                {calculatedUAH && (
                  <Typography variant="body2" color="primary">
                    Сума в ₴: {calculatedUAH}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <TextField
              label="Контрагент"
              required
              value={formData.counterparty}
              onChange={(e) =>
                setFormData({ ...formData, counterparty: e.target.value })
              }
            />
            
            <TextField
              label="Рахунок контрагента"
              required
              value={formData.counterpartyAccount}
              onChange={(e) =>
                setFormData({ ...formData, counterpartyAccount: e.target.value })
              }
            />
            
            <TextField
              label="Призначення платежу"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={2}
              placeholder="Опис або призначення платежу"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Скасувати</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
        >
          Додати
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentModal;