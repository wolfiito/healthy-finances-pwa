
// En: src/pages/Login.tsx

import { 
  IonPage, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  useIonRouter,
  IonToggle,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { personCircle, key, cashOutline, moon } from 'ionicons/icons';

// Importar el servicio de API y el store de autenticación
import apiClient from '../services/api';
import { useAuthStore } from '../store/authStore';

// Importar el CSS específico para el Login
import './Login.css';

const Login: React.FC = () => {
  // Importar las funciones que necesitamos del store y el router
  const setToken = useAuthStore((state) => state.setToken);
  const router = useIonRouter();

  // Crear estados locales para guardar lo que escribe el usuario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Aplicar el tema oscuro si está activado
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  /**
   * Esta función se llama al presionar el botón de Login.
   */
  const handleLogin = async () => {
    setError(null); 
    setLoading(true);

    if (!username || !password) {
      setError('Por favor, ingresa usuario y contraseña.');
      setLoading(false);
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
        
        // Redirigir al usuario a la ruta principal "/app"
        router.push('/app', 'root', 'replace');
      }

    } catch (err: any) {
      // Si la API devuelve un error
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <IonPage className="login-page">
      <IonContent fullscreen>
        <div className="login-container">
          <IonCard className="login-card">
            <IonCardHeader>
              <div className="ion-text-center">
                <IonIcon icon={cashOutline} className="login-icon" />
              </div>
              <IonCardTitle className="ion-text-center">Iniciar Sesión</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonIcon icon={personCircle} slot="start" />
                  <IonInput 
                    label="Usuario" 
                    labelPlacement="floating" 
                    value={username}
                    onIonInput={(e) => setUsername(e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonIcon icon={key} slot="start" />
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
                disabled={loading}
                color="primary"
              >
                {loading ? <IonSpinner name="crescent" /> : 'Entrar'}
              </IonButton>

              <IonItem lines="none" className="ion-margin-top ion-text-center">
                <IonIcon icon={moon} slot="start" />
                <IonToggle color="primary" checked={isDark} onIonChange={toggleDarkMode} />
              </IonItem>

            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
