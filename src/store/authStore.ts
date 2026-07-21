import { create } from 'zustand';

// 1. Definimos la "forma" de nuestro almacén
interface AuthState {
  token: string | null;            // El token JWT
  isAuthenticated: boolean;      // ¿Estamos logueados?
  setToken: (token: string) => void; // Función para guardar el token
  clearToken: () => void;            // Función para borrar el token (logout)
  init: () => void;                // Función para iniciar el store
}

// 2. Creamos el hook del store
export const useAuthStore = create<AuthState>((set) => ({
  // --- Estado Inicial ---
  token: null,
  isAuthenticated: false,

  // --- Acciones (Mutations) ---
  
  /**
   * Guarda el token en el estado y en localStorage.
   */
  setToken: (token) => {
    localStorage.setItem('token', token); // Guarda en el navegador
    set({ token: token, isAuthenticated: true });
  },

  /**
   * Limpia el token del estado y de localStorage (Logout).
   */
  clearToken: () => {
    localStorage.removeItem('token'); // Borra del navegador
    set({ token: null, isAuthenticated: false });
  },

  /**
   * (¡Importante!) Carga el token desde localStorage al iniciar la app.
   * Esto mantiene al usuario logueado si refresca la página.
   */
  init: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token: token, isAuthenticated: true });
    }
  },
}));