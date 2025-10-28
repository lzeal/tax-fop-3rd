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
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  DeleteForever as DeleteForeverIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { ImportConfig } from '../types';
import { 
  loadImportConfigs, 
  saveConfig, 
  deleteConfig, 
  createDefaultConfig 
} from '../utils/importConfigs';
import {
  downloadDataExport,
  importDataFromJson,
  applyImportedData,
  clearAllData,
  getStorageInfo,
  formatFileSize
} from '../utils/dataExport';

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
        ownAccountColumn: '',
        descriptionColumn: '',
      },
      dateFormat: 'dd.MM.yyyy',
      filterIncoming: true,
      ownBankName: '',
      mainAccountPrefix: '2600',
      distributionAccountPrefix: '2603',
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

    if (!editingConfig.mainAccountPrefix.trim()) {
      setError('Введіть префікс основного рахунку');
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
        Налаштування імпорту виписок з банку
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
              label="Колонка з датою"
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
              label="Колонка з сумою"
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
              label="Колонка з контрагентом"
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
              label="Колонка з власним рахунком"
              value={editingConfig?.columnMapping.ownAccountColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { 
                  ...prev, 
                  columnMapping: { ...prev.columnMapping, ownAccountColumn: e.target.value }
                } : null
              )}
              fullWidth
              placeholder="Наприклад: Рах."
              helperText="Потрібно для фільтрації розподільчого рахунку"
            />

            <TextField
              label="Колонка з описом/призначенням"
              value={editingConfig?.columnMapping.descriptionColumn || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { 
                  ...prev, 
                  columnMapping: { ...prev.columnMapping, descriptionColumn: e.target.value }
                } : null
              )}
              fullWidth
              placeholder="Наприклад: Призн.платежу"
              helperText="Колонка з описом або призначенням платежу"
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

            <Typography variant="h6" sx={{ mt: 2 }}>
              Фільтрація платежів
            </Typography>

            <TextField
              label="Назва свого банку (для фільтрації продажу валюти)"
              value={editingConfig?.ownBankName || ''}
              onChange={(e) => setEditingConfig(prev => 
                prev ? { ...prev, ownBankName: e.target.value } : null
              )}
              fullWidth
              placeholder="Наприклад: ПриватБанк"
              helperText="Платежі від цього банку будуть відсіяні як продаж валюти"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Префікс основного рахунку"
                value={editingConfig?.mainAccountPrefix || ''}
                onChange={(e) => setEditingConfig(prev => 
                  prev ? { ...prev, mainAccountPrefix: e.target.value } : null
                )}
                sx={{ flex: 1 }}
                placeholder="2600"
                helperText="Рахунки ФОП"
              />
              <TextField
                label="Префікс розподільчого рахунку"
                value={editingConfig?.distributionAccountPrefix || ''}
                onChange={(e) => setEditingConfig(prev => 
                  prev ? { ...prev, distributionAccountPrefix: e.target.value } : null
                )}
                sx={{ flex: 1 }}
                placeholder="2603"
                helperText="Валютні рахунки (будуть відсіяні)"
              />
            </Box>

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

      {/* Розділ експорту/імпорту даних */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Резервне копіювання та відновлення даних
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Експортуйте всі дані для резервного копіювання або перенесення на інший пристрій
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ minWidth: 250, flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CloudDownloadIcon color="primary" />
                <Typography variant="h6">Експорт даних</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Завантажити всі дані у вигляді JSON файлу
              </Typography>
              <Typography variant="caption" display="block">
                Включає: платежі, профіль ФОП, конфігурації імпорту
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<CloudDownloadIcon />}
                onClick={() => downloadDataExport()}
                fullWidth
              >
                Експортувати дані
              </Button>
            </CardActions>
          </Card>

          <Card sx={{ minWidth: 250, flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CloudUploadIcon color="secondary" />
                <Typography variant="h6">Імпорт даних</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Відновити дані з раніше збереженого файлу
              </Typography>
              <Typography variant="caption" display="block">
                Підтримується формат JSON
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                component="label"
                fullWidth
              >
                Вибрати файл
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        const importResult = importDataFromJson(result);
                        
                        if (importResult.success) {
                          if (window.confirm('Імпортувати дані? Це замінить поточні дані.')) {
                            applyImportedData(importResult.imported, {
                              replacePayments: true,
                              replaceProfile: true,
                              replaceConfigs: true,
                              replaceAccumulatedData: true
                            });
                            window.location.reload();
                          }
                        } else {
                          alert('Помилка імпорту: ' + importResult.errors.join(', '));
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </Button>
            </CardActions>
          </Card>

          <Card sx={{ minWidth: 250, flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <StorageIcon color="info" />
                <Typography variant="h6">Інформація про дані</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {(() => {
                  const storageInfo = getStorageInfo();
                  return `Збережено: ${formatFileSize(storageInfo.totalSize)}`;
                })()}
              </Typography>
              <Typography variant="caption" display="block">
                {(() => {
                  const storageInfo = getStorageInfo();
                  return `Елементів: ${storageInfo.itemCount}`;
                })()}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={() => {
                  if (window.confirm('УВАГА! Це видалить ВСІ дані без можливості відновлення. Продовжити?')) {
                    clearAllData();
                    window.location.reload();
                  }
                }}
                fullWidth
              >
                Очистити всі дані
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Alert severity="info">
          <strong>Рекомендація:</strong> Регулярно створюйте резервні копії ваших даних, 
          особливо перед важливими звітними періодами. Зберігайте файли експорту в надійному місці.
        </Alert>
      </Paper>
    </Box>
  );
};

export default ConfigPage;