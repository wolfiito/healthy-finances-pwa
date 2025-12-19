import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { HiXMark } from 'react-icons/hi2';

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddRuleModal: React.FC<AddRuleModalProps> = ({ isOpen, onClose }) => {
  // Estados
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [frequency, setFrequency] = useState('monthly');
  const [firstDate, setFirstDate] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRefresh = useDataStore((state) => state.triggerRefresh);

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setAmount('');
      setType('expense');
      setFrequency('monthly');
      setFirstDate('');
      setError(null);
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !firstDate) {
      setError("Completa todos los campos.");
      return;
    }
    if (Number(amount) <= 0) {
      setError("Monto debe ser positivo.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/api/rules/new', {
        description,
        amount: Number(amount),
        type,
        frequency,
        first_execution_date: firstDate
      });

      triggerRefresh();
      onClose();
    } catch (err: any) {
      setError("Error al guardar la regla.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-base-200 px-5 py-4 flex justify-between items-center border-b border-base-300">
          <h3 className="font-bold text-lg">Nueva Regla</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && <div className="alert alert-error text-sm py-2">{error}</div>}

          {/* Tipo */}
          <div className="join w-full grid grid-cols-2">
            <input 
              className="join-item btn btn-sm" 
              type="radio" 
              name="ruleType" 
              aria-label="Gasto Fijo" 
              checked={type === 'expense'}
              onChange={() => setType('expense')}
            />
            <input 
              className="join-item btn btn-sm" 
              type="radio" 
              name="ruleType" 
              aria-label="Ingreso Fijo"
              checked={type === 'income'}
              onChange={() => setType('income')}
            />
          </div>

          <div className="form-control">
            <label className="label py-1"><span className="label-text">Descripción</span></label>
            <input 
              type="text" 
              className="input input-bordered w-full focus:input-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Renta, Netflix..."
            />
          </div>

          <div className="form-control">
             <label className="label py-1"><span className="label-text">Monto</span></label>
             <input 
               type="number" 
               className="input input-bordered w-full focus:input-primary"
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               placeholder="0.00"
               inputMode="decimal"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="form-control">
               <label className="label py-1"><span className="label-text">Frecuencia</span></label>
               <select 
                 className="select select-bordered w-full"
                 value={frequency}
                 onChange={(e) => setFrequency(e.target.value)}
               >
                 <option value="monthly">Mensual</option>
                 <option value="bi_weekly">Quincenal</option>
                 <option value="weekly">Semanal</option>
                 <option value="daily">Diario</option>
                 <option value="yearly">Anual</option>
                 <option value="once">Una vez</option>
               </select>
             </div>
             
             <div className="form-control">
               <label className="label py-1"><span className="label-text">Inicio</span></label>
               <input 
                 type="date" 
                 className="input input-bordered w-full"
                 value={firstDate}
                 onChange={(e) => setFirstDate(e.target.value)}
               />
             </div>
          </div>

          <div className="pt-4">
             <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
               {isLoading ? <span className="loading loading-spinner"></span> : 'Guardar Regla'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRuleModal;