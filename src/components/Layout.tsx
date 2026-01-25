import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ФОП 3-я група - Податковий калькулятор
          </Typography>
          <Button
            color="inherit"
            onClick={() => handleNavigation('/incomes')}
            sx={{
              backgroundColor: location.pathname === '/incomes' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Надходження
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation('/profile')}
            sx={{
              backgroundColor: location.pathname === '/profile' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Профіль ФОП
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation('/reports')}
            sx={{
              backgroundColor: location.pathname === '/reports' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Звіти F0103309
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation('/config')}
            sx={{
              backgroundColor: location.pathname === '/config' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Налаштування
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigation('/about')}
            sx={{
              backgroundColor: location.pathname === '/about' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Про проєкт
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;