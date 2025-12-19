import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { HiChartBar, HiCalendarDays } from 'react-icons/hi2';

interface SimulationEvent { 
  date: string; 
  description: string; 
  amount: string; 
  new_balance: string; 
}

interface ProjectionData { 
  start_balance: string; 
  projected_balance_end: string; 
  simulation_log: SimulationEvent[]; 
}

const TabProyeccion: React.FC = () => {
  const [projection, setProjection] = useState<ProjectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<string>('3');
  
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
            {/* 3. Indicadores Clave (Tarjetas Grandes) */}
            <div className="grid grid-cols-2 gap-4">
               {/* Saldo Actual */}
               <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
                 <div className="text-xs uppercase text-base-content/50 font-bold mb-1">Saldo Actual</div>
                 <div className="text-lg font-bold truncate">{formatCurrency(projection.start_balance)}</div>
               </div>
               
               {/* Saldo Futuro (Resaltado con color del tema) */}
               <div className="card bg-primary text-primary-content shadow-lg p-4 shadow-primary/30">
                 <div className="text-xs uppercase opacity-70 font-bold mb-1">Saldo Futuro</div>
                 <div className="text-lg font-bold truncate">{formatCurrency(projection.projected_balance_end)}</div>
               </div>
            </div>
            
            {/* 4. Lista de Eventos (Timeline Vertical Simple) */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase text-base-content/60 ml-1 mt-2">Eventos Proyectados</h3>
              
              {projection.simulation_log.length === 0 ? (
                 <p className="text-center text-sm opacity-50 italic py-4">No hay eventos para este periodo.</p>
              ) : (
                projection.simulation_log.map((event, index) => (
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
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TabProyeccion;