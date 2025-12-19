import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import AddAccountModal from '../components/AddAccountModal';

// Iconos
import { 
  HiCreditCard, 
  HiBanknotes, 
  HiPlus, 
  HiChevronRight,
  HiWallet
} from 'react-icons/hi2';

interface Account {
  account_id: number;
  account_name: string;
  account_type: string;
  current_balance: string;
}

const TabCuentas: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { refreshKey } = useDataStore();

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/api/accounts/summary');
      setAccounts(response.data);
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron cargar tus cuentas.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAccounts();
  }, [refreshKey]);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(value));
  };

  // Helper para icono según tipo
  const getIcon = (type: string) => {
    if (type === 'credit_card') return <HiCreditCard className="w-6 h-6" />;
    return <HiBanknotes className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-base-200 pb-24 font-sans relative">
      
      {/* 1. Encabezado */}
      {/* OUTER DIV: Fondo y Safe Area */}
      <div className="bg-base-100 pt-safe pb-6 px-6 shadow-sm border-b border-base-300">
        
        {/* INNER DIV: Agregamos 'mt-4' para separar el título del borde superior */}
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-2xl font-black text-base-content tracking-tight">Mis Cuentas</h1>
            <p className="text-sm text-base-content/60">Gestiona tus tarjetas y efectivo</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <HiWallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Contenido (Lista) */}
      <div className="p-4 space-y-4">
        
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

        {!isLoading && !error && accounts.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p>No tienes cuentas registradas.</p>
            <p className="text-sm">¡Agrega una para empezar!</p>
          </div>
        )}

        {!isLoading && !error && accounts.map((account) => {
          const balance = parseFloat(account.current_balance);
          const isNegative = balance < 0;

          return (
            <Link 
              to={`/accounts/${account.account_id}`} 
              key={account.account_id}
              className="card bg-base-100 shadow-md active:scale-[0.99] transition-transform duration-200 hover:shadow-lg border border-base-200 block"
            >
              <div className="card-body p-4 flex-row items-center gap-4">
                
                {/* Icono Tipo de Cuenta */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 
                  ${account.account_type === 'credit_card' ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success'}`}>
                  {getIcon(account.account_type)}
                </div>

                {/* Info Principal */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{account.account_name}</h3>
                  <p className="text-xs text-base-content/50 uppercase tracking-wide">
                    {account.account_type === 'credit_card' ? 'Tarjeta de Crédito' : 'Efectivo / Débito'}
                  </p>
                </div>

                {/* Saldo y Flecha */}
                <div className="text-right">
                  <div className={`font-black text-sm mb-1 ${isNegative ? 'text-error' : 'text-success'}`}>
                    {formatCurrency(account.current_balance)}
                  </div>
                  <HiChevronRight className="w-5 h-5 text-base-content/30 ml-auto" />
                </div>

              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Botón Flotante (FAB) para Agregar */}
      <div className="fixed bottom-24 right-4 z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-circle btn-primary btn-lg shadow-xl shadow-primary/40 hover:scale-110 transition-transform"
        >
          <HiPlus className="w-8 h-8" />
        </button>
      </div>

      {/* 4. Modal de Agregar Cuenta */}
      <AddAccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
};

export default TabCuentas;