import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';
import IncomesPage from './pages/IncomesPage';
import ConfigPage from './pages/ConfigPage';
import { FOPProfilePage } from './pages/FOPProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import AboutPage from './pages/AboutPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Analytics />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/incomes" replace />} />
            <Route path="/incomes" element={<IncomesPage />} />
            <Route path="/profile" element={<FOPProfilePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
