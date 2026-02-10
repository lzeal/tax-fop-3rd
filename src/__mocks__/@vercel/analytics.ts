// Mock for @vercel/analytics package
export const Analytics = () => null;
export const track = jest.fn();
export const inject = jest.fn();
export const pageview = jest.fn();
