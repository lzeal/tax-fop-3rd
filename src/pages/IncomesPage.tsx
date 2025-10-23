import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import QuarterSelector from '../components/QuarterSelector';
import PaymentsTable from '../components/PaymentsTable';
import AddPaymentModal from '../components/AddPaymentModal';
import { Payment, Quarter } from '../types';
import { loadPayments, savePayments } from '../utils/localStorage';
import { getCurrentQuarter } from '../utils/dateUtils';

const IncomesPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(getCurrentQuarter());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const loadedPayments = loadPayments();
    setPayments(loadedPayments);
  }, []);

  const handleAddPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    savePayments(updatedPayments);
  };

  const handleDeletePayment = (paymentId: string) => {
    const updatedPayments = payments.filter(p => p.id !== paymentId);
    setPayments(updatedPayments);
    savePayments(updatedPayments);
  };

  const handleImportFile = () => {
    // TODO: Implement file import logic
    console.log('Import file functionality to be implemented');
  };

  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    const quarterStart = new Date(selectedQuarter.year, (selectedQuarter.quarter - 1) * 3, 1);
    const quarterEnd = new Date(selectedQuarter.year, selectedQuarter.quarter * 3, 0);
    return paymentDate >= quarterStart && paymentDate <= quarterEnd;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Надходження ФОП
      </Typography>
      
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
    </Box>
  );
};

export default IncomesPage;