import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ImportConfig, ParsedPayment, Payment } from '../types';
import { loadImportConfigs } from '../utils/importConfigs';
import { readExcelFile, parseWorksheetWithConfig } from '../utils/excelImport';
import { getExchangeRatesForDate, convertToUAH } from '../utils/exchangeRates';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportPayments: (payments: Payment[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  open,
  onClose,
  onImportPayments,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<ImportConfig | null>(null);
  const [configs, setConfigs] = useState<ImportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<ParsedPayment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (open) {
      const importConfigs = loadImportConfigs();
      setConfigs(importConfigs);
      if (importConfigs.length > 0) {
        setSelectedConfig(importConfigs[0]);
      }
    }
  }, [open]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowPreview(false);
      setPreviewData([]);
      setError('');
    }
  };

  const handlePreview = async () => {
    if (!selectedFile || !selectedConfig) {
      setError('Оберіть файл та конфігурацію');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const workbook = await readExcelFile(selectedFile);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      const parsedPayments = parseWorksheetWithConfig(worksheet, selectedConfig);
      
      setPreviewData(parsedPayments.slice(0, 10)); // Показуємо перші 10 записів
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при обробці файлу');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedConfig) {
      setError('Оберіть файл та конфігурацію');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const workbook = await readExcelFile(selectedFile);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      const parsedPayments = parseWorksheetWithConfig(worksheet, selectedConfig);
      
      // Конвертуємо в Payment об'єкти з курсами валют
      const payments: Payment[] = [];
      console.log('Parsed Payments:', parsedPayments);
      for (const parsed of parsedPayments) {
        let amountUAH = parsed.amount;
        let exchangeRate: number | undefined;
        
        if (parsed.currencyCode !== 'UAH') {
          const rates = await getExchangeRatesForDate(parsed.date);
          const rate = rates[parsed.currencyCode];
          if (rate) {
            exchangeRate = rate.rate;
            amountUAH = convertToUAH(parsed.amount, parsed.currencyCode, exchangeRate);
          }
        }
        
        payments.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          date: parsed.date,
          currencyCode: parsed.currencyCode as 'UAH' | 'EUR' | 'USD',
          amount: parsed.amount,
          amountUAH,
          counterparty: parsed.counterparty,
          counterpartyAccount: parsed.counterpartyAccount,
          exchangeRate
        });
      }
      
      onImportPayments(payments);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при імпорті файлу');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSelectedConfig(null);
    setPreviewData([]);
    setShowPreview(false);
    setError('');
    setLoading(false);
    onClose();
  };

  const handleConfigureImport = () => {
    navigate('/config');
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Імпорт з Excel файлу
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={handleConfigureImport}
          >
            Налаштування
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {error && (
            <Alert severity="error">{error}</Alert>
          )}
          
          {/* Вибір конфігурації */}
          <FormControl fullWidth>
            <InputLabel>Конфігурація імпорту</InputLabel>
            <Select
              value={selectedConfig?.id || ''}
              label="Конфігурація імпорту"
              onChange={(e) => {
                const config = configs.find(c => c.id === e.target.value);
                setSelectedConfig(config || null);
              }}
            >
              {configs.map((config) => (
                <MenuItem key={config.id} value={config.id}>
                  {config.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Вибір файлу */}
          <Box>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              {selectedFile ? selectedFile.name : 'Оберіть Excel файл'}
            </Button>
          </Box>
          
          {/* Кнопка попереднього перегляду */}
          {selectedFile && selectedConfig && (
            <Button
              variant="outlined"
              onClick={handlePreview}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Попередній перегляд'}
            </Button>
          )}
          
          {/* Попередній перегляд */}
          {showPreview && previewData.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Попередній перегляд ({previewData.length} з перших 10 записів):
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Сума</TableCell>
                      <TableCell>Валюта</TableCell>
                      <TableCell>Контрагент</TableCell>
                      <TableCell>Тип</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.date.toLocaleDateString('uk-UA')}</TableCell>
                        <TableCell>{payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.currencyCode}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {payment.counterparty}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.isIncoming ? 'Надходження' : 'Витрата'}
                            color={payment.isIncoming ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Скасувати</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!selectedFile || !selectedConfig || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Імпортувати'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;