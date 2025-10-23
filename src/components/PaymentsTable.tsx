import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Payment } from '../types';
import { formatDate } from '../utils/dateUtils';

interface PaymentsTableProps {
  payments: Payment[];
  onDeletePayment: (paymentId: string) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  onDeletePayment,
}) => {
  const formatCurrency = (amount: number, currency: string = 'UAH'): string => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCurrencyColor = (currency: string) => {
    switch (currency) {
      case 'USD':
        return 'success';
      case 'EUR':
        return 'primary';
      case 'UAH':
        return 'default';
      default:
        return 'default';
    }
  };

  if (payments.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Немає платежів за обраний період
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="payments table">
        <TableHead>
          <TableRow>
            <TableCell>Дата</TableCell>
            <TableCell>Валюта</TableCell>
            <TableCell align="right">Сума</TableCell>
            <TableCell align="right">Сума в ₴</TableCell>
            <TableCell>Контрагент</TableCell>
            <TableCell>Рахунок контрагента</TableCell>
            <TableCell align="center">Дії</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow
              key={payment.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {formatDate(payment.date)}
              </TableCell>
              <TableCell>
                <Chip
                  label={payment.currencyCode}
                  color={getCurrencyColor(payment.currencyCode) as any}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                {formatCurrency(payment.amount, payment.currencyCode)}
              </TableCell>
              <TableCell align="right">
                <Box>
                  {formatCurrency(payment.amountUAH, 'UAH')}
                  {payment.exchangeRate && payment.currencyCode !== 'UAH' && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Курс: {payment.exchangeRate.toFixed(4)}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ maxWidth: 200, wordBreak: 'break-word' }}>
                  {payment.counterparty}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {payment.counterpartyAccount}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={() => onDeletePayment(payment.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentsTable;