import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // <--- ¡ESTA LÍNEA ES OBLIGATORIA!

// Si tienes imports viejos de Ionic aquí, bórralos.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);