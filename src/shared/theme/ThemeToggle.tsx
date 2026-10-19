import { Moon, Sun } from 'lucide-react';
import { IconButton } from '@/shared/ui/IconButton';
import { useTheme } from './useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  return (
    <IconButton
      onClick={(e) => toggleTheme(e.currentTarget)}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {dark ? (
        <Sun
          size={16}
          className='transition-transform duration-700 ease-soft group-hover:rotate-45'
        />
      ) : (
        <Moon
          size={16}
          className='transition-transform duration-700 ease-soft group-hover:-rotate-12'
        />
      )}
    </IconButton>
  );
}
