import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { HiXMark } from 'react-icons/hi2';

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void; // Cambiamos onDidDismiss por onClose para consistencia
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

  // Limpiar formulario al abrir
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

    // Validaciones
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
      // Llamada a la API
      await apiClient.post('/api/debts/new', {
        debt_name: debtName,
        original_amount: Number(originalAmount),
        monthly_payment_amount: Number(monthlyPayment),
        term_months: Number(termMonths),
        frequency: frequency,
        first_payment_date: firstDate // El input type="date" ya devuelve YYYY-MM-DD
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

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-base-200 px-5 py-4 flex justify-between items-center border-b border-base-300 shrink-0">
          <h3 className="font-bold text-lg">Nuevo Préstamo</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario con Scroll */}
        <div className="overflow-y-auto p-5">
          <form onSubmit={handleSave} className="space-y-4">
            
            {error && (
              <div className="alert alert-error text-sm py-2 rounded-lg">
                <span>{error}</span>
              </div>
            )}

            {/* Nombre */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text">Nombre del préstamo</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full focus:input-primary"
                value={debtName}
                onChange={(e) => setDebtName(e.target.value)}
                placeholder="Ej. Crédito Automotriz"
              />
            </div>

            {/* Monto Original */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text">Monto Total Original</span></label>
              <input 
                type="number" 
                className="input input-bordered w-full focus:input-primary"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            {/* Fila Doble: Pago y Plazo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text">Pago Fijo</span></label>
                <input 
                  type="number" 
                  className="input input-bordered w-full focus:input-primary"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text">Plazo (Meses)</span></label>
                <input 
                  type="number" 
                  className="input input-bordered w-full focus:input-primary"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  placeholder="Ej. 12"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Frecuencia */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text">Frecuencia de Pago</span></label>
              <select 
                className="select select-bordered w-full focus:select-primary"
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

            {/* Fecha Inicio */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text">Fecha del primer pago</span></label>
              <input 
                type="date" 
                className="input input-bordered w-full focus:input-primary"
                value={firstDate}
                onChange={(e) => setFirstDate(e.target.value)}
              />
            </div>

            {/* Botón Guardar */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="btn btn-primary w-full text-lg shadow-lg shadow-primary/20"
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