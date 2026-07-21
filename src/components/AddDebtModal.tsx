import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { HiXMark, HiReceiptPercent } from 'react-icons/hi2';

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddDebtModal: React.FC<AddDebtModalProps> = ({ isOpen, onClose }) => {
  // Estados del formulario
  const [debtName, setDebtName] = useState('');
  const [originalAmount, setOriginalAmount] = useState<number | string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<number | string>('');
  const [termMonths, setTermMonths] = useState<number | string>('');
  const [frequency, setFrequency] = useState('monthly');
  const [firstDate, setFirstDate] = useState('');

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRefresh = useDataStore((state) => state.triggerRefresh);

  useEffect(() => {
    if (isOpen) {
      setDebtName('');
      setOriginalAmount('');
      setMonthlyPayment('');
      setTermMonths('');
      setFrequency('monthly');
      setFirstDate('');
      setError(null);
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!debtName.trim() || !originalAmount || !monthlyPayment || !termMonths || !firstDate) {
      setError("Por favor completa todos los campos.");
      return;
    }
    
    if (Number(originalAmount) <= 0 || Number(monthlyPayment) <= 0 || Number(termMonths) <= 0) {
      setError("Los valores numéricos deben ser positivos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/api/debts/new', {
        debt_name: debtName,
        original_amount: Number(originalAmount),
        monthly_payment_amount: Number(monthlyPayment),
        term_months: Number(termMonths),
        frequency: frequency,
        first_payment_date: firstDate
      });
      
      triggerRefresh(); 
      onClose();
      
    } catch (err: any) {
      console.error("Error al guardar la deuda", err);
      setError(err.response?.data?.error || "Error al guardar el préstamo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-base-100 w-full sm:w-96 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative pb-safe animate-slide-up sm:animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-base-200 px-5 py-4 flex justify-between items-center border-b border-base-300 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <HiReceiptPercent className="w-5 h-5 text-error" />
            Nuevo Préstamo
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario Scrollable */}
        <div className="overflow-y-auto p-5">
          <form onSubmit={handleSave} className="space-y-4">
            
            {error && (
              <div className="alert alert-error text-sm py-2 rounded-lg text-white font-bold">
                <span>{error}</span>
              </div>
            )}

            {/* Nombre */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Nombre del préstamo</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full focus:input-error rounded-xl font-bold"
                value={debtName}
                onChange={(e) => setDebtName(e.target.value)}
                placeholder="Ej. Crédito Automotriz"
                autoFocus
              />
            </div>

            {/* Monto Original (Gigante) */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Monto Total a Pagar</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 font-bold">$</span>
                <input 
                  type="number" 
                  className="input input-bordered w-full focus:input-error pl-8 text-xl font-black rounded-xl"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>
            </div>

            {/* Fila Doble: Pago y Plazo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Pago Fijo</span></label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 font-bold text-xs">$</span>
                    <input 
                    type="number" 
                    className="input input-bordered w-full focus:input-error pl-6 font-bold rounded-xl"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                    />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Plazo (Meses)</span></label>
                <input 
                  type="number" 
                  className="input input-bordered w-full focus:input-error text-center font-bold rounded-xl"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  placeholder="Ej. 12"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Frecuencia y Fecha */}
            <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">Frecuencia</span></label>
                    <select 
                        className="select select-bordered w-full focus:select-error rounded-xl text-sm"
                        value={frequency} 
                        onChange={(e) => setFrequency(e.target.value)}
                    >
                        <option value="monthly">Mensual</option>
                        <option value="bi-weekly">Quincenal</option>
                        <option value="weekly">Semanal</option>
                        <option value="yearly">Anual</option>
                        <option value="once">Una vez</option>
                    </select>
                </div>

                <div className="form-control">
                    <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-70">1er Pago</span></label>
                    <input 
                        type="date" 
                        className="input input-bordered w-full focus:input-error rounded-xl text-sm font-bold"
                        value={firstDate}
                        onChange={(e) => setFirstDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Botón Guardar */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="btn btn-error w-full text-lg shadow-lg shadow-error/20 rounded-xl text-white border-none"
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner"></span> : 'Guardar Préstamo'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDebtModal;