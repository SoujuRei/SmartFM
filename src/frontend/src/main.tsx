import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize Mock API if enabled
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mocks/server').then(({ startMockServer }) => {
    startMockServer();
    mountApp();
  });
} else {
  mountApp();
}

function mountApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

