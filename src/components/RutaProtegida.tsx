// En: src/components/RutaProtegida.tsx
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import type { RouteProps } from 'react-router'; // Importación de tipo
import { useAuthStore } from '../store/authStore';

// Este componente acepta las mismas propiedades que una <Route> normal
const RutaProtegida: React.FC<RouteProps> = ({ component: Component, ...rest }) => {
  
  // 1. Revisa el "cerebro" para ver si estamos logueados
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!Component) return null;

  return (
    <Route
      {...rest}
      render={(props) =>
        // 2. Lógica de redirección
        isAuthenticated ? (
          <Component {...props} /> // Si está logueado, muestra la página
        ) : (
          <Redirect to="/login" /> // Si no, patea al login
        )
      }
    />
  );
};

export default RutaProtegida;