import React, { useState, useEffect } from 'react';
import { getRules, deleteRule } from '../services/api';
import AddRuleModal from '../components/AddRuleModal';
import { 
  HiTrash, 
  HiPlus, 
  HiArrowPath 
} from 'react-icons/hi2';

interface Rule {
  id: number;
  description: string;
  amount: string;
  frequency: string;
  type: string;
  next_execution_date: string;
  account_id: number | null;
  debt_id: number | null;
}

const TabReglasFijas: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para eliminar
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  // Modal Agregar
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRules();
      setRules(response.data);
    } catch (err: any) {
      setError("No se pudieron cargar las reglas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para eliminar directamente (con confirmación simple del navegador o directa)
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta regla?")) return;

    setIsDeleting(id);
    try {
      await deleteRule(id);
      setRules(rules.filter((rule) => rule.id !== id));
    } catch (err) {
      alert("Error al eliminar la regla");
    } finally {
      setIsDeleting(null);
    }
  };

  // Helper para traducir frecuencia
  const getFrequencyLabel = (freq: string) => {
    const map: Record<string, string> = {
      'monthly': 'Mensual',
      'bi_weekly': 'Quincenal',
      'weekly': 'Semanal',
      'daily': 'Diario',
      'yearly': 'Anual',
      'once': 'Única vez'
    };
    return map[freq] || freq;
  };

  return (
    <div className="min-h-screen bg-base-200 pb-24 font-sans relative">
      
      {/* 1. Header */}
      <div className="bg-base-100 pt-10 pb-6 px-6 shadow-sm border-b border-base-300">
        <div className="flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-black text-base-content tracking-tight">Reglas Fijas</h1>
             <p className="text-sm text-base-content/60">Pagos y cobros recurrentes</p>
          </div>
          <button onClick={fetchData} className="btn btn-ghost btn-circle">
             <HiArrowPath className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 2. Contenido */}
      <div className="p-4 space-y-3">
        
        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {!loading && rules.length === 0 && (
          <div className="text-center py-12 opacity-50">
             <p>No tienes reglas fijas configuradas.</p>
          </div>
        )}

        {!loading && rules.map((rule) => (
          <div key={rule.id} className="card bg-base-100 shadow-sm border border-base-200 transition-all hover:shadow-md">
            <div className="card-body p-4 flex-row items-center gap-4">
               
               {/* Icono Fecha */}
               <div className="flex flex-col items-center justify-center bg-base-200 rounded-xl w-14 h-14 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-base-content/50">Próx</span>
                  <span className="text-lg font-black text-primary">
                    {new Date(rule.next_execution_date).getDate()}
                  </span>
               </div>

               {/* Info */}
               <div className="flex-1 min-w-0">
                 <h3 className="font-bold text-base truncate">{rule.description}</h3>
                 <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <span className="badge badge-sm badge-ghost">{getFrequencyLabel(rule.frequency)}</span>
                    <span>${rule.amount}</span>
                 </div>
               </div>

               {/* Botón Eliminar */}
               <button 
                 onClick={() => handleDelete(rule.id)}
                 className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10"
                 disabled={isDeleting === rule.id}
               >
                 {isDeleting === rule.id ? <span className="loading loading-spinner loading-xs"></span> : <HiTrash className="w-5 h-5" />}
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. FAB para Agregar */}
      <div className="fixed bottom-24 right-4 z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-circle btn-primary btn-lg shadow-xl shadow-primary/40 hover:scale-110 transition-transform"
        >
          <HiPlus className="w-8 h-8" />
        </button>
      </div>

      {/* 4. Modal */}
      <AddRuleModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchData(); // Recargar al cerrar si se guardó algo
        }} 
      />

    </div>
  );
};

export default TabReglasFijas;