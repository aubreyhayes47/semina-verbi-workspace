import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Changed from import { App } from './App';
// @ts-expect-error: TypeScript does not recognize CSS imports, but this is required for Tailwind
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);