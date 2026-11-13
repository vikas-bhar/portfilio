import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
export function useTheme(defaultTheme: Theme = 'dark') {
  const [preference, setPreference] = useState<Theme | null>(() => {
    try {
      const saved = localStorage.getItem('portfolio-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      /* A storage preference is optional. */
    }
    return null;
  });
  const theme = preference ?? defaultTheme;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0a0b0c' : '#f7f7f2');
    if (preference)
      try {
        localStorage.setItem('portfolio-theme', preference);
      } catch {
        /* The toggle also works without local storage. */
      }
  }, [theme, preference]);
  return { theme, toggleTheme: () => setPreference(theme === 'dark' ? 'light' : 'dark') };
}
