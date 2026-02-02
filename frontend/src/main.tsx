import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

axios.defaults.baseURL = apiBaseUrl;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
