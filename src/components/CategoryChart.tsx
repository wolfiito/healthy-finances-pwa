
// En: src/components/CategoryChart.tsx

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useThemeStore } from '../store/themeStore';
import { IonText } from '@ionic/react';

ChartJS.register(ArcElement, Tooltip, Legend);

// Interface para las props del componente
interface Transaction {
  id: number;
  description: string;
  amount: string;
  date: string;
  category: string;
}

interface CategoryChartProps {
  transactions: Transaction[];
}

// Paletas de colores (con un color extra para la categoría "Otros")
const lightModeColors = {
  primary: '#E91E63',
  shades: ['#E91E63', '#C2185B', '#AD1457', '#880E4F', '#F06292', '#BDBDBD']
};

const darkModeColors = {
  primary: '#FF4081',
  shades: ['#FF4081', '#F50057', '#C51162', '#EC407A', '#F06292', '#757575']
};

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const [chartData, setChartData] = useState<any>(null);
  const { isDark } = useThemeStore();

  useEffect(() => {
    // 1. Filtrar solo los gastos (montos negativos)
    const expenses = transactions.filter(tx => parseFloat(tx.amount) < 0);

    if (expenses.length === 0) {
      setChartData(null);
      return;
    }

    // 2. Agrupar por descripción y sumar los montos
    const descriptionMap: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const amount = Math.abs(parseFloat(expense.amount)); // Usar valor absoluto
      descriptionMap[expense.description] = (descriptionMap[expense.description] || 0) + amount;
    });

    // 3. Ordenar de mayor a menor
    const sortedDescriptions = Object.entries(descriptionMap)
      .map(([description, total]) => ({ description, total }))
      .sort((a, b) => b.total - a.total);

    // 4. Tomar los 5 más altos y agrupar el resto en "Otros"
    const top5 = sortedDescriptions.slice(0, 5);
    const others = sortedDescriptions.slice(5);
    
    let labels = top5.map(item => item.description);
    let totals = top5.map(item => item.total);

    if (others.length > 0) {
      const othersTotal = others.reduce((sum, item) => sum + item.total, 0);
      labels.push('Otros');
      totals.push(othersTotal);
    }

    const colorPalette = isDark ? darkModeColors.shades : lightModeColors.shades;

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Gastos por Descripción',
          data: totals,
          backgroundColor: colorPalette,
          borderColor: isDark ? '#1c1c1e' : '#ffffff',
          borderWidth: 2,
        },
      ],
    });

  }, [transactions, isDark]); // Se ejecuta si cambian las transacciones o el tema

  if (!chartData) {
    return <IonText style={{ textAlign: 'center', padding: '16px' }}>No hay gastos para mostrar en el gráfico.</IonText>;
  }

  return (
    <Doughnut 
      data={chartData} 
      options={{
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: isDark ? '#ffffff' : '#000000',
              boxWidth: 20,
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                   // Formatear como moneda MXN
                   label += new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(context.parsed);
                }
                return label;
              }
            }
          }
        },
      }}
    />
  );
};

export default CategoryChart;
