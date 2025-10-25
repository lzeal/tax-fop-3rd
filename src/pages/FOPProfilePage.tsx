import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk } from 'date-fns/locale';

import { FOPProfile } from '../types';
import { 
  createEmptyFOPProfile, 
  saveFOPProfile, 
  loadFOPProfile, 
  validateFOPProfile 
} from '../utils/fopProfile';

const ukrainianRegions = [
  'Вінницька область',
  'Волинська область',
  'Дніпропетровська область',
  'Донецька область',
  'Житомирська область',
  'Закарпатська область',
  'Запорізька область',
  'Івано-Франківська область',
  'Київська область',
  'Кіровоградська область',
  'Луганська область',
  'Львівська область',
  'Миколаївська область',
  'Одеська область',
  'Полтавська область',
  'Рівненська область',
  'Сумська область',
  'Тернопільська область',
  'Харківська область',
  'Херсонська область',
  'Хмельницька область',
  'Черкаська область',
  'Чернівецька область',
  'Чернігівська область',
  'м. Київ',
  'м. Севастополь'
];

export const FOPProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<FOPProfile>(createEmptyFOPProfile());
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [newKved, setNewKved] = useState({ code: '', name: '' });

  useEffect(() => {
    const savedProfile = loadFOPProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  const handleSave = () => {
    const validationErrors = validateFOPProfile(profile);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      try {
        saveFOPProfile(profile);
        setSuccess('Профіль ФОП успішно збережено');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setErrors(['Помилка збереження профілю']);
      }
    }
  };

  const handleAddKved = () => {
    if (newKved.code.trim() && newKved.name.trim() && 
        !profile.kved.additional.some(k => k.code === newKved.code.trim())) {
      setProfile(prev => ({
        ...prev,
        kved: {
          ...prev.kved,
          additional: [...prev.kved.additional, { 
            code: newKved.code.trim(), 
            name: newKved.name.trim() 
          }]
        }
      }));
      setNewKved({ code: '', name: '' });
    }
  };

  const handleRemoveKved = (index: number) => {
    setProfile(prev => ({
      ...prev,
      kved: {
        ...prev.kved,
        additional: prev.kved.additional.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Профіль ФОП
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Інформація для генерації звіту F0103309 (3-тя група, неплатник ПДВ)
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
            {/* Особисті дані */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Особисті дані
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="ПІБ повністю"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                    sx={{ minWidth: 300, flexGrow: 1 }}
                  />
                  <TextField
                    label="ІПН (РНОКПП)"
                    value={profile.tin}
                    onChange={(e) => setProfile(prev => ({ ...prev, tin: e.target.value }))}
                    inputProps={{ maxLength: 10 }}
                    helperText="10 цифр"
                    required
                    sx={{ minWidth: 200 }}
                  />
                </Box>

                <DatePicker
                  label="Дата реєстрації як ФОП"
                  value={profile.registrationDate}
                  onChange={(date) => setProfile(prev => ({ 
                    ...prev, 
                    registrationDate: date || new Date() 
                  }))}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{
                    textField: TextField
                  }}
                  slotProps={{
                    textField: {
                      required: true,
                      sx: { maxWidth: 300 }
                    }
                  }}
                />
              </Stack>
            </Box>

            {/* Адреса */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Адреса
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl required sx={{ minWidth: 200, flexGrow: 1 }}>
                    <InputLabel>Область</InputLabel>
                    <Select
                      value={profile.address.region}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        address: { ...prev.address, region: e.target.value }
                      }))}
                      label="Область"
                    >
                      {ukrainianRegions.map((region) => (
                        <MenuItem key={region} value={region}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Район"
                    value={profile.address.district}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, district: e.target.value }
                    }))}
                    sx={{ minWidth: 200 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Місто/селище"
                    value={profile.address.city}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    required
                    sx={{ minWidth: 200, flexGrow: 1 }}
                  />
                  <TextField
                    label="Вулиця"
                    value={profile.address.street}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    required
                    sx={{ minWidth: 200, flexGrow: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Будинок"
                    value={profile.address.building}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, building: e.target.value }
                    }))}
                    required
                    sx={{ minWidth: 100 }}
                  />
                  <TextField
                    label="Квартира"
                    value={profile.address.apartment}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, apartment: e.target.value }
                    }))}
                    sx={{ minWidth: 100 }}
                  />
                  <TextField
                    label="Поштовий індекс"
                    value={profile.address.postalCode}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, postalCode: e.target.value }
                    }))}
                    inputProps={{ maxLength: 5 }}
                    helperText="5 цифр"
                    required
                    sx={{ minWidth: 150 }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Контакти */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Контактна інформація
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Телефон"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+380..."
                  required
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  required
                  sx={{ minWidth: 250, flexGrow: 1 }}
                />
              </Box>
            </Box>

            {/* Податкова інспекція */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Податкова інспекція
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Код податкової"
                  value={profile.taxOffice.code}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    taxOffice: { ...prev.taxOffice, code: e.target.value }
                  }))}
                  placeholder="1234"
                  required
                  sx={{ minWidth: 150 }}
                  inputProps={{ maxLength: 4 }}
                />
                <TextField
                  label="Назва податкової інспекції"
                  value={profile.taxOffice.name}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    taxOffice: { ...prev.taxOffice, name: e.target.value }
                  }))}
                  placeholder="Друга державна податкова інспекція..."
                  required
                  sx={{ minWidth: 300, flexGrow: 1 }}
                />
              </Box>
            </Box>

            {/* КВЕДи */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Види економічної діяльності (КВЕД)
              </Typography>
              
              <Stack spacing={2}>
                <Typography variant="body1" gutterBottom>
                  Основний КВЕД:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Код КВЕДу"
                    value={profile.kved.primary.code}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      kved: { 
                        ...prev.kved, 
                        primary: { ...prev.kved.primary, code: e.target.value }
                      }
                    }))}
                    placeholder="XX.XX"
                    helperText="Наприклад: 62.01"
                    required
                    sx={{ maxWidth: 150 }}
                  />
                  <TextField
                    label="Назва діяльності"
                    value={profile.kved.primary.name}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      kved: { 
                        ...prev.kved, 
                        primary: { ...prev.kved.primary, name: e.target.value }
                      }
                    }))}
                    placeholder="Розроблення комп'ютерного програмного забезпечення"
                    helperText="Точна назва згідно з класифікатором КВЕДів"
                    required
                    sx={{ flex: 1, maxWidth: 400 }}
                  />
                </Box>

                <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                  Додаткові КВЕДи:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  <TextField
                    label="Код КВЕДу"
                    value={newKved.code}
                    onChange={(e) => setNewKved(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="XX.XX"
                    sx={{ maxWidth: 150 }}
                  />
                  <TextField
                    label="Назва діяльності"
                    value={newKved.name}
                    onChange={(e) => setNewKved(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Назва виду діяльності"
                    sx={{ flex: 1, maxWidth: 400 }}
                  />
                  <IconButton 
                    onClick={handleAddKved}
                    disabled={!newKved.code.trim() || !newKved.name.trim()}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                {profile.kved.additional.length > 0 && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Список додаткових КВЕДів:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {profile.kved.additional.map((kved, index) => (
                        <Chip
                          key={index}
                          label={`${kved.code} - ${kved.name}`}
                          onDelete={() => handleRemoveKved(index)}
                          deleteIcon={<DeleteIcon />}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Популярні КВЕДи для підказки */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    💡 Популярні КВЕДи для ІТ-діяльності:
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ ml: 1 }}>
                    • 62.01 - Розроблення комп'ютерного програмного забезпечення<br/>
                    • 62.02 - Консультування з питань комп'ютерного програмного забезпечення<br/>
                    • 62.03 - Діяльність з управління комп'ютерним устаткуванням<br/>
                    • 62.09 - Інша діяльність у сфері інформаційних технологій<br/>
                    • 63.11 - Оброблення даних, розміщення інформації на веб-вузлах<br/>
                    • 73.11 - Діяльність рекламних агентств
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Податкові параметри (readonly) */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Податкові параметри (фіксовані для 3-ї групи)
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Група спрощеної системи"
                  value="3"
                  InputProps={{ readOnly: true }}
                  sx={{ maxWidth: 200 }}
                />
                <TextField
                  label="Ставка єдиного податку"
                  value="5%"
                  InputProps={{ readOnly: true }}
                  sx={{ maxWidth: 200 }}
                />
                <TextField
                  label="Військовий збір"
                  value="1%"
                  InputProps={{ readOnly: true }}
                  sx={{ maxWidth: 150 }}
                />
                <TextField
                  label="Річний ліміт доходу"
                  value="12 млн грн"
                  InputProps={{ readOnly: true }}
                  sx={{ maxWidth: 200 }}
                />
              </Box>
            </Box>

            {/* Кнопка збереження */}
            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                size="large"
              >
                Зберегти профіль
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};