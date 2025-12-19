import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import CategoryChart from '../components/CategoryChart'; // Asegúrate de que este componente no tenga Ionic por dentro
import { 
  HiHome, 
  HiBanknotes, 
  HiCreditCard, 
  HiTruck, 
  HiReceiptPercent, 
  HiArrowTrendingUp, 
  HiArrowTrendingDown 
} from 'react-icons/hi2';

// --- Interfaces ---
interface SimulationEvent {
  date: string;
  description: string;
  amount: string;
}

interface Transaction {
  id: number;
  description: string;
  amount: string;
  date: string;
  category: string;
}

// Helper para iconos (Versión React Icons)
const getIconForEvent = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('renta') || desc.includes('casa')) return <HiHome className="w-6 h-6" />;
  if (desc.includes('tanda')) return <HiBanknotes className="w-6 h-6" />;
  if (desc.includes('tc') || desc.includes('tarjeta')) return <HiCreditCard className="w-6 h-6" />;
  if (desc.includes('coche') || desc.includes('préstamo')) return <HiTruck className="w-6 h-6" />;
  return <HiReceiptPercent className="w-6 h-6" />; 
};

const TabDashboard: React.FC = () => {
  const [balance, setBalance] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<SimulationEvent[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshKey } = useDataStore();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Obtener Balance
      const balanceResponse = await apiClient.get('/api/transactions/balance');
      setBalance(balanceResponse.data.current_balance);
      
      // 2. Proyección (Próximos pagos)
      const projectionResponse = await apiClient.get('/api/projection?months_ahead=1');
      const allEvents: SimulationEvent[] = projectionResponse.data.simulation_log;
      const currentDate = new Date();
      
      const monthlyExpenses = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return parseFloat(event.amount) < 0 &&
               eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear();
      });
      setUpcomingEvents(monthlyExpenses);

      // 3. Movimientos Recientes
      const transactionsResponse = await apiClient.get('/api/transactions');
      const allTransactions: Transaction[] = transactionsResponse.data;
      const monthlyTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentDate.getMonth() &&
               txDate.getFullYear() === currentDate.getFullYear();
      });
      setRecentTransactions(monthlyTransactions);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(num);
  };

  if (isLoading && !balance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
        <div className="alert alert-error shadow-lg max-w-sm">
           <span>{error}</span>
        </div>
        <button className="btn btn-outline mt-4" onClick={fetchData}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pb-24 font-sans">
      
      {/* 1. Header con Balance Principal */}
      <div className="bg-gradient-to-b from-primary to-primary-focus pt-12 pb-20 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
         {/* Decoración de fondo */}
         <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

         <div className="text-center text-primary-content relative z-10">
            <h2 className="text-sm font-medium opacity-80 uppercase tracking-widest mb-2">Saldo Total</h2>
            <h1 className="text-5xl font-black tracking-tight drop-shadow-sm">
              {balance !== null ? formatCurrency(balance) : '$0.00'}
            </h1>
         </div>
      </div>

      <div className="px-4 -mt-10 space-y-6">

        {/* 2. Tarjeta: Próximos Pagos */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-5">
            <h3 className="card-title text-sm uppercase text-base-content/60 font-bold mb-4">
              📅 Próximos Pagos
            </h3>
            
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-base-content/50 italic text-center py-4">Todo pagado por este mes 🎉</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 rounded-xl hover:bg-base-200/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      {getIconForEvent(event.description)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{event.description}</h4>
                      <p className="text-xs text-base-content/60">
                        {new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className="font-bold text-error">
                      {formatCurrency(event.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Tarjeta: Movimientos Recientes */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title text-sm uppercase text-base-content/60 font-bold">
                💸 Movimientos del Mes
              </h3>
              {/* Indicador visual opcional de cantidad */}
              <span className="badge badge-sm badge-ghost">{recentTransactions.length}</span>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-sm text-base-content/50 italic text-center py-4">Sin movimientos aún</p>
            ) : (
              // --- AQUÍ ESTÁ LA MAGIA ---
              // max-h-[320px]: Altura calculada para mostrar aprox 5 items (ajusta el número si quieres ver más/menos)
              // overflow-y-auto: Permite scrollear dentro de este div
              <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto no-scrollbar">
                {recentTransactions.map((tx) => {
                  const isNegative = parseFloat(tx.amount) < 0;
                  return (
                    <div key={tx.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-base-200/50 transition-colors shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                        ${isNegative ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                        {isNegative ? <HiArrowTrendingDown className="w-5 h-5"/> : <HiArrowTrendingUp className="w-5 h-5"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{tx.description}</h4>
                        <p className="text-xs text-base-content/60">
                          {new Date(tx.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <div className={`font-bold ${isNegative ? 'text-base-content' : 'text-success'}`}>
                        {isNegative ? '' : '+'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 4. Tarjeta: Gráfico (Gastos por Categoría) */}
        {/* NOTA: Verifica que CategoryChart.tsx no use componentes de Ionic internamente */}
        <div className="card bg-base-100 shadow-xl border border-base-200 mb-6">
          <div className="card-body p-5">
            <h3 className="card-title text-sm uppercase text-base-content/60 font-bold mb-2">
              📊 Gastos por Categoría
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
               <CategoryChart transactions={recentTransactions} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TabDashboard;