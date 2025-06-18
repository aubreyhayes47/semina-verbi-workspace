import '@testing-library/jest-dom';

// Mock ResizeObserver for tests that use recharts or other libraries that require it
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}
