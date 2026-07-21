import React from 'react';
import { useHistory } from 'react-router-dom';
import { 
  HiCreditCard, 
  HiClipboardDocumentList, 
  HiArrowTrendingDown, 
  HiChevronRight
} from 'react-icons/hi2';

const TabMore: React.FC = () => {
  const history = useHistory();

  const menuItems = [
    { 
      title: 'Mis Cuentas', 
      desc: 'Gestiona tarjetas y efectivo', 
      icon: <HiCreditCard className="w-6 h-6 text-primary" />, 
      path: '/app/cuentas',
      color: 'bg-primary/10'
    },
    { 
      title: 'Reglas Fijas', 
      desc: 'Pagos recurrentes y fijos', 
      icon: <HiClipboardDocumentList className="w-6 h-6 text-secondary" />, 
      path: '/app/reglas',
      color: 'bg-secondary/10'
    },
    { 
      title: 'Historial de Gastos', 
      desc: 'Ver todos los movimientos', 
      icon: <HiArrowTrendingDown className="w-6 h-6 text-error" />, 
      path: '/app/historial', 
      color: 'bg-error/10'
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 pb-32 pt-safe px-4 animate-fade-in">
      <h1 className="text-2xl font-black text-base-content mt-6 mb-2">Menú Principal</h1>
      <p className="text-sm text-base-content/60 mb-6">¿Qué quieres hacer hoy?</p>

      <div className="grid gap-4">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            onClick={() => history.push(item.path)}
            className="card bg-base-100 shadow-sm border border-base-200 hover:bg-base-50 transition-all active:scale-98 cursor-pointer"
          >
            <div className="card-body p-4 flex-row items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">{item.title}</h3>
                <p className="text-xs text-base-content/50 truncate">{item.desc}</p>
              </div>
              <HiChevronRight className="w-5 h-5 text-base-content/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabMore;