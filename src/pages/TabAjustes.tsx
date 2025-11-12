// En: src/pages/TabAjustes.tsx

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonInput,
  IonText,
  IonAlert,
  IonSegment,        // <-- ¡NUEVO!
  IonSegmentButton,  // <-- ¡NUEVO!
  IonLabel           // <-- ¡NUEVO!
} from '@ionic/react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { useThemeStore } from '../store/themeStore'; // <-- 1. IMPORTAR EL STORE DE TEMA

const TabAjustes: React.FC = () => {
  const clearToken = useAuthStore((state) => state.clearToken);
  const triggerRefresh = useDataStore((state) => state.triggerRefresh);
  const history = useHistory();

  // 2. Traer el estado y la función del store de tema
  const { theme, setTheme } = useThemeStore();

  const [balance, setBalance] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);

  const handleLogout = () => {
    clearToken();
    history.push('/login');
  };

  const handleSetInitialBalance = async () => {
    // ... (la función se queda igual) ...
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      console.error("Monto inválido");
      return; 
    }
    try {
      await apiClient.post('/api/transactions/set_initial', { amount });
      triggerRefresh();
      setShowAlert(true);
      setBalance("");
    } catch (err) {
      console.error("Error al establecer el saldo", err);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary"> {/* <-- ¡AÑADE ESTO! */}
          <IonTitle>Ajustes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        {/* --- ¡NUEVO BLOQUE: TEMA! --- */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Apariencia</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonSegment
              value={theme}
              onIonChange={(e) => setTheme(e.detail.value as any)}
            >
              <IonSegmentButton value="light">
                <IonLabel>Claro</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="dark">
                <IonLabel>Oscuro</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="system">
                <IonLabel>Sistema</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonCardContent>
        </IonCard>
        {/* --- FIN DEL NUEVO BLOQUE --- */}
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Configurar Saldo Inicial</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonInput 
                  label="Monto Inicial" 
                  labelPlacement="floating" 
                  type="number" 
                  value={balance}
                  placeholder="$10000.00"
                  onIonInput={(e) => setBalance(e.detail.value!)}
                />
              </IonItem>
            </IonList>
            <IonText color="medium">
              <p style={{fontSize: '0.8em', margin: '10px'}}>
                <strong>Aviso:</strong> Esto borrará todas tus transacciones anteriores y creará un nuevo saldo de inicio en tu "Cuenta Maestra".
              </p>
            </IonText>
            <IonButton 
              expand="block" 
              onClick={handleSetInitialBalance} 
              className="ion-margin-top"
            >
              Establecer Saldo
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Sesión</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton 
              expand="block" 
              color="danger" 
              onClick={handleLogout}
            >
              Cerrar Sesión
            </IonButton>
          </IonCardContent>
        </IonCard>
        
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Éxito'}
          message={'Tu saldo inicial se ha establecido correctamente.'}
          buttons={['OK']}
        />

      </IonContent>
    </IonPage>
  );
};

export default TabAjustes;