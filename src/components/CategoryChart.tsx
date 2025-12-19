import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Interfaces ---
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

// --- Paletas de Colores (Adaptadas a tus Temas) ---

// Tonos Índigo/Violeta para el modo Claro
const lightModeColors = [
  '#4f46e5', // Índigo Principal
  '#7c3aed', // Violeta
  '#2563eb', // Azul
  '#db2777', // Rosa Fuerte
  '#0891b2', // Cyan
  '#94a3b8'  // Gris (Otros)
];

// Tonos Esmeralda/Bosque para el modo Oscuro
const darkModeColors = [
  '#10b981', // Esmeralda Principal (Tu Primary)
  '#34d399', // Esmeralda Claro
  '#059669', // Esmeralda Oscuro
  '#06b6d4', // Cyan
  '#a7f3d0', // Menta Muy Claro
  '#475569'  // Gris Oscuro (Otros)
];

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);

  // 1. Detectar Tema Automáticamente (Igual que en el Login)
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(query.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  // 2. Procesar Datos
  useEffect(() => {
    // A. Filtrar solo gastos (negativos)
    const expenses = transactions.filter(tx => parseFloat(tx.amount) < 0);

    if (expenses.length === 0) {
      setChartData(null);
      return;
    }

    // B. Agrupar por descripción
    const descriptionMap: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const amount = Math.abs(parseFloat(expense.amount));
      descriptionMap[expense.description] = (descriptionMap[expense.description] || 0) + amount;
    });

    // C. Ordenar y Top 5
    const sortedDescriptions = Object.entries(descriptionMap)
      .map(([description, total]) => ({ description, total }))
      .sort((a, b) => b.total - a.total);

    const top5 = sortedDescriptions.slice(0, 5);
    const others = sortedDescriptions.slice(5);
    
    let labels = top5.map(item => item.description);
    let totals = top5.map(item => item.total);

    if (others.length > 0) {
      const othersTotal = others.reduce((sum, item) => sum + item.total, 0);
      labels.push('Otros');
      totals.push(othersTotal);
    }

    // D. Asignar Colores según el tema detectado
    const colorPalette = isDark ? darkModeColors : lightModeColors;
    const borderColor = isDark ? '#020617' : '#ffffff'; // Color del borde (fondo de la tarjeta)

    setChartData({
      labels: labels,
      datasets: [
        {
          data: totals,
          backgroundColor: colorPalette,
          borderColor: borderColor,
          borderWidth: 2,
          hoverOffset: 4
        },
      ],
    });

  }, [transactions, isDark]);

  if (!chartData) {
    return (
      <div className="text-center py-10 px-4">
        <p className="text-sm text-base-content/60 italic">
          No hay gastos suficientes para generar el gráfico este mes.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <Doughnut 
        data={chartData} 
        options={{
          responsive: true,
          maintainAspectRatio: false, // Permite ajustar altura con CSS
          cutout: '65%', // Hace el agujero de la dona más elegante
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: isDark ? '#e2e8f0' : '#1e293b', // Color del texto de leyenda
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                font: {
                  size: 11,
                  family: "'Inter', sans-serif"
                }
              },
            },
            tooltip: {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              titleColor: isDark ? '#ffffff' : '#000000',
              bodyColor: isDark ? '#cbd5e1' : '#334155',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed !== null) {
                     label += new Intl.NumberFormat('es-MX', { 
                       style: 'currency', 
                       currency: 'MXN' 
                     }).format(context.parsed);
                  }
                  return label;
                }
              }
            }
          },
        }}
      />
      {/* Texto central opcional (Total) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
         <span className="text-xs font-bold text-base-content/30 uppercase tracking-widest">Gastos</span>
      </div>
    </div>
  );
};

export default CategoryChart;