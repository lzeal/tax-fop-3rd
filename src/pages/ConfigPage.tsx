import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ImportConfig } from '../types';
import { 
  loadImportConfigs, 
  saveConfig, 
  deleteConfig, 
  createDefaultConfig 
} from '../utils/importConfigs';

const ConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<ImportConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<ImportConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const importConfigs = loadImportConfigs();
    setConfigs(importConfigs);
  };

  const handleAddConfig = () => {
    const newConfig: ImportConfig = {
      id: Date.now().toString(),
      name: 'Нова конфігурація',
      headerRow: 2,
      dataStartRow: 3,
      columnMapping: {
        dateColumn: '',
        amountColumn: '',
        currencyColumn: '',
        counterpartyColumn: '',
        accountColumn: '',
      },
      dateFormat: 'dd.MM.yyyy',
      filterIncoming: true,
    };
    setEditingConfig(newConfig);
    setIsModalOpen(true);
  };

  const handleEditConfig = (config: ImportConfig) => {
    setEditingConfig({ ...config });
    setIsModalOpen(true);
  };

  const handleDeleteConfig = (id: string) => {
    try {
      deleteConfig(id);
      loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при видаленні');
    }
  };

  const handleSaveConfig = () => {
    if (!editingConfig) return;

    // Валідація
    if (!editingConfig.name.trim()) {
      setError('Введіть назву конфігурації');
      return;
    }

    if (!editingConfig.columnMapping.dateColumn.trim() ||
        !editingConfig.columnMapping.amountColumn.trim() ||
        !editingConfig.columnMapping.counterpartyColumn.trim()) {
      setError('Заповніть всі обов\'язкові поля маппінгу');
      return;
    }

    try {
      saveConfig(editingConfig);
      loadConfigs();
      setIsModalOpen(false);
      setEditingConfig(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при збереженні');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
    setError('');
  };

  const handleResetToDefault = () => {
    const defaultConfig = createDefaultConfig();
    setEditingConfig(defaultConfig);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Налаштування імпорту
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Конфігурації імпорту Excel файлів
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddConfig}
          >
            Додати конфігурацію
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Назва</TableCell>
                <TableCell>Рядок заголовків</TableCell>
                <TableCell>Початок даних</TableCell>
                <TableCell>Формат дати</TableCell>
                <TableCell>Тільки надходження</TableCell>
                <TableCell align="center">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.name}</TableCell>
                  <TableCell>{config.headerRow}</TableCell>
                  <TableCell>{config.dataStartRow}</TableCell>
                  <TableCell>{config.dateFormat}</TableCell>
                  <TableCell>{config.filterIncoming ? 'Так' : 'Ні'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditConfig(config)}
                    >
                      <EditIcon />
                    </IconButton>
                    {config.id !== 'default-config' && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Модальне вікно редагування */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig?.id === 'default-config' ? 'Редагувати' : 'Налаштувати'} конфігурацію
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <TextField
              label="Назва конфігурації"
              value={editingConfig?.name || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { ...prev, name: e.target.value } : null
              )}
              fullWidth
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Рядок з заголовками"
                type="number"
                value={editingConfig?.headerRow || 1}
                onChange={(e) => setEditingConfig(prev => 
                  prev ? { ...prev, headerRow: parseInt(e.target.value) || 1 } : null
                )}
                inputProps={{ min: 1 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Початок даних (рядок)"
                type="number"
                value={editingConfig?.dataStartRow || 2}
                onChange={(e) => setEditingConfig(prev => 
                  prev ? { ...prev, dataStartRow: parseInt(e.target.value) || 2 } : null
                )}
                inputProps={{ min: 1 }}
                sx={{ flex: 1 }}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Маппінг колонок
            </Typography>

            <TextField
              label="Колонка з датою *"
              value={editingConfig?.columnMapping.dateColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { 
                  ...prev, 
                  columnMapping: { ...prev.columnMapping, dateColumn: e.target.value }
                } : null
              )}
              fullWidth
              required
              placeholder="Наприклад: Дата документа"
            />

            <TextField
              label="Колонка з сумою *"
              value={editingConfig?.columnMapping.amountColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { 
                  ...prev, 
                  columnMapping: { ...prev.columnMapping, amountColumn: e.target.value }
                } : null
              )}
              fullWidth
              required
              placeholder="Наприклад: Сума"
            />

            <TextField
              label="Колонка з валютою"
              value={editingConfig?.columnMapping.currencyColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { 
                  ...prev, 
                  columnMapping: { ...prev.columnMapping, currencyColumn: e.target.value }
                } : null
              )}
              fullWidth
              placeholder="Наприклад: Валюта"
            />

            <TextField
              label="Колонка з контрагентом *"
              value={editingConfig?.columnMapping.counterpartyColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { 
                  ...prev, 
                  columnMapping: { ...prev.columnMapping, counterpartyColumn: e.target.value }
                } : null
              )}
              fullWidth
              required
              placeholder="Наприклад: Найменування кореспондента"
            />

            <TextField
              label="Колонка з рахунком"
              value={editingConfig?.columnMapping.accountColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { 
                  ...prev, 
                  columnMapping: { ...prev.columnMapping, accountColumn: e.target.value }
                } : null
              )}
              fullWidth
              placeholder="Наприклад: Рахунок кореспондента"
            />

            <TextField
              label="Колонка з описом"
              value={editingConfig?.columnMapping.descriptionColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { 
                  ...prev, 
                  columnMapping: { ...prev.columnMapping, descriptionColumn: e.target.value }
                } : null
              )}
              fullWidth
              placeholder="Наприклад: Призн.платежу"
            />

            <TextField
              label="Колонка з ознакою платежу"
              value={editingConfig?.amountSignColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { ...prev, amountSignColumn: e.target.value } : null
              )}
              fullWidth
              placeholder="Наприклад: Тип"
            />

            <FormControl fullWidth>
              <InputLabel>Формат дати</InputLabel>
              <Select
                value={editingConfig?.dateFormat || 'dd.MM.yyyy'}
                label="Формат дати"
                onChange={(e) => setEditingConfig(prev => 
                  prev ? { ...prev, dateFormat: e.target.value } : null
                )}
              >
                <MenuItem value="dd.MM.yyyy">dd.MM.yyyy (31.12.2023)</MenuItem>
                <MenuItem value="dd/MM/yyyy">dd/MM/yyyy (31/12/2023)</MenuItem>
                <MenuItem value="yyyy-MM-dd">yyyy-MM-dd (2023-12-31)</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={editingConfig?.filterIncoming || false}
                  onChange={(e) => setEditingConfig(prev => 
                    prev ? { ...prev, filterIncoming: e.target.checked } : null
                  )}
                />
              }
              label="Імпортувати тільки надходження"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetToDefault}>
            Встановити за замовчуванням
          </Button>
          <Button onClick={handleCloseModal}>
            Скасувати
          </Button>
          <Button onClick={handleSaveConfig} variant="contained">
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigPage;