import type { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanstackRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

export function createRouter(queryClient: QueryClient) {
  const router = createTanstackRouter({
    routeTree,
    context: { queryClient },
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
