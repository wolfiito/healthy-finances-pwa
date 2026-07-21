import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Páginas
import Login from './pages/Login';
import Tabs from './pages/Tabs'; // Contiene el Dashboard, Cuentas, etc.
import AccountDetail from './pages/AccountDetail';

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Inicializar el tema guardado al cargar la app
  const initTheme = useThemeStore((state) => state.init);
  React.useEffect(() => {
    initTheme();
  }, []);

  return (
    <Router>
      <Switch>
        {/* Ruta Pública: Login */}
        <Route exact path="/login">
          {isAuthenticated ? <Redirect to="/app" /> : <Login />}
        </Route>

        {/* Rutas Protegidas: Toda la app interna */}
        <Route path="/app">
          {isAuthenticated ? <Tabs /> : <Redirect to="/login" />}
        </Route>

        {/* Ruta Detalle de Cuenta (fuera de los tabs para tener más espacio) */}
        <Route path="/accounts/:id">
          {isAuthenticated ? <AccountDetail /> : <Redirect to="/login" />}
        </Route>

        {/* Redirección por defecto: Ir a Login o a la App si ya hay sesión */}
        <Route path="/">
          <Redirect to={isAuthenticated ? "/app" : "/login"} />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;