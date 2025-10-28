import React from 'react';

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="browser-router">{children}</div>
);

export const Routes = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="routes">{children}</div>
);

export const Route = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="route">{children}</div>
);

export const Navigate = () => <div data-testid="navigate">Navigate</div>;

const reactRouterDom = {
  BrowserRouter,
  Routes,
  Route,
  Navigate
};

export default reactRouterDom;