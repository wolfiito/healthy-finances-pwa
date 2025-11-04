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
  IonIcon // <-- 1. IMPORTAR EL COMPONENTE DE ÍCONO
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import CategoryChart from '../components/CategoryChart';
// 2. IMPORTAR LOS ÍCONOS QUE USAREMOS
import { home, cash, card, car, receiptOutline } from 'ionicons/icons';

// (La interfaz se queda igual)
interface SimulationEvent {
  date: string;
  description: string;
  amount: string;
}

// --- ¡NUEVA FUNCIÓN! ---
/**
 * Devuelve un ícono basado en palabras clave de la descripción.
 */
const getIconForEvent = (description: string) => {
  const desc = description.toLowerCase();
  
  if (desc.includes('renta') || desc.includes('casa')) {
    return home;
  }
  if (desc.includes('tanda')) {
    return cash;
  }
  if (desc.includes('tc') || desc.includes('tarjeta')) {
    return card;
  }
  if (desc.includes('coche') || desc.includes('préstamo')) {
    return car;
  }
  
  // Ícono por defecto para otros gastos
  return receiptOutline; 
};
// --- FIN DE LA NUEVA FUNCIÓN ---


const TabDashboard: React.FC = () => {
  // ... (Toda la lógica de 'useState', 'fetchData', 'useEffect', 'formatCurrency' y 'renderBalance' 
  //      se queda exactamente igual que en el paso anterior) ...
  const [balance, setBalance] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<SimulationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { refreshKey } = useDataStore();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const balanceResponse = await apiClient.get('/api/transactions/balance');
      setBalance(balanceResponse.data.current_balance);
      
      const projectionResponse = await apiClient.get('/api/projection?months_ahead=1');
      const allEvents: SimulationEvent[] = projectionResponse.data.simulation_log;
      const upcomingExpenses = allEvents.filter(
        (event) => parseFloat(event.amount) < 0
      );
      setUpcomingEvents(upcomingExpenses.slice(0, 5));

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

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Próximos Pagos</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isLoading && upcomingEvents.length === 0 && <IonText color="medium">Cargando...</IonText>}
            
            {!isLoading && upcomingEvents.length === 0 && (
              <IonText color="medium">No tienes pagos programados.</IonText>
            )}

            {/* --- ¡AQUÍ ESTÁ EL CAMBIO! --- */}
            {/* Añadimos el <IonIcon> a la lista */}
            <IonList lines="full" inset={true}>
              {upcomingEvents.map((event, index) => (
                <IonItem key={index}>
                  {/* 3. El nuevo ícono */}
                  <IonIcon 
                    icon={getIconForEvent(event.description)} 
                    slot="start" 
                    color="medium"
                  />
                  <IonLabel>
                    <h2>{event.description}</h2>
                    <p>{new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                  </IonLabel>
                  <IonText 
                    slot="end" 
                    color="danger"
                  >
                    {formatCurrency(event.amount)}
                  </IonText>
                </IonItem>
              ))}
            </IonList>
            {/* --- FIN DEL CAMBIO --- */}
          </IonCardContent>
        </IonCard>

        {/* El gráfico se queda igual */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Gastos del Mes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '300px', width: '100%' }}>
              <CategoryChart />
            </div>
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
};

export default TabDashboard;