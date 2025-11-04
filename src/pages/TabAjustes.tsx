import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton
} from '@ionic/react';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const TabAjustes: React.FC = () => {
  const clearToken = useAuthStore((state) => state.clearToken);
  const history = useHistory();

  const handleLogout = () => {
    clearToken();
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ajustes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton 
          expand="block" 
          color="danger" 
          onClick={handleLogout}
        >
          Cerrar Sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default TabAjustes;