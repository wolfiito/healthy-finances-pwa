import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// --- ¡NUEVO! Importar Ionic ---
import { setupIonicReact } from '@ionic/react';

import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
// 2. Llama a la función 'init' ANTES de renderizar la app
useAuthStore.getState().init();
useThemeStore.getState().init();
/* --- ¡NUEVO! Importar TODOS los estilos base de Ionic --- */

/* Estilos Core (obligatorio) */
import '@ionic/react/css/core.css';

/* Estilos base (normalización, tipografía) */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Estilos opcionales (helpers) */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import './theme/variables.css';
/* --- Fin de los estilos --- */

// Ejecuta la configuración de Ionic
setupIonicReact();

// Renderiza la app (esto se queda igual)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);