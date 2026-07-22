import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  init: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',

  init: () => {
    applyThemeToDocument('light');
    set({ theme: 'light' });
  },

  setTheme: (_newTheme) => {
    applyThemeToDocument('light');
    set({ theme: 'light' });
  },
}));

// Función Helper para aplicar el atributo data-theme al HTML
const applyThemeToDocument = (_theme: Theme) => {
  const root = document.documentElement;
  
  root.setAttribute('data-theme', 'light');
};

// Listener para cambios en el sistema operativo en tiempo real
