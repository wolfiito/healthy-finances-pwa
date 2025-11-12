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
import CategoryChart from '../components/CategoryChart'; // <-- ¡IMPORTADO DE NUEVO!
import { home, car, card, receiptOutline } from 'ionicons/icons';

// Interfaz para un Pago Futuro
interface UpcomingPayment {
  date: string;
  description: string;
  amount: string;
}

// Asigna un ícono basado en la descripción del pago
const getIconForPayment = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('renta') || desc.includes('hipoteca')) return home;
  if (desc.includes('auto') || desc.includes('coche')) return car;
  if (desc.includes('tarjeta')) return card;
  return receiptOutline;
};

const TabDashboard: React.FC = () => {
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshKey } = useDataStore(); // Para refrescar datos

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtenemos solo los próximos pagos desde la proyección
      const response = await apiClient.get('/api/projection?months_ahead=1');
      const allEvents: UpcomingPayment[] = response.data.simulation_log;

      // Filtramos solo gastos (montos negativos) y tomamos los 3-4 más próximos
      const futureExpenses = allEvents
        .filter(event => parseFloat(event.amount) < 0)
        .slice(0, 4); 

      setUpcomingPayments(futureExpenses);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  // Formato de moneda para MXN
  const formatCurrency = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(numericValue);
  };

  return (
    <IonPage>
      {/* El Header se elimina para un look más minimalista */}
      <IonContent fullscreen className="ion-padding">
        
        {/* --- 1. TARJETA HÉROE --- */}
        <IonCard className="card-hero">
          <IonCardHeader>
            {/* Texto solicitado */}
            <IonCardTitle>SALDO ACTUAL (NETO)</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Monto solicitado */}
            <h1>{formatCurrency(10131.76)}</h1>
          </IonCardContent>
        </IonCard>

        {/* --- 2. LISTA DE PRÓXIMOS PAGOS --- */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Próximos Pagos</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isLoading && upcomingPayments.length === 0 && <IonText color="medium">Cargando pagos...</IonText>}
            {!isLoading && error && <IonText color="danger">{error}</IonText>}
            {!isLoading && upcomingPayments.length === 0 && !error && (
              <IonItem lines="none">
                <IonLabel className="ion-text-center">¡No tienes pagos pendientes!</IonLabel>
              </IonItem>
            )}
            
            <IonList lines="full" inset={true}>
              {upcomingPayments.map((payment, index) => (
                <IonItem key={index}>
                  {/* Ícono temático */}
                  <IonIcon icon={getIconForPayment(payment.description)} slot="start" color="medium"/>
                  <IonLabel>
                    <h2>{payment.description}</h2>
                    <p>{new Date(payment.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                  </IonLabel>
                  {/* Monto en rojo */}
                  <IonText slot="end" color="danger">
                    {formatCurrency(payment.amount)}
                  </IonText>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* --- 3. GRÁFICO DE GASTO POR CATEGORÍA --- */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Gasto por Categoría</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* El componente del gráfico se encarga de su propio estado de carga/error */}
            <CategoryChart />
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
};

export default TabDashboard;
