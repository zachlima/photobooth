import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BoothProvider } from './state/BoothContext';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BoothProvider>
      <App />
    </BoothProvider>
  </StrictMode>,
);
