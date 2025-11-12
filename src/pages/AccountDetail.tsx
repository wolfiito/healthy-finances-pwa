// En: src/pages/AccountDetail.tsx

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
    IonLabel,
    IonButtons,
    IonBackButton // ¡El botón de "Atrás"!
  } from '@ionic/react';
  import React, { useState, useEffect } from 'react';
  // ¡Importamos 'useParams' para leer el ID de la URL!
  import { useParams } from 'react-router-dom';
  import apiClient from '../services/api';
  import { useDataStore } from '../store/dataStore';
  
  // 1. Definir la "forma" de una transacción
  interface Transaction {
    id: number;
    description: string;
    amount: string;
    date: string;
    category: string;
  }
  
  // 2. Definir la "forma" del parámetro de la URL
  interface AccountDetailPageParams {
    id: string; // El ID siempre viene como string
  }
  
  const AccountDetail: React.FC = () => {
    // 3. Obtener el ID de la cuenta desde la URL
    const { id } = useParams<AccountDetailPageParams>();
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accountName, setAccountName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { refreshKey } = useDataStore(); // Escucha el "gatillo"
  
    // 4. Cargar datos cuando la página cargue o el ID cambie
    useEffect(() => {
      const fetchAccountDetails = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // 5. ¡Llamar al nuevo endpoint del backend!
          const response = await apiClient.get(`/api/accounts/${id}/transactions`);
          
          setAccountName(response.data.account_name);
          setTransactions(response.data.transactions);
        } catch (err: any) {
          setError(err.response?.data?.error || 'Error al cargar los detalles.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAccountDetails();
    }, [id, refreshKey]); // Se refresca si el ID o el gatillo cambian
  
    // Helper para formatear dinero
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
            {/* 6. Añadir un botón de "Atrás" automático */}
            <IonButtons slot="start">
              <IonBackButton defaultHref="/app/cuentas" />
            </IonButtons>
            <IonTitle>{accountName || 'Detalle'}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {isLoading && <IonLoading isOpen={true} message={'Cargando...'} />}
          {error && <IonText color="danger"><p>{error}</p></IonText>}
          
          {!isLoading && !error && (
            <IonList>
              {transactions.length === 0 && (
                <IonItem lines="none">
                  <IonLabel className="ion-text-center ion-padding">
                    No hay movimientos en esta cuenta.
                  </IonLabel>
                </IonItem>
              )}
              {transactions.map((tx) => (
                <IonItem key={tx.id}>
                  <IonLabel>
                    <h2>{tx.description}</h2>
                    <p>{new Date(tx.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                  </IonLabel>
                  <IonText 
                    slot="end" 
                    color={parseFloat(tx.amount) < 0 ? 'danger' : 'success'}
                  >
                    {formatCurrency(tx.amount)}
                  </IonText>
                </IonItem>
              ))}
            </IonList>
          )}
        </IonContent>
      </IonPage>
    );
  };
  
  export default AccountDetail;