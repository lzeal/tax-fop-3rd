import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import {
  Security,
  Code,
  CloudOff,
  Favorite,
  GitHub,
  Shield,
  VolunteerActivism,
  Flag
} from '@mui/icons-material';

const AboutPage: React.FC = () => {
  const donationLinks = [
    {
      name: 'Come Back Alive',
      description: 'Фонд повернись живим',
      url: 'https://www.monobank.ua/jar/48ZWpEKaAH',
      color: '#000'
    },
    {
      name: 'Повернись живим',
      description: 'Офіційний фонд',
      url: 'https://savelife.in.ua/uk/donate-ua/',
      color: '#1976d2'
    },
    {
      name: 'Serhiy Prytula Charity Foundation',
      description: 'Фонд Сергія Притули',
      url: 'https://prytulafoundation.org/uk',
      color: '#ff9800'
    },
    {
      name: 'United24',
      description: 'Платформа підтримки України',
      url: 'https://u24.gov.ua/uk',
      color: '#2196f3'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Flag sx={{ fontSize: 40, mr: 2, color: '#ffd700' }} />
          <Typography variant="h3" component="h1" fontWeight="bold">
            Про проект
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Безкоштовний інструмент для податкової звітності ФОП 3-ї групи
        </Typography>
      </Paper>

      <Stack spacing={4}>
        {/* Ряд з двома картками */}
        <Box display="flex" gap={4} flexWrap="wrap">
          {/* Безпека та приватність */}
          <Box flex="1" minWidth="300px">
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Security sx={{ fontSize: 32, mr: 2, color: '#4caf50' }} />
                  <Typography variant="h5" component="h2">
                    Безпека та приватність
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography fontWeight="bold">
                      Ваші дані залишаються тільки у вас!
                    </Typography>
                  </Alert>
                  
                  <Box mb={2}>
                    <Chip 
                      icon={<CloudOff />} 
                      label="Без бекенду" 
                      color="primary" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                    <Chip 
                      icon={<Shield />} 
                      label="Без бази даних" 
                      color="primary" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                    <Chip 
                      icon={<Security />} 
                      label="Локальне зберігання" 
                      color="primary" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                  </Box>
                </Box>

                <Typography variant="body1" paragraph>
                  • <strong>Не збираємо дані:</strong> Жодна інформація про користувачів не передається на сервери
                </Typography>
                <Typography variant="body1" paragraph>
                  • <strong>Локальна робота:</strong> Всі розрахунки виконуються у вашому браузері
                </Typography>
                <Typography variant="body1" paragraph>
                  • <strong>Повна приватність:</strong> Ваші профілі та дані зберігаються тільки на вашому пристрої
                </Typography>
                <Typography variant="body1">
                  • <strong>Відкритий код:</strong> Можете перевірити безпеку самостійно
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Про проект */}
          <Box flex="1" minWidth="300px">
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Code sx={{ fontSize: 32, mr: 2, color: '#1976d2' }} />
                  <Typography variant="h5" component="h2">
                    Відкритий код
                  </Typography>
                </Box>
                
                <Typography variant="body1" paragraph>
                  Проект створений українськими розробниками для допомоги підприємцям 
                  в підготовці податкової звітності F0103309 для ФОП 3-ї групи.
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Функціонал:</strong>
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>Створення та редагування профілів ФОП</li>
                  <li>Імпорт даних з Excel файлів банків</li>
                  <li>Автоматичні розрахунки податків</li>
                  <li>Генерація декларації F0103309</li>
                  <li>Експорт у XML та PDF форматах</li>
                </Typography>

                <Box mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<GitHub />}
                    href="https://github.com/lzeal/tax-fop-3rd"
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Переглянути код на GitHub
                  </Button>
                  
                  <Typography variant="caption" color="text.secondary">
                    Репозиторій: github.com/lzeal/tax-fop-3rd
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Підтримка ЗСУ */}
        <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <VolunteerActivism sx={{ fontSize: 40, mr: 2, color: '#ffd700' }} />
              <Box>
                <Typography variant="h4" component="h2" fontWeight="bold">
                  Підтримка ЗСУ 🇺🇦
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Якщо проект вам допоміг - підтримайте захисників України
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <Typography>
                <strong>Цей проект абсолютно безкоштовний.</strong> Замість подяки розробникам, 
                ми просимо підтримати ЗСУ у захисті України від російської агресії. 
                Кожна гривня допомагає наблизити нашу перемогу!
              </Typography>
            </Alert>

            <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
              {donationLinks.map((donation, index) => (
                <Box key={index} flex="1" minWidth="200px">
                  <Button
                    variant="contained"
                    startIcon={<Favorite />}
                    href={donation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                      },
                      py: 1.5,
                      flexDirection: 'column',
                      gap: 0.5
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {donation.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {donation.description}
                    </Typography>
                  </Button>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.3)' }} />

            <Typography variant="body2" textAlign="center" sx={{ opacity: 0.8 }}>
              Слава Україні! 🇺🇦 Героям Слава! 💙💛
            </Typography>
          </CardContent>
        </Card>

        {/* Технічна інформація */}
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" mb={2}>
              Технічна інформація
            </Typography>
            
            <Box display="flex" gap={4} flexWrap="wrap" mb={3}>
              <Box flex="1" minWidth="200px">
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Технології:
                </Typography>
                <Typography variant="body2">
                  React, TypeScript, Material-UI
                </Typography>
              </Box>
              
              <Box flex="1" minWidth="200px">
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Сумісність:
                </Typography>
                <Typography variant="body2">
                  Chrome, Firefox, Safari, Edge
                </Typography>
              </Box>
              
              <Box flex="1" minWidth="200px">
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Ліцензія:
                </Typography>
                <Typography variant="body2">
                  MIT License - вільне використання
                </Typography>
              </Box>
            </Box>

            <Alert severity="info">
              <Typography>
                <strong>Важливо:</strong> Цей інструмент призначений для допомоги в підготовці документів. 
                Завжди перевіряйте результати та консультуйтеся з податковими консультантами при необхідності.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default AboutPage;