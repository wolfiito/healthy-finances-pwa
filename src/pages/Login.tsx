// En: src/pages/Login.tsx

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText
} from '@ionic/react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

// Importar el servicio de API y el store de autenticación
import apiClient from '../services/api';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  // Importar las funciones que necesitamos del store y el router
  const setToken = useAuthStore((state) => state.setToken);
  const history = useHistory();

  // Crear estados locales para guardar lo que escribe el usuario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Esta función se llama al presionar el botón de Login.
   */
  const handleLogin = async () => {
    setError(null); 

    if (!username || !password) {
      setError('Por favor, ingresa usuario y contraseña.');
      return;
    }

    try {
      // Llamar a nuestra API
      const response = await apiClient.post('/api/auth/login', {
        username: username,
        password: password
      });

      // Si el login es exitoso
      if (response.data.token) {
        // Guardar el token en nuestro "cerebro" (Zustand)
        setToken(response.data.token);
        
        // --- ¡EL ARREGLO! ---
        // Redirigir al usuario a la ruta principal "/app"
        history.push('/app');
      }

    } catch (err: any) {
      // Si la API devuelve un error
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al conectar con el servidor.');
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonInput 
              label="Usuario" 
              labelPlacement="floating" 
              value={username}
              onIonInput={(e) => setUsername(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonInput 
              label="Contraseña" 
              labelPlacement="floating" 
              type="password" 
              value={password}
              onIonInput={(e) => setPassword(e.detail.value!)}
            />
          </IonItem>
        </IonList>

        {error && (
          <IonText color="danger" className="ion-padding-start">
            <p>{error}</p>
          </IonText>
        )}

        <IonButton 
          expand="block" 
          onClick={handleLogin} 
          className="ion-margin-top"
        >
          Entrar
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;