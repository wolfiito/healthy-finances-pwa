// En: src/App.tsx

import { IonApp, IonRouterOutlet } from '@ionic/react';
// 1. CAMBIAMOS IonReactRouter por BrowserRouter (o HashRouter para PWA)
// Como estamos usando Ionic, envolvemos el BrowserRouter normal.
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Importar nuestras páginas
import Login from './pages/Login';
import Tabs from './pages/Tabs';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 2. Definimos la aplicación principal con el Router
  return (
    <IonApp>
      {/* 3. Usamos Router (Ionic ya maneja las animaciones) */}
      <Router> 
        <IonRouterOutlet>
          
          {/* Ruta pública */}
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
          
          {/* 4. Redirección por defecto */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          
        </IonRouterOutlet>
      </Router>
    </IonApp>
  );
}

export default App;