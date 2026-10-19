import { RouterProvider } from 'react-router';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/shared/theme';
import { router } from './router';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
