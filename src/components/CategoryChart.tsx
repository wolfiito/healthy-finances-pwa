// En: src/components/CategoryChart.tsx

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
// --- ¡NUEVO! Importar componentes de lista ---
import { 
  IonText, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonListHeader 
} from '@ionic/react';

// (Registrar ChartJS se queda igual)
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  category: string;
  total: number;
}

// Helper para formatear dinero (lo usaremos en la lista)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
};

const CategoryChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { refreshKey } = useDataStore();

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await apiClient.get('/api/summary/categories');
        const data: CategoryData[] = response.data;

        if (data.length === 0) {
          setChartData(null);
          return;
        }

        const labels = data.map(item => item.category);
        const totals = data.map(item => item.total);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Gastos por Categoría',
              data: totals,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
              ],
              borderColor: [ /* ... (colores de borde) ... */ ],
              borderWidth: 1,
            },
          ],
        });

      } catch (err: any) {
        setError('Error al cargar datos del gráfico.');
        console.error("Error en gráfico:", err);
      }
    };

    fetchChartData();
  }, [refreshKey]);

  if (error) {
    return <IonText color="danger"><p>{error}</p></IonText>;
  }
  
  if (!chartData) {
    return <IonText color="medium"><p>No hay gastos registrados este mes.</p></IonText>;
  }

  // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
  // Ahora devolvemos el Gráfico Y la Lista
  return (
    <>
      {/* 1. El Gráfico (como estaba antes) */}
      <Doughnut data={chartData} />

      {/* 2. La Lista Detallada (¡Nueva!) */}
      <IonList lines="full" style={{marginTop: '20px'}}>
        <IonListHeader>
          <IonLabel>Desglose de Gastos</IonLabel>
        </IonListHeader>

        {/* Mapeamos sobre los datos que ya tiene el gráfico */}
        {chartData.labels.map((label: string, index: number) => (
          <IonItem key={label}>
            <IonLabel>{label}</IonLabel>
            <IonText slot="end" color="danger">
              {formatCurrency(chartData.datasets[0].data[index])}
            </IonText>
          </IonItem>
        ))}
      </IonList>
    </>
  );
  // --- FIN DEL CAMBIO ---
};

export default CategoryChart;