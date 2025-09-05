import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { configureTensorFlow } from './hooks/useAIModels';

// Initialize TensorFlow.js
configureTensorFlow();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
