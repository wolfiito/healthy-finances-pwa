import { create } from 'zustand';

type Theme = 'light';

interface ThemeState {
  theme: Theme;
  init: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',

  init: () => {
    applyThemeToDocument('light');
    set({ theme: 'light' });
  },

  setTheme: (newTheme) => {
    applyThemeToDocument('light');
    set({ theme: 'light' });
  },
}));

// Función Helper para aplicar el atributo data-theme al HTML
const applyThemeToDocument = (theme: Theme) => {
  const root = document.documentElement;
  
  root.setAttribute('data-theme', 'light');
};

// Listener para cambios en el sistema operativo en tiempo real
