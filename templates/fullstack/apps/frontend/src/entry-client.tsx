import { hydrate } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { App } from './App';
import { createQueryClient } from './common/query-client';
import { createRouter } from './router';
import './styles.css';

declare global {
  interface Window {
    __APP_STATE__?: unknown;
  }
}

async function main() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const queryClient = createQueryClient();

  if (window.__APP_STATE__) {
    hydrate(queryClient, window.__APP_STATE__);
  }

  const router = createRouter(queryClient);
  await router.load();

  const app = (
    <StrictMode>
      <App router={router} queryClient={queryClient} />
    </StrictMode>
  );

  if (window.__APP_STATE__) {
    hydrateRoot(rootElement, app);
    return;
  }

  createRoot(rootElement).render(app);
}

void main();
