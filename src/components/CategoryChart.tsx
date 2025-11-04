// En: src/components/CategoryChart.tsx

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { IonText } from '@ionic/react';

// 1. Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  category: string;
  total: number;
}

const CategoryChart: React.FC = () => {
  // 2. Estado para los datos del gráfico
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 3. Escuchar el "gatillo"
  const { refreshKey } = useDataStore();

  // 4. Cargar los datos del endpoint que creamos
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await apiClient.get('/api/summary/categories');
        const data: CategoryData[] = response.data;

        if (data.length === 0) {
          setChartData(null); // No hay datos para mostrar
          return;
        }

        // 5. Preparar los datos para el gráfico
        const labels = data.map(item => item.category);
        const totals = data.map(item => item.total);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Gastos por Categoría',
              data: totals,
              backgroundColor: [ // Colores de ejemplo
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
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
  }, [refreshKey]); // Se refresca cuando los datos cambian

  // 6. Renderizar el gráfico
  if (error) {
    return <IonText color="danger"><p>{error}</p></IonText>;
  }
  
  if (!chartData) {
    return <IonText color="medium"><p>No hay gastos registrados este mes.</p></IonText>;
  }

  // Usamos el componente <Doughnut> (dona)
  return <Doughnut data={chartData} />;
};

export default CategoryChart;