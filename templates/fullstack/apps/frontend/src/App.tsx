import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import type { createRouter } from './router';

type AppRouter = ReturnType<typeof createRouter>;

type AppProps = {
  router: AppRouter;
  queryClient: QueryClient;
};

export function App({ router, queryClient }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
