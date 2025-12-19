import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { HiXMark, HiCalendarDays, HiArrowPath } from 'react-icons/hi2';

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddRuleModal: React.FC<AddRuleModalProps> = ({ isOpen, onClose }) => {
  // --- TUS ESTADOS (Lógica Original) ---
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
    
    // Validaciones
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
      // TU ENDPOINT ORIGINAL
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
      console.error(err);
      setError("Error al guardar la regla.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop con Blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal con Diseño Moderno (Rounded, Safe Area, Animación) */}
      <div className="bg-base-100 w-full sm:w-96 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative pb-safe animate-slide-up sm:animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-base-200 px-5 py-4 flex justify-between items-center border-b border-base-300 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <HiArrowPath className="w-5 h-5 text-secondary" />
            Nueva Regla Fija
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario con Scroll */}
        <div className="overflow-y-auto p-5">
          <form onSubmit={handleSave} className="space-y-4">
            
            {error && (
              <div className="alert alert-error text-sm py-2 rounded-lg text-white font-bold">
                <span>{error}</span>
              </div>
            )}

            {/* Selector Tipo (Segmented Control) */}
            <div className="grid grid-cols-2 gap-2 bg-base-200 p-1 rounded-xl">
              <button
                type="button"
                className={`btn btn-sm border-none ${type === 'expense' ? 'bg-base-100 text-error shadow-sm' : 'bg-transparent text-base-content/60'}`}
                onClick={() => setType('expense')}
              >
                Gasto Fijo
              </button>
              <button
                type="button"
                className={`btn btn-sm border-none ${type === 'income' ? 'bg-base-100 text-success shadow-sm' : 'bg-transparent text-base-content/60'}`}
                onClick={() => setType('income')}
              >
                Ingreso Fijo
              </button>
            </div>

            {/* Descripción */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Descripción</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full focus:input-secondary rounded-xl font-bold"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Renta, Netflix, Gimnasio"
              />
            </div>

            {/* Monto (Estilo Grande) */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Monto</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 font-bold">$</span>
                <input 
                  type="number" 
                  className="input input-bordered w-full focus:input-secondary pl-8 text-xl font-black rounded-xl"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>
            </div>

            {/* Frecuencia y Fecha (Grid) */}
            <div className="grid grid-cols-2 gap-4">
               <div className="form-control">
                 <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Frecuencia</span></label>
                 <select 
                   className="select select-bordered w-full focus:select-secondary rounded-xl text-sm"
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
                 <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Primer Cobro</span></label>
                 <input 
                   type="date" 
                   className="input input-bordered w-full focus:input-secondary rounded-xl text-sm font-bold"
                   value={firstDate}
                   onChange={(e) => setFirstDate(e.target.value)}
                 />
               </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className={`btn w-full text-lg shadow-lg border-none rounded-xl text-white ${type === 'expense' ? 'btn-secondary' : 'btn-success'}`}
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner"></span> : 'Guardar Regla'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRuleModal;