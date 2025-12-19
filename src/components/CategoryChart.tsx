import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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

// --- COLORES VIBRANTES (RAINBOW THEME) ---

// Modo Claro: Rosas, Azules y Morados Pastel pero fuertes
const lightModeColors = [
  '#db2777', // Pink 600 (Primary)
  '#4f46e5', // Indigo 600
  '#0891b2', // Cyan 600
  '#e11d48', // Rose 600
  '#9333ea', // Purple 600
  '#f59e0b', // Amber (Otros)
];

// Modo Oscuro: Verdes Neón, Cian y Violetas Eléctricos
const darkModeColors = [
  '#10b981', // Emerald 500 (Primary)
  '#3b82f6', // Blue 500
  '#a855f7', // Purple 500
  '#14b8a6', // Teal 500
  '#f43f5e', // Rose 500
  '#64748b', // Slate (Otros)
];

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [isDark, setIsDark] = useState(false);

  // 1. Detectar Tema
  useEffect(() => {
    // Revisamos el atributo del HTML que pone DaisyUI
    const checkTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      // Si el tema es 'dark' O si es system y el sistema es dark
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(currentTheme === 'dark' || (currentTheme === null && systemDark));
    };

    checkTheme();

    // Observer para detectar cambios en el atributo data-theme dinámicamente
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  // 2. Procesar Datos
  useEffect(() => {
    const expenses = transactions.filter(tx => parseFloat(tx.amount) < 0);

    if (expenses.length === 0) {
      setChartData(null);
      setTotalExpense(0);
      return;
    }

    // Calcular Total Global
    const total = expenses.reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);
    setTotalExpense(total);

    // A. Agrupar por CATEGORÍA (No descripción)
    const categoryMap: { [key: string]: number } = {};
    expenses.forEach(expense => {
      // Si la categoría viene vacía, la ponemos en 'Otros'
      const catName = expense.category ? expense.category : 'General';
      const amount = Math.abs(parseFloat(expense.amount));
      categoryMap[catName] = (categoryMap[catName] || 0) + amount;
    });

    // B. Ordenar y Top 5
    const sortedCats = Object.entries(categoryMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    const top5 = sortedCats.slice(0, 5);
    const others = sortedCats.slice(5);
    
    let labels = top5.map(item => item.category);
    let values = top5.map(item => item.total);

    if (others.length > 0) {
      const othersTotal = others.reduce((sum, item) => sum + item.total, 0);
      labels.push('Otros');
      values.push(othersTotal);
    }

    // C. Configurar Datos
    const colorPalette = isDark ? darkModeColors : lightModeColors;

    setChartData({
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: colorPalette,
          borderWidth: 0, // Sin bordes para look más limpio
          borderRadius: 5, // Bordes redondeados en las rebanadas
          spacing: 2, // Pequeño espacio entre rebanadas
          hoverOffset: 10
        },
      ],
    });

  }, [transactions, isDark]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      maximumFractionDigits: 0 // Sin decimales para ahorrar espacio
    }).format(value);
  };

  if (!chartData) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-50">
        <div className="w-16 h-16 rounded-full bg-base-300 animate-pulse mb-2"></div>
        <p className="text-xs italic">Faltan datos</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      
      {/* Gráfico */}
      <div className="relative w-full max-w-[220px] aspect-square">
        <Doughnut 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // Más delgado para que se vea elegante
            plugins: {
              legend: {
                display: false // Ocultamos la leyenda default para hacer una personalizada si quisieras, o para limpieza
              },
              tooltip: {
                backgroundColor: isDark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDark ? '#fff' : '#000',
                bodyColor: isDark ? '#ccc' : '#333',
                titleFont: { size: 13, weight: 'bold' },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => {
                    const val = context.parsed;
                    return ` ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)}`;
                  }
                }
              }
            },
          }}
        />
        
        {/* TEXTO CENTRAL (Total) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mb-1">Total</span>
           <span className="text-xl font-black text-base-content tracking-tighter">
             {formatCurrency(totalExpense)}
           </span>
        </div>
      </div>

      {/* Leyenda Personalizada Compacta (Debajo) */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {chartData.labels.map((label: string, index: number) => (
          <div key={label} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
            ></div>
            <span className="text-xs font-medium text-base-content/70">{label}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CategoryChart;