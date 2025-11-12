// En: src/components/CategoryChart.tsx

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { IonText } from '@ionic/react'; // Solo se necesita IonText

// Registrar ChartJS (sin cambios)
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  category: string;
  total: number;
}

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
              label: 'Gasto por Categoría',
              data: totals,
              // --- ¡NUEVOS COLORES! Inspirados en la paleta Índigo/Lavanda ---
              backgroundColor: [
                '#4f46e5', // Índigo (Primario)
                '#a855f7', // Lavanda (Secundario)
                '#6366f1', // Variante de Índigo
                '#c084fc', // Variante de Lavanda
                '#818cf8', // Variante más clara de Índigo
                '#d8b4fe', // Variante más clara de Lavanda
              ],
              borderColor: '#ffffff', // Borde blanco para separar segmentos
              borderWidth: 2,
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
    return <IonText color="medium" className="ion-text-center"><p>No hay gastos para mostrar.</p></IonText>;
  }

  // --- ¡SOLO SE DEVUELVE EL GRÁFICO! ---
  // Se elimina la lista para un diseño más limpio, como pide el mock-up.
  return (
    <Doughnut 
      data={chartData} 
      options={{
        plugins: {
          legend: {
            position: 'bottom', // Leyenda abajo para mejor distribución
            labels: {
              boxWidth: 12,
              padding: 20,
            }
          }
        }
      }}
    />
  );
};

export default CategoryChart;
