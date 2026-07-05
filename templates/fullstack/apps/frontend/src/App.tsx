import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import { queryClient } from './common/query-client';
import { LandingPage } from './slices/landing/pages/landing-page/landing-page';
import { UsersPage } from './slices/users/pages/users-page/users-page';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
