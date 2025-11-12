
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { setupIonicReact } from '@ionic/react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// --- ¡NUEVO! Configuración global de moneda para Analytics ---
// Esto asegura que todos los eventos de Analytics (incluyendo los automáticos)
// incluyan la moneda 'MXN', evitando los errores que observaste.
if (typeof (window as any).gtag === 'function') {
  (window as any).gtag('set', { 'currency': 'MXN' });
}
// --- FIN DEL CAMBIO ---

useAuthStore.getState().init();
useThemeStore.getState().init();

/* Estilos Core de Ionic (obligatorio) */
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

setupIonicReact();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
