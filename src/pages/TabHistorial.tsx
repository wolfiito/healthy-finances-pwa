import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { 
  HiChevronLeft, 
  HiChevronRight, 
  HiArrowTrendingUp, 
  HiArrowTrendingDown,
  HiArrowLeft
} from 'react-icons/hi2';

interface Transaction {
  id: number;
  description: string;
  amount: string;
  date: string;
  category: string;
}

const TabHistorial: React.FC = () => {
  const history = useHistory();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Fecha seleccionada (Mes/Año)
  const [isLoading, setIsLoading] = useState(true);
  const { refreshKey } = useDataStore();

  // Cargar TODAS las transacciones
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/api/transactions');
        // Aseguramos que vengan ordenadas por fecha (más reciente primero)
        const sorted = response.data.sort((a: Transaction, b: Transaction) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sorted);
      } catch (error) {
        console.error("Error cargando historial", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [refreshKey]);

  // --- LÓGICA DE FILTRADO ---
  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === selectedDate.getMonth() &&
           txDate.getFullYear() === selectedDate.getFullYear();
  });

  // Calcular Totales del Mes
  const totalIncome = filteredTransactions
    .filter(t => parseFloat(t.amount) > 0)
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => parseFloat(t.amount) < 0)
    .reduce((acc, curr) => acc + Math.abs(parseFloat(curr.amount)), 0);

  // --- NAVEGACIÓN DE MESES ---
  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <div className="min-h-screen bg-base-200 pb-32 font-sans">
      
      {/* 1. Header Sticky con Navegación de Meses */}
      <div className="sticky top-0 z-30 bg-base-100 shadow-sm border-b border-base-200 pt-safe">
        
        {/* Barra Superior */}
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => history.goBack()} className="btn btn-ghost btn-circle btn-sm">
            <HiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-black uppercase tracking-wide">Historial</h1>
          <div className="w-8"></div> {/* Espaciador para centrar título */}
        </div>

        {/* Selector de Mes */}
        <div className="flex items-center justify-between px-6 pb-4">
          <button onClick={() => changeMonth(-1)} className="btn btn-circle btn-ghost btn-sm">
            <HiChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-xl font-bold capitalize animate-fade-in">
            {formatMonthYear(selectedDate)}
          </div>

          <button onClick={() => changeMonth(1)} className="btn btn-circle btn-ghost btn-sm">
            <HiChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 2. Resumen del Mes */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span className="text-xs font-bold opacity-60 uppercase">Ingresos</span>
          </div>
          <span className="text-lg font-black text-success">{formatCurrency(totalIncome)}</span>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-error"></div>
            <span className="text-xs font-bold opacity-60 uppercase">Gastos</span>
          </div>
          <span className="text-lg font-black text-error">{formatCurrency(totalExpense)}</span>
        </div>
      </div>

      {/* 3. Lista de Movimientos */}
      <div className="px-4 mt-6 space-y-3">
        <h3 className="text-sm font-bold opacity-50 uppercase ml-1">Movimientos</h3>

        {isLoading ? (
          <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
             <div className="text-4xl mb-2">🤷‍♂️</div>
             <p>No hubo movimientos en este mes</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isNegative = parseFloat(tx.amount) < 0;
            return (
              <div key={tx.id} className="card bg-base-100 shadow-sm border border-base-200 p-3 flex-row items-center gap-4 animate-slide-up">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isNegative ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                   {isNegative ? <HiArrowTrendingDown className="w-5 h-5"/> : <HiArrowTrendingUp className="w-5 h-5"/>}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{tx.description}</h4>
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <span>{new Date(tx.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                    <span>•</span>
                    <span className="bg-base-200 px-1.5 py-0.5 rounded text-[10px]">{tx.category || 'General'}</span>
                  </div>
                </div>

                <div className={`font-black text-sm ${isNegative ? 'text-base-content' : 'text-success'}`}>
                   {isNegative ? '' : '+'}{formatCurrency(parseFloat(tx.amount))}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default TabHistorial;