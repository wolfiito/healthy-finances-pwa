import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
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

// Helper Colores (Rainbow Theme)
const getColorForEvent = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('tc') || desc.includes('tarjeta') || desc.includes('préstamo')) {
    return 'bg-error/10 text-error';
  }
  if (desc.includes('renta') || desc.includes('casa')) {
    return 'bg-primary/10 text-primary';
  }
  if (desc.includes('tanda') || desc.includes('ahorro')) {
    return 'bg-success/10 text-success';
  }
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
      // Asumimos que la API ya los trae ordenados por fecha, si no, habría que hacer un .sort()
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

  const monthlyExpenses = upcomingEvents.reduce((total, event) => total + Math.abs(Number(event.amount)), 0);

  return (
    <div className="min-h-screen bg-[#fff7fa] px-4 pb-28 pt-6 text-[#392735]">
      <header className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#301d2a] text-lg font-bold text-white">F</div>
        <div><p className="m-0 font-bold">Tus finanzas</p><p className="m-0 text-xs text-[#9a7184]">Todo claro, a tu manera</p></div>
      </header>

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#ef759c] via-[#c94078] to-[#9d245a] px-6 py-6 text-white shadow-[0_16px_32px_rgba(189,66,113,.34)]">
        <div className="absolute -right-5 -top-11 text-[10rem] leading-none text-white/10">◌</div>
        <p className="relative m-0 text-sm text-[#ffe4ed]">Saldo disponible</p>
        <h1 className="relative my-2 text-4xl font-black tracking-tight">{balance !== null ? formatCurrency(balance) : '$0.00'}</h1>
        <p className="relative m-0 text-xs text-[#ffe4ed]">En efectivo y débito</p>
        <div className="relative mt-5 flex justify-between border-t border-white/25 pt-3 text-xs text-[#ffe4ed]"><span>Actualizado ahora</span><span>•••</span></div>
      </section>

      <section className="my-4 grid grid-cols-2 gap-3">
        <article className="min-h-32 rounded-[20px] border border-[#f8e4eb] bg-white p-4 shadow-[0_8px_23px_rgba(158,60,99,.06)]"><span className="text-xs text-[#a37c8e]">Gastos próximos</span><strong className="my-3 block text-xl">{formatCurrency(monthlyExpenses)}</strong><span className="text-xs font-bold text-[#ca3d72]">Ver agenda →</span></article>
        <article className="min-h-32 rounded-[20px] bg-[#2e1e2a] p-4 text-white shadow-[0_8px_23px_rgba(46,30,42,.16)]"><span className="text-xs text-[#e0c4d2]">Pagos del mes</span><strong className="my-3 block text-xl">{upcomingEvents.length}</strong><span className="text-xs font-bold text-[#ffafc9]">Ver pagos →</span></article>
      </section>

      <section className="mb-4 rounded-[22px] border border-[#f6e2ea] bg-white p-5 shadow-[0_8px_25px_rgba(157,59,97,.05)]"><h2 className="mb-3 text-base font-bold">Actividad reciente</h2>{recentTransactions.length === 0 ? <p className="m-0 text-sm text-[#a17b8d]">Aún no hay información por aquí.</p> : <div className="space-y-3">{recentTransactions.slice(0, 3).map(tx => { const expense = Number(tx.amount) < 0; return <div key={tx.id} className="flex items-center gap-3"><div className={`grid h-9 w-9 place-items-center rounded-xl ${expense ? 'bg-[#fff0f4] text-[#db4c7e]' : 'bg-[#ebf8f1] text-[#309674]'}`}>{expense ? <HiArrowTrendingDown className="h-5 w-5"/> : <HiArrowTrendingUp className="h-5 w-5"/>}</div><div className="min-w-0 flex-1"><p className="m-0 truncate text-sm font-bold">{tx.description}</p><p className="m-0 text-xs text-[#a17b8d]">{new Date(tx.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p></div><span className={`text-sm font-bold ${expense ? 'text-[#cb416f]' : 'text-[#309674]'}`}>{expense ? '' : '+'}{formatCurrency(tx.amount)}</span></div>})}</div>}</section>

      <section className="rounded-[22px] border border-[#f6e2ea] bg-white p-5 shadow-[0_8px_25px_rgba(157,59,97,.05)]"><h2 className="mb-3 text-base font-bold">Próximos pagos</h2>{upcomingEvents.length === 0 ? <p className="m-0 text-sm text-[#a17b8d]">Aún no hay información por aquí.</p> : <div className="space-y-3">{upcomingEvents.slice(0, 3).map((event, index) => <div key={index} className="flex items-center gap-3"><div className={`grid h-9 w-9 place-items-center rounded-xl ${getColorForEvent(event.description)}`}>{getIconForEvent(event.description)}</div><div className="min-w-0 flex-1"><p className="m-0 truncate text-sm font-bold">{event.description}</p><p className="m-0 text-xs text-[#a17b8d]">{new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p></div><span className="text-sm font-bold text-[#cb416f]">{formatCurrency(event.amount)}</span></div>)}</div>}</section>
    </div>
  );
};

export default TabDashboard;
