// En: src/pages/TabDashboard.tsx

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonLoading,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
// Ya NO importamos CategoryChart
import { home, cash, card, car, receiptOutline } from 'ionicons/icons';

// Interfaz para el Saldo (como antes)
interface SimulationEvent {
  date: string;
  description: string;
  amount: string;
}

// --- ¡NUEVO! Interfaz para Transacción Individual ---
interface Transaction {
  id: number;
  description: string;
  amount: string;
  date: string;
  category: string;
}
// --- FIN NUEVO ---

// (La función getIconForEvent se queda igual)
const getIconForEvent = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('renta') || desc.includes('casa')) return home;
  if (desc.includes('tanda')) return cash;
  if (desc.includes('tc') || desc.includes('tarjeta')) return card;
  if (desc.includes('coche') || desc.includes('préstamo')) return car;
  return receiptOutline; 
};

const TabDashboard: React.FC = () => {
  const [balance, setBalance] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<SimulationEvent[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]); // <-- ¡NUEVO ESTADO!
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { refreshKey } = useDataStore();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Llamada 1: Obtener el saldo (sin cambios)
      const balanceResponse = await apiClient.get('/api/transactions/balance');
      setBalance(balanceResponse.data.current_balance);
      
      // Llamada 2: Obtener la proyección (sin cambios)
      const projectionResponse = await apiClient.get('/api/projection?months_ahead=1');
      const allEvents: SimulationEvent[] = projectionResponse.data.simulation_log;
      const upcomingExpenses = allEvents.filter(
        (event) => parseFloat(event.amount) < 0
      );
      setUpcomingEvents(upcomingExpenses.slice(0, 5));

      // --- ¡NUEVO! Llamada 3: Obtener transacciones recientes ---
      const transactionsResponse = await apiClient.get('/api/transactions');
      setRecentTransactions(transactionsResponse.data);
      // --- FIN NUEVO ---

    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(value));
  };

  const renderBalance = () => {
    // (Esta función se queda igual)
    if (isLoading && !balance) {
      return <IonLoading isOpen={true} message={'Cargando...'} />;
    }
    if (error) {
      return <IonText color="danger"><p>{error}</p></IonText>;
    }
    if (balance !== null) {
      const formattedBalance = formatCurrency(balance);
      return (
        <IonCard className="card-hero">
          <IonCardHeader>
            <IonCardTitle>Tu Saldo Actual</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <h1>{formattedBalance}</h1>
          </IonCardContent>
        </IonCard>
      );
    }
    return null;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Resumen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        
        {renderBalance()}

        {/* Tarjeta de Próximos Pagos (sin cambios) */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Próximos Pagos</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* ... (lógica de 'loading' y lista de 'upcomingEvents') ... */}
            {isLoading && upcomingEvents.length === 0 && <IonText color="medium">Cargando...</IonText>}
            {!isLoading && upcomingEvents.length === 0 && (
              <IonItem lines="none">
                <IonLabel className="ion-text-center ion-padding">No tienes pagos programados.</IonLabel>
              </IonItem>
            )}
            <IonList lines="full" inset={true}>
              {upcomingEvents.map((event, index) => (
                <IonItem key={index}>
                  <IonIcon icon={getIconForEvent(event.description)} slot="start" color="medium"/>
                  <IonLabel>
                    <h2>{event.description}</h2>
                    <p>{new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                  </IonLabel>
                  <IonText slot="end" color="danger">
                    {formatCurrency(event.amount)}
                  </IonText>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* --- ¡TARJETA MODIFICADA! --- */}
        {/* Reemplazamos el Gráfico por la Lista de Transacciones Recientes */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Movimientos Recientes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isLoading && recentTransactions.length === 0 && <IonText color="medium">Cargando...</IonText>}
            
            {!isLoading && recentTransactions.length === 0 && (
              <IonItem lines="none">
                <IonLabel className="ion-text-center ion-padding">No has registrado movimientos.</IonLabel>
              </IonItem>
            )}

            <IonList lines="full" inset={true}>
              {recentTransactions.map((tx) => (
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
          </IonCardContent>
        </IonCard>
        {/* --- FIN DEL CAMBIO --- */}

      </IonContent>
    </IonPage>
  );
};

export default TabDashboard;