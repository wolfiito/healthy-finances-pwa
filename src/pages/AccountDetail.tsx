import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { 
  HiArrowLeft, 
  HiCalendarDays, 
  HiArrowTrendingDown, 
  HiArrowTrendingUp 
} from 'react-icons/hi2';

interface Transaction {
  id: number;
  description: string;
  amount: string;
  date: string;
  category: string;
}

interface AccountDetailPageParams {
  id: string;
}

const AccountDetail: React.FC = () => {
  const { id } = useParams<AccountDetailPageParams>();
  const history = useHistory();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountName, setAccountName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { refreshKey } = useDataStore();

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get(`/api/accounts/${id}/transactions`);
        setAccountName(response.data.account_name);
        setTransactions(response.data.transactions);
      } catch (err: any) {
        setError(err.response?.data?.error || 'No se pudieron cargar los movimientos.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccountDetails();
  }, [id, refreshKey]);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(value));
  };

  return (
    <div className="min-h-screen bg-base-200 font-sans pb-6">
      
      {/* 1. Header con Botón Atrás */}
      <div className="bg-base-100 shadow-sm border-b border-base-300 sticky top-0 z-30">
        <div className="flex items-center gap-2 px-4 py-4">
          <button 
            onClick={() => history.goBack()} 
            className="btn btn-ghost btn-circle btn-sm"
          >
            <HiArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
             <h1 className="text-lg font-bold text-base-content truncate">
               {isLoading ? 'Cargando...' : accountName || 'Detalle de Cuenta'}
             </h1>
          </div>
        </div>
      </div>

      {/* 2. Contenido */}
      <div className="p-4 max-w-2xl mx-auto">

        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {error && (
          <div className="alert alert-error shadow-lg">
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <div className="text-center py-12 opacity-50 flex flex-col items-center">
            <HiCalendarDays className="w-12 h-12 mb-2" />
            <p>No hay movimientos en este periodo.</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex flex-col gap-3">
             {transactions.map((tx) => {
               const isNegative = parseFloat(tx.amount) < 0;
               return (
                 <div key={tx.id} className="card bg-base-100 shadow-sm border border-base-200 p-3 flex-row items-center gap-4">
                    
                    {/* Icono de tendencia */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                      ${isNegative ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                      {isNegative ? <HiArrowTrendingDown /> : <HiArrowTrendingUp />}
                    </div>

                    {/* Descripción y Fecha */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{tx.description}</h3>
                      <p className="text-xs text-base-content/60">
                        {new Date(tx.date).toLocaleDateString('es-MX', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Monto */}
                    <div className={`font-bold whitespace-nowrap ${isNegative ? 'text-base-content' : 'text-success'}`}>
                      {formatCurrency(tx.amount)}
                    </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetail;