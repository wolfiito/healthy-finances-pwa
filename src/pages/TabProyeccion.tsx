// En: src/pages/TabProyeccion.tsx

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
  IonInput
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';

// --- Imports de Chart.js ---
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// --- Fin Imports de Chart.js ---

interface SimulationEvent { date: string; description: string; amount: string; new_balance: string; }
interface ProjectionData { start_balance: string; projected_balance_end: string; simulation_log: SimulationEvent[]; }

const TabProyeccion: React.FC = () => {
  const [projection, setProjection] = useState<ProjectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<string>('3');
  const [chartData, setChartData] = useState<any>(null); // Estado para los datos del gráfico
  
  const { refreshKey } = useDataStore();

  // Función para procesar los datos del log para el gráfico
  const prepareChartData = (startBalance: string, log: SimulationEvent[]) => {
    // El gráfico empieza con el saldo inicial
    const labels = ['Hoy'];
    const data = [parseFloat(startBalance)];

    // Añade cada evento del log
    log.forEach(event => {
      const eventDate = new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      labels.push(eventDate);
      data.push(parseFloat(event.new_balance));
    });

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Saldo Proyectado',
          data: data,
          fill: true,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.4)', // Fondo de área
          tension: 0.1
        }
      ]
    });
  };


  const fetchProjection = async () => {
    try {
      if (parseInt(months, 10) <= 0) {
        setProjection(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/projection?months_ahead=${months}`);
      setProjection(response.data);
      
      // Llamamos a la función de procesamiento de datos
      prepareChartData(response.data.start_balance, response.data.simulation_log);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar la proyección.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjection();
  }, [refreshKey, months]);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(value));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary"> {/* <-- ¡AÑADE ESTO! */}
          <IonTitle>Proyección ({months} Meses)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        
        <IonItem lines="full">
          <IonLabel>Proyectar a:</IonLabel>
          <IonInput
            type="number"
            value={months}
            onIonInput={(e) => setMonths(e.detail.value!)}
            slot="end"
            style={{ maxWidth: '80px', textAlign: 'right' }}
          />
          <IonLabel slot="end">meses</IonLabel>
        </IonItem>

        {isLoading && <IonLoading isOpen={true} message={'Calculando futuro...'} />}
        {error && <IonText color="danger" className="ion-padding"><p>{error}</p></IonText>}
        
        {!isLoading && !error && projection && (
          <div className="ion-padding">
            
            <h3 style={{ marginBottom: '0.5em' }}>Indicadores Clave</h3>
            <IonItem lines="none">
              <IonLabel>Saldo Inicial (Real):</IonLabel>
              <IonText slot="end" color="medium">
                <h2>{formatCurrency(projection.start_balance)}</h2>
              </IonText>
            </IonItem>
            <IonItem lines="full">
              <IonLabel>Saldo Proyectado:</IonLabel>
              <IonText slot="end" color="primary">
                <h2>{formatCurrency(projection.projected_balance_end)}</h2>
              </IonText>
            </IonItem>
            
            {/* --- Renderizar el Gráfico de Línea --- */}
            {chartData && (
              <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                <Line 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: false } } // Mostrar el valor real del saldo
                  }} 
                />
              </div>
            )}
            {/* --- Fin Gráfico --- */}

            <h3 style={{ marginTop: '30px' }}>Eventos Proyectados</h3>
            <IonList>
              {projection.simulation_log.map((event, index) => (
                <IonItem key={index}>
                  <IonLabel>
                    <h2>{event.description}</h2>
                    <p>{new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                  </IonLabel>
                  <IonText 
                    slot="end" 
                    color={parseFloat(event.amount) < 0 ? 'danger' : 'success'}
                  >
                    {formatCurrency(event.amount)}
                  </IonText>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TabProyeccion;