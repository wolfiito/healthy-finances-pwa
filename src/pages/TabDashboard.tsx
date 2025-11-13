
// En: src/pages/TabDashboard.tsx

import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonContent,
  IonLoading,
  IonText,
  IonCard,
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
import { home, cash, card, car, receiptOutline } from 'ionicons/icons';
import CategoryChart from '../components/CategoryChart';
import './TabDashboard.css';

// Interfaces (sin cambios)
interface SimulationEvent {
  date: string;
  description: string;
  amount: string;
}

interface Transaction {
  id: number;
  description: string;
  amount: string;
  date: string;
  category: string;
}

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
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
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

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyExpenses = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return parseFloat(event.amount) < 0 &&
               eventDate.getMonth() === currentMonth &&
               eventDate.getFullYear() === currentYear;
      });
      setUpcomingEvents(monthlyExpenses);

      const transactionsResponse = await apiClient.get('/api/transactions');
      const allTransactions: Transaction[] = transactionsResponse.data;

      const monthlyTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth &&
               txDate.getFullYear() === currentYear;
      });
      setRecentTransactions(monthlyTransactions);

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
      return (
        <IonCard className="dashboard-card balance-card">
          <IonCardTitle className="dashboard-card-title">Tu Saldo Actual</IonCardTitle>
          <IonCardContent className="balance-card-content">
            <div className="balance-amount">{formatCurrency(balance)}</div>
          </IonCardContent>
        </IonCard>
      );
    }
    return null;
  };

  return (
    <IonPage className="dashboard-page">
      {/* Cabecera invisible y sin borde para eliminar la sombra del scroll */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'transparent' }} />
      </IonHeader>
      <IonContent fullscreen={true}> 
        
        {renderBalance()}

        <IonCard className="dashboard-card">
          <IonCardTitle className="dashboard-card-title">Próximos Pagos del Mes</IonCardTitle>
          <div className="scrollable-list">
            <IonList className="dashboard-list">
              {isLoading && upcomingEvents.length === 0 && <IonText style={{padding: '16px'}}>Cargando...</IonText>}
              {!isLoading && upcomingEvents.length === 0 && (
                <IonItem className="empty-list-item">No tienes pagos programados para este mes.</IonItem>
              )}
              {upcomingEvents.map((event, index) => (
                <IonItem key={index} className="dashboard-list-item">
                  <IonIcon icon={getIconForEvent(event.description)} slot="start" color="medium"/>
                  <IonLabel className="item-label">
                    <h2>{event.description}</h2>
                    <p>{new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                  </IonLabel>
                  <IonText slot="end" className="item-amount negative">
                    {formatCurrency(event.amount)}
                  </IonText>
                </IonItem>
              ))}
            </IonList>
          </div>
        </IonCard>

        <IonCard className="dashboard-card">
          <IonCardTitle className="dashboard-card-title">Movimientos del Mes</IonCardTitle>
          <div className="scrollable-list">
            <IonList className="dashboard-list">
              {isLoading && recentTransactions.length === 0 && <IonText style={{padding: '16px'}}>Cargando...</IonText>}
              {!isLoading && recentTransactions.length === 0 && (
                <IonItem className="empty-list-item">No has registrado movimientos este mes.</IonItem>
              )}
              {recentTransactions.map((tx) => (
                <IonItem key={tx.id} className="dashboard-list-item">
                  <IonLabel className="item-label">
                    <h2>{tx.description}</h2>
                    <p>{new Date(tx.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                  </IonLabel>
                  <IonText 
                    slot="end" 
                    className={`item-amount ${parseFloat(tx.amount) < 0 ? 'negative' : 'positive'}`}>
                    {formatCurrency(tx.amount)}
                  </IonText>
                </IonItem>
              ))}
            </IonList>
          </div>
        </IonCard>

        <IonCard className="dashboard-card">
          <IonCardTitle className="dashboard-card-title">Gastos por Descripción</IonCardTitle>
          <IonCardContent>
            <CategoryChart transactions={recentTransactions} />
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
};

export default TabDashboard;
