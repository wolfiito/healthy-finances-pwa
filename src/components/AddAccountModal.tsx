import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { HiXMark } from 'react-icons/hi2';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del Formulario
  const [name, setName] = useState('');
  const [closingDate, setClosingDate] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');

  const triggerRefresh = useDataStore((state) => state.triggerRefresh);

  // Limpiar al abrir
  useEffect(() => {
    if (isOpen) {
      setName('');
      setClosingDate('');
      setPaymentDate('');
      setError(null);
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Evitar recarga
    setError(null);
    
    // Validaciones
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    const closingDay = Number(closingDate);
    const paymentDay = Number(paymentDate);

    if (!closingDay || closingDay < 1 || closingDay > 31) {
      setError('Día de corte inválido (1-31).');
      return;
    }
    if (!paymentDay || paymentDay < 1 || paymentDay > 31) {
      setError('Día de pago inválido (1-31).');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/api/accounts/new', {
        name: name,
        type: 'credit_card', // Por ahora fijo a Tarjeta de Crédito según tu lógica anterior
        closing_date: closingDay,
        payment_date: paymentDay,
      });

      triggerRefresh(); // Actualizar listas
      onClose();        // Cerrar modal

    } catch (err: any) {
      setError(err.response?.data?.error || "Error al guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si no está abierto, no renderizamos nada (para evitar superposiciones)
  if (!isOpen) return null;

  return (
    // Fondo oscuro con backdrop-blur
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* Caja del Modal */}
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header del Modal */}
        <div className="bg-base-200 px-6 py-4 flex justify-between items-center border-b border-base-300">
          <h3 className="font-bold text-lg">Nueva Tarjeta</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {error && (
            <div className="alert alert-error text-sm py-2 rounded-lg">
              <span>{error}</span>
            </div>
          )}

          {/* Nombre */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Nombre de la Tarjeta</span>
            </label>
            <input 
              type="text" 
              placeholder="Ej. Banamex Oro" 
              className="input input-bordered w-full focus:input-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Día de Corte */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Día de Corte</span>
              </label>
              <input 
                type="number" 
                placeholder="Ej. 25" 
                className="input input-bordered w-full focus:input-primary"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                min="1" max="31"
              />
            </div>

            {/* Día de Pago */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Día de Pago</span>
              </label>
              <input 
                type="number" 
                placeholder="Ej. 15" 
                className="input input-bordered w-full focus:input-primary"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                min="1" max="31"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="btn btn-primary w-full text-lg shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Guardar Tarjeta'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;