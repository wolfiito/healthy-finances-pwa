// En: src/services/api.ts

import axios from 'axios';

// 1. Tu URL de backend
const API_URL = 'https://tazcito.pythonanywhere.com';

// 2. Creamos una "instancia" de axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. El Interceptor para añadir el token a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. ¡NUEVO! Funciones específicas de la API
// Esta es la función que faltaba.
export const getAccountsSummary = () => {
  // Simplemente hace una llamada GET al endpoint de resumen de cuentas.
  return apiClient.get('/api/accounts/summary');
};

// 5. Exportamos el cliente pre-configurado como default
export default apiClient;
