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
  
  // --- ¡NUEVO! Importar el gráfico de Línea ---
  import { Line } from 'react-chartjs-2';
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
  } from 'chart.js';
  
  // 2. Registrar los componentes del gráfico de Línea
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
  );
  // --- FIN DE LO NUEVO ---
  
  // (Las interfaces SimulationEvent y ProjectionData se quedan igual)
  interface SimulationEvent { date: string; description: string; amount: string; new_balance: string; }
  interface ProjectionData { start_balance: string; projected_balance_end: string; simulation_log: SimulationEvent[]; }
  
  const TabProyeccion: React.FC = () => {
    const [projection, setProjection] = useState<ProjectionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [months, setMonths] = useState<string>('3');
    
    // --- ¡NUEVO! Estado para los datos del gráfico ---
    const [chartData, setChartData] = useState<any>(null);
  
    const { refreshKey } = useDataStore();
  
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
        
        // --- ¡NUEVO! Procesar datos para el gráfico ---
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
  
    // --- ¡NUEVA FUNCIÓN! ---
    // "Masajea" los datos del log para el gráfico
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
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          }
        ]
      });
    };
    // --- FIN DE LA NUEVA FUNCIÓN ---
  
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
              
              {/* --- ¡GRÁFICO DE LÍNEA! --- */}
              {/* Reemplazamos el <div> de placeholder con el gráfico real */}
              <div style={{ marginTop: '20px' }}>
                {chartData && <Line data={chartData} />}
              </div>
              {/* --- FIN DEL GRÁFICO --- */}
  
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