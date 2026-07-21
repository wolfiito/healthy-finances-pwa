import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  init: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',

  init: () => {
    // 1. Leer del localStorage o usar 'system'
    const stored = localStorage.getItem('theme') as Theme | null;
    const initialTheme = stored || 'system';
    
    // 2. Aplicar inmediatamente
    applyThemeToDocument(initialTheme);
    set({ theme: initialTheme });
  },

  setTheme: (newTheme) => {
    localStorage.setItem('theme', newTheme);
    applyThemeToDocument(newTheme);
    set({ theme: newTheme });
  },
}));

// Función Helper para aplicar el atributo data-theme al HTML
const applyThemeToDocument = (theme: Theme) => {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', isSystemDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
};

// Listener para cambios en el sistema operativo en tiempo real
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const currentSetting = localStorage.getItem('theme');
  if (!currentSetting || currentSetting === 'system') {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
});