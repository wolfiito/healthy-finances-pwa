import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { getAccountsSummary } from '../services/api';
import apiClient from '../services/api';
import { HiXMark } from 'react-icons/hi2';

interface Account {
  account_id: number;
  account_name: string;
  account_type: string; // Nota: La API devuelve 'account_type' (snake_case)
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GASTO_CATEGORIES = [
  "Comida", "Super", "Uber", "Disposición Efectivo", 
  "Transporte", "Oxxo", "Tecnologia", "Otros"
];

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del Formulario
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [accountId, setAccountId] = useState<number | string>(''); // string para manejar el select vacio
  const [category, setCategory] = useState<string>('');
  const [showInstallments, setShowInstallments] = useState(false);
  const [installments, setInstallments] = useState<number | string>('');

  const triggerRefresh = useDataStore((state) => state.triggerRefresh);

  const resetForm = () => {
    setType('expense');
    setDescription('');
    setAmount('');
    setAccountId('');
    setCategory('');
    setShowInstallments(false);
    setInstallments('');
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      const fetchAccounts = async () => {
        try {
          const response = await getAccountsSummary();
          setAccounts(response.data);
        } catch (error) {
          console.error("Error al cargar cuentas", error);
          setError("No se pudieron cargar las cuentas.");
        }
      };
      fetchAccounts();
    }
  }, [isOpen]);

  // Buscar la cuenta seleccionada para validar si es tarjeta de crédito
  const selectedAccount = accounts.find(a => a.account_id === Number(accountId));
  const isCreditCard = selectedAccount?.account_type?.toUpperCase() === 'CREDIT_CARD';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!description.trim()) return setError('La Descripción es requerida.');
    if (!amount || Number(amount) <= 0) return setError('Monto inválido.');
    if (!accountId) return setError('Selecciona una cuenta.');
    if (type === 'expense' && !category) return setError('Selecciona una categoría.');
    if (showInstallments && (!installments || Number(installments) <= 1)) return setError('Meses inválidos.');

    setError(null);
    setIsLoading(true);

    const payload: any = {
      description,
      amount: Number(amount),
      type: type, 
      account_id: Number(accountId),
    };

    if (type === 'expense') {
      payload.category = category;
    }
    
    if (showInstallments && isCreditCard) {
      payload.installments = Number(installments);
    }

    try {
      await apiClient.post('/api/transactions/new', payload);
      triggerRefresh();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-base-200 px-5 py-4 flex justify-between items-center border-b border-base-300 shrink-0">
          <h3 className="font-bold text-lg">Nueva Transacción</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario (Scrollable) */}
        <div className="overflow-y-auto p-5">
          <form onSubmit={handleSave} className="space-y-4">
            
            {error && (
              <div className="alert alert-error text-sm py-2 rounded-lg">
                <span>{error}</span>
              </div>
            )}

            {/* Tipo (Segmented Control) */}
            <div className="join w-full grid grid-cols-2">
              <input 
                className="join-item btn" 
                type="radio" 
                name="type" 
                aria-label="Gasto"
                checked={type === 'expense'}
                onChange={() => setType('expense')}
              />
              <input 
                className="join-item btn" 
                type="radio" 
                name="type" 
                aria-label="Ingreso" 
                checked={type === 'income'}
                onChange={() => setType('income')}
              />
            </div>

            {/* Descripción */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text">Descripción</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full focus:input-primary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Supermercado"
              />
            </div>

            {/* Monto */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text">Monto</span></label>
              <input 
                type="number" 
                className="input input-bordered w-full focus:input-primary font-mono"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            {/* Cuenta */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text">Cuenta</span></label>
              <select 
                className="select select-bordered w-full focus:select-primary"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="" disabled>Selecciona una cuenta</option>
                {accounts.map(acc => (
                  <option key={acc.account_id} value={acc.account_id}>
                    {acc.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría (Solo Gastos) */}
            {type === 'expense' && (
              <div className="form-control animate-fade-in">
                <label className="label py-1"><span className="label-text">Categoría</span></label>
                <select 
                  className="select select-bordered w-full focus:select-primary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>Selecciona categoría</option>
                  {GASTO_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Meses Sin Intereses (Solo TC y Gastos) */}
            {type === 'expense' && isCreditCard && (
              <div className="form-control bg-base-200/50 p-3 rounded-lg animate-fade-in mt-2">
                <label className="label cursor-pointer justify-start gap-4">
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={showInstallments} 
                    onChange={(e) => setShowInstallments(e.target.checked)}
                  />
                  <span className="label-text font-medium">¿Es a meses sin intereses?</span>
                </label>

                {showInstallments && (
                  <div className="mt-2 animate-fade-in">
                    <label className="label py-1"><span className="label-text text-xs">Número de mensualidades</span></label>
                    <input 
                      type="number" 
                      className="input input-bordered input-sm w-full"
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      placeholder="Ej. 12"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit" 
                className="btn btn-primary w-full text-lg shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner"></span> : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;