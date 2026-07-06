import { createMemoryHistory } from '@tanstack/react-router';
import { dehydrate } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';

import { App } from './App';
import { createQueryClient } from './common/query-client';
import { createRouter } from './router';

export async function render(url: string) {
  const queryClient = createQueryClient();
  const router = createRouter(queryClient);

  router.update({
    history: createMemoryHistory({ initialEntries: [url] }),
    context: { queryClient },
  });

  await router.load();

  const appHtml = renderToString(<App router={router} queryClient={queryClient} />);

  return { appHtml, dehydratedState: dehydrate(queryClient) };
}
