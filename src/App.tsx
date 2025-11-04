// En: src/App.tsx

import { IonApp, IonRouterOutlet } from '@ionic/react';
// 1. CAMBIAMOS BrowserRouter por HashRouter para estabilidad PWA
import { HashRouter as Router, Route, Redirect } from 'react-router-dom'; 
import { useAuthStore } from './store/authStore';

// Importar nuestras páginas
import Login from './pages/Login';
import Tabs from './pages/Tabs';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <IonApp>
      {/* 2. Usamos el Router con Hash */}
      <Router> 
        <IonRouterOutlet>
          
          {/* Rutas */}
          <Route exact path="/login" component={Login} />

          {/* Ruta protegida (Modo PWA/Standalone) */}
          <Route
            path="/app"
            render={() => {
              // Si está autenticado, muestra las Pestañas.
              // Si NO, lo patea al Login.
              return isAuthenticated ? <Tabs /> : <Redirect to="/login" />;
            }}
          />
          
          {/* Redirección por defecto */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Redirect>
          
        </IonRouterOutlet>
      </Router>
    </IonApp>
  );
}

export default App;   