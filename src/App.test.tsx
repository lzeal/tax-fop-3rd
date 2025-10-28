import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock components that might not exist yet
jest.mock('./components/Layout', () => {
  return function Layout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock('./pages/IncomesPage', () => {
  return function IncomesPage() {
    return <div data-testid="incomes-page">Incomes Page</div>;
  };
});

jest.mock('./pages/ConfigPage', () => {
  return function ConfigPage() {
    return <div data-testid="config-page">Config Page</div>;
  };
});

jest.mock('./pages/FOPProfilePage', () => ({
  FOPProfilePage: function FOPProfilePage() {
    return <div data-testid="fop-profile-page">FOP Profile Page</div>;
  }
}));

jest.mock('./pages/ReportsPage', () => ({
  ReportsPage: function ReportsPage() {
    return <div data-testid="reports-page">Reports Page</div>;
  }
}));

jest.mock('./pages/AboutPage', () => {
  return function AboutPage() {
    return <div data-testid="about-page">About Page</div>;
  };
});

test('renders app without crashing', () => {
  render(<App />);
  // Простий тест, що додаток рендериться без помилок
  expect(document.body).toBeInTheDocument();
});
