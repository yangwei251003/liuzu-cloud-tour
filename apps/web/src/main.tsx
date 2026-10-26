import '@liuzu/ui/styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import { App } from './App';

const Router = import.meta.env.VITE_PAGES === 'true' ? HashRouter : BrowserRouter;

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root application mount point');
}

createRoot(root).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
