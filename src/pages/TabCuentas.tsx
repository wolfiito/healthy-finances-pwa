// En: src/pages/TabCuentas.tsx

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonLoading,
  IonText,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';
import React, { useState, useEffect } from 'react'; // Importa useEffect
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore'; // Importa el gatillo
  
interface Account {
  account_id: number;
  account_name: string;
  account_type: string;
  current_balance: string;
}

const TabCuentas: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { refreshKey } = useDataStore(); // "Escucha" el gatillo

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/api/accounts/summary');
      setAccounts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar las cuentas.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ¡Cambiado! Ahora usa useEffect y escucha al refreshKey
  useEffect(() => {
    fetchAccounts();
  }, [refreshKey]); // Se refresca al inicio Y cuando 'refreshKey' cambia

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(value));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cuentas y Deudas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading && <IonLoading isOpen={true} message={'Cargando...'} />}
        {error && <IonText color="danger"><p>{error}</p></IonText>}
        
        {!isLoading && !error && (
          <IonList>
            {accounts.map((account) => (
              <IonItem key={account.account_id}>
                <IonLabel>
                  <h2>{account.account_name}</h2>
                  <p>{account.account_type}</p>
                </IonLabel>
                <IonText 
                  slot="end" 
                  color={parseFloat(account.current_balance) < 0 ? 'danger' : 'success'}
                >
                  {formatCurrency(account.current_balance)}
                </IonText>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TabCuentas;