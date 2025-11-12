// En: src/store/themeStore.ts
import { create } from 'zustand';

// Definimos los posibles temas
type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  init: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * Helper para aplicar el tema al body
 */
const applyTheme = (theme: Theme) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system', // Valor por defecto

  /**
   * Aplica el tema al (re)cargar la app
   */
  init: () => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      applyTheme(storedTheme);
      set({ theme: storedTheme });
    } else {
      applyTheme('system'); // Aplica el 'system' por defecto
    }
  },

  /**
   * Cambia y guarda el tema
   */
  setTheme: (theme) => {
    localStorage.setItem('theme', theme); // Guarda la preferencia
    applyTheme(theme); // Aplica el CSS
    set({ theme: theme });
  },
}));

// Escuchar cambios del OS (si el usuario está en 'system')
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const storedTheme = localStorage.getItem('theme') as Theme | null;
  if (storedTheme === 'system' || !storedTheme) {
    applyTheme('system');
  }
});