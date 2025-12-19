import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
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
  Filler // Importante para el relleno del área
} from 'chart.js';
import { HiChartBar, HiCalendarDays } from 'react-icons/hi2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SimulationEvent { date: string; description: string; amount: string; new_balance: string; }
interface ProjectionData { start_balance: string; projected_balance_end: string; simulation_log: SimulationEvent[]; }

const TabProyeccion: React.FC = () => {
  const [projection, setProjection] = useState<ProjectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<string>('3');
  const [chartData, setChartData] = useState<any>(null);
  
  const { refreshKey } = useDataStore();

  const prepareChartData = (startBalance: string, log: SimulationEvent[]) => {
    const labels = ['Hoy'];
    const data = [parseFloat(startBalance)];

    log.forEach(event => {
      const eventDate = new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      labels.push(eventDate);
      data.push(parseFloat(event.new_balance));
    });

    // Detectar si es tema oscuro (opcional, para mejorar el color del gráfico)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const chartColor = isDark ? 'rgb(16, 185, 129)' : 'rgb(79, 70, 229)'; // Emerald vs Indigo

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Saldo Proyectado',
          data: data,
          fill: true,
          borderColor: chartColor,
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)',
          tension: 0.3, // Curva un poco más suave
          pointRadius: 2,
          pointHitRadius: 10
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
    <div className="min-h-screen bg-base-200 pb-24 font-sans">
      
      {/* 1. Header */}
      <div className="bg-base-100 shadow-sm border-b border-base-300 px-6 py-6 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-black text-base-content tracking-tight">Proyección</h1>
             <p className="text-sm text-base-content/60">Simula tu futuro financiero</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
             <HiChartBar className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* 2. Control de Meses */}
        <div className="card bg-base-100 shadow-md p-4 flex-row items-center justify-between border border-base-200">
           <label className="text-sm font-bold text-base-content/70">Proyectar a:</label>
           <div className="flex items-center gap-2">
             <input
               type="number"
               className="input input-bordered input-sm w-20 text-center font-bold"
               value={months}
               onChange={(e) => setMonths(e.target.value)}
               min="1"
               max="24"
             />
             <span className="text-sm">meses</span>
           </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {error && (
          <div className="alert alert-error shadow-lg">
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && projection && (
          <>
            {/* 3. Indicadores Clave */}
            <div className="grid grid-cols-2 gap-4">
               <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
                 <div className="text-xs uppercase text-base-content/50 font-bold mb-1">Saldo Actual</div>
                 <div className="text-lg font-bold">{formatCurrency(projection.start_balance)}</div>
               </div>
               <div className="card bg-primary text-primary-content shadow-lg p-4">
                 <div className="text-xs uppercase opacity-70 font-bold mb-1">Saldo Futuro</div>
                 <div className="text-lg font-bold">{formatCurrency(projection.projected_balance_end)}</div>
               </div>
            </div>
            
            {/* 4. Gráfico */}
            {chartData && (
              <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body p-4">
                  <div className="h-64 w-full">
                    <Line 
                      data={chartData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { 
                          x: { display: false },
                          y: { grid: { display: false } } 
                        },
                        elements: { point: { radius: 0 } }
                      }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Lista de Eventos */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase text-base-content/60 ml-1">Eventos Proyectados</h3>
              {projection.simulation_log.map((event, index) => (
                <div key={index} className="card bg-base-100 shadow-sm border border-base-200 p-3 flex-row items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                      <HiCalendarDays className="w-5 h-5 opacity-50" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{event.description}</h4>
                      <p className="text-xs text-base-content/60">
                        {new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </p>
                   </div>
                   <div className={`font-bold text-sm ${parseFloat(event.amount) < 0 ? 'text-error' : 'text-success'}`}>
                      {formatCurrency(event.amount)}
                   </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TabProyeccion;