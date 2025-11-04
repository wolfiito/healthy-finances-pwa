import axios from 'axios';

// 1. Tu URL de backend
const API_URL = 'https://tazcito.pythonanywhere.com';

// 2. Creamos una "instancia" de axios
// Esto es como tener un Postman pre-configurado
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. El Interceptor (¡Esta es la magia!)
// Esto es un "guardia" que intercepta CADA petición
// antes de que salga.
apiClient.interceptors.request.use(
  (config) => {
    // Busca el token en el almacenamiento local del navegador
    const token = localStorage.getItem('token');
    
    // Si el token existe, lo añade al header 'x-access-token'
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Exportamos nuestro cliente pre-configurado
export default apiClient;