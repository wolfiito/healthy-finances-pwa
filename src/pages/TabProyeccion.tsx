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
  Filler
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
  const [isDark, setIsDark] = useState(false);
  
  const { refreshKey } = useDataStore();

  // 1. Detectar Tema Dinámicamente (Para que el gráfico cambie de color solo)
  useEffect(() => {
    const checkTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Si el tema es explícitamente dark, o si es null (sistema) y el sistema es dark
      setIsDark(currentTheme === 'dark' || (currentTheme === null && systemDark));
    };

    checkTheme();
    
    // Escuchar cambios en el atributo data-theme
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);

  // 2. Preparar datos del gráfico
  const prepareChartData = (startBalance: string, log: SimulationEvent[]) => {
    const labels = ['Hoy'];
    const data = [parseFloat(startBalance)];

    log.forEach(event => {
      const eventDate = new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      labels.push(eventDate);
      data.push(parseFloat(event.new_balance));
    });

    // --- COLORES DEL TEMA RAINBOW ---
    // Dark: Verde Neón (#10b981 - Emerald 500)
    // Light: Rosa Chicle (#db2777 - Pink 600)
    const lineColor = isDark ? '#10b981' : '#db2777'; 
    const fillColor = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(219, 39, 119, 0.15)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Saldo Proyectado',
          data: data,
          fill: true,
          borderColor: lineColor,
          backgroundColor: fillColor,
          borderWidth: 3,
          tension: 0.4, // Curva suave
          pointRadius: 0, // Sin puntos para que se vea más limpio
          pointHitRadius: 20
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
      // Pasamos los datos a la función de gráfico, que ahora usará el estado isDark actualizado
      prepareChartData(response.data.start_balance, response.data.simulation_log);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar la proyección.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Recargar si cambia la data o si cambia el tema (isDark)
  useEffect(() => {
    if (projection) {
      prepareChartData(projection.start_balance, projection.simulation_log);
    }
  }, [isDark]); 

  useEffect(() => {
    fetchProjection();
  }, [refreshKey, months]);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(parseFloat(value));
  };

  return (
    <div className="min-h-screen bg-base-200 pb-24 font-sans">
      
      {/* 1. Header Sticky */}
      <div className="sticky top-0 z-30 bg-base-100 shadow-sm border-b border-base-300 px-6 py-4 pt-safe">
        <div className="flex justify-between items-center mt-2">
          <div>
             <h1 className="text-2xl font-black text-base-content tracking-tight">Proyección</h1>
             <p className="text-sm text-base-content/60">Simula tu futuro financiero</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
               className="input input-bordered input-sm w-20 text-center font-bold focus:input-primary"
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
          <div className="alert alert-error shadow-lg text-white">
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
               {/* Usamos bg-primary y text-primary-content para que se adapte al Rosa/Verde */}
               <div className="card bg-primary text-primary-content shadow-lg p-4 shadow-primary/30">
                 <div className="text-xs uppercase opacity-70 font-bold mb-1">Saldo Futuro</div>
                 <div className="text-lg font-bold">{formatCurrency(projection.projected_balance_end)}</div>
               </div>
            </div>
            
            {/* 4. Gráfico */}
            {chartData && (
              <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
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
                          y: { 
                            grid: { display: false }, // Sin rejilla
                            ticks: { display: false } // Sin números en eje Y para limpieza
                          } 
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
                   <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0 text-base-content/40">
                      <HiCalendarDays className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{event.description}</h4>
                      <p className="text-xs text-base-content/60">
                        {new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </p>
                   </div>
                   <div className={`font-bold text-sm ${parseFloat(event.amount) < 0 ? 'text-base-content' : 'text-success'}`}>
                      {parseFloat(event.amount) > 0 ? '+' : ''}{formatCurrency(event.amount)}
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