import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import CategoryChart from '../components/CategoryChart';
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
interface SimulationEvent { date: string; description: string; amount: string; }
interface Transaction { id: number; description: string; amount: string; date: string; category: string; }

// Helper Iconos
const getIconForEvent = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('renta') || desc.includes('casa')) return <HiHome className="w-6 h-6" />;
  if (desc.includes('tanda')) return <HiBanknotes className="w-6 h-6" />;
  if (desc.includes('tc') || desc.includes('tarjeta')) return <HiCreditCard className="w-6 h-6" />;
  if (desc.includes('coche') || desc.includes('préstamo')) return <HiTruck className="w-6 h-6" />;
  return <HiReceiptPercent className="w-6 h-6" />; 
};

// --- NUEVO: Helper de Colores del Tema ---
// Esto asegura que los colores cambien según si estás en modo Dark (Verde) o Light (Rosa)
const getColorForEvent = (description: string) => {
  const desc = description.toLowerCase();
  
  // Deudas urgentes o Tarjetas -> Error (Suele ser Rojo/Naranja)
  if (desc.includes('tc') || desc.includes('tarjeta') || desc.includes('préstamo')) {
    return 'bg-error/10 text-error';
  }
  
  // Prioridades (Casa/Renta) -> Primary (El color principal de tu tema: Rosa o Verde)
  if (desc.includes('renta') || desc.includes('casa')) {
    return 'bg-primary/10 text-primary';
  }

  // Ahorros -> Success (Verde/Teal)
  if (desc.includes('tanda') || desc.includes('ahorro')) {
    return 'bg-success/10 text-success';
  }

  // Otros -> Secondary (El color secundario: Cian o Violeta)
  return 'bg-secondary/10 text-secondary';
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
      const balanceResponse = await apiClient.get('/api/transactions/balance');
      setBalance(balanceResponse.data.current_balance);
      
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

      const transactionsResponse = await apiClient.get('/api/transactions');
      const allTransactions: Transaction[] = transactionsResponse.data;
      const monthlyTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentDate.getMonth() &&
               txDate.getFullYear() === currentDate.getFullYear();
      });
      setRecentTransactions(monthlyTransactions);

    } catch (err: any) {
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
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
  };

  if (isLoading && !balance) {
    return <div className="min-h-screen flex items-center justify-center bg-base-200"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
        <div className="alert alert-error shadow-lg max-w-sm"><span>{error}</span></div>
        <button className="btn btn-outline mt-4" onClick={fetchData}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pb-24 font-sans">
      
      {/* HEADER STICKY & MEDIA LUNA */}
      <div className="sticky top-0 z-30 bg-base-200">
        <div className="bg-gradient-to-b from-primary to-primary-focus pt-safe pb-10 px-6 rounded-b-[4rem] shadow-xl relative overflow-hidden">
           
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

           <div className="text-center text-primary-content relative z-10 mt-8">
              <h2 className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Saldo Total</h2>
              <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">
                {balance !== null ? formatCurrency(balance) : '$0.00'}
              </h1>
           </div>
        </div>
      </div>

      <div className="px-4 space-y-6 relative mt-8">

        {/* 2. Tarjeta: Próximos Pagos */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-3">
            <h3 className="card-title text-sm uppercase text-base-content/60 font-bold mb-2">
              📅 Próximos Pagos
            </h3>
            
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-base-content/50 italic text-center py-4">Todo pagado por este mes 🎉</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 rounded-xl hover:bg-base-200/50 transition-colors">
                    
                    {/* --- AQUI ESTA EL CAMBIO --- */}
                    {/* Usamos getColorForEvent para decidir el color basado en el tema */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColorForEvent(event.description)}`}>
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
          <div className="card-body p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="card-title text-sm uppercase text-base-content/60 font-bold">
                💸 Movimientos del Mes
              </h3>
              <span className="badge badge-sm badge-ghost">{recentTransactions.length}</span>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-sm text-base-content/50 italic text-center py-4">Sin movimientos aún</p>
            ) : (
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

        {/* 4. Tarjeta: Gráfico */}
        <div className="card bg-base-100 shadow-xl border border-base-200 mb-6">
          <div className="card-body p-3">
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