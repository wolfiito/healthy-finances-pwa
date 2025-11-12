// En: src/App.tsx

import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';

// 1. Importar el "cerebro" de autenticación
import { useAuthStore } from './store/authStore';
import AccountDetail from './pages/AccountDetail';

// 2. Importar nuestras páginas
import Login from './pages/Login';
import Tabs from './pages/Tabs';

function App() {
  // 3. Obtener el estado de autenticación
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Ruta pública */}
          <Route exact path="/login" component={Login} />

          {/* --- ¡LA NUEVA LÓGICA DE SEGURIDAD! --- */}
          <Route
            path="/app"
            render={() => {
              // Si está autenticado, muestra las Pestañas.
              // Si NO, lo patea al Login.
              return isAuthenticated ? <Tabs /> : <Redirect to="/login" />;
            }}
          />
          {/* --- FIN DEL ARREGLO --- */}
          <Route
            path="/accounts/:id"
            render={() => {
              return isAuthenticated ? <AccountDetail /> : <Redirect to="/login" />;
            }}
          />    
          {/* Ruta por defecto */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;