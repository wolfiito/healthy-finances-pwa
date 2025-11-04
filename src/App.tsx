// En: src/App.tsx

import { IonApp, IonRouterOutlet } from '@ionic/react';
// Usamos HashRouter para estabilidad PWA (rutas con #)
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
          
          {/* Ruta pública */}
          <Route exact path="/login" component={Login} />
          
          {/* Ruta protegida */}
          <Route
            path="/app"
            render={() => {
              // Si está autenticado, muestra las Pestañas.
              // Si NO, lo patea al Login.
              return isAuthenticated ? <Tabs /> : <Redirect to="/login" />;
            }}
          />
          
          {/* --- ¡AQUÍ ESTÁ EL ARREGLO! --- */}
          {/* Redirección por defecto. La etiqueta <Route> cierra aquí. */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route> 
          {/* --- FIN DEL ARREGLO --- */}
          
        </IonRouterOutlet>
      </Router>
    </IonApp>
  );
}

export default App;