import React, { useState } from 'react';
import { Switch, Route, Redirect, useLocation, Link, useHistory } from 'react-router-dom';

// Pantallas
import TabDashboard from './TabDashboard';
import TabCuentas from './TabCuentas';
import TabProyeccion from './TabProyeccion';
import TabReglasFijas from './TabReglasFijas';
import TabAjustes from './TabAjustes';
import TabMore from './TabMore';
import TabHistorial from './TabHistorial';

// Modales
import AddTransactionModal from '../components/AddTransactionModal';
import AddRuleModal from '../components/AddRuleModal';
import AddDebtModal from '../components/AddDebtModal';

// Iconos
import { 
  HiHome, 
  HiSquares2X2, 
  HiChartBar, 
  HiCog6Tooth,
  HiPlus,
  HiBanknotes,
  HiReceiptPercent,
  HiCreditCard,
  HiScale
} from 'react-icons/hi2';

const Tabs: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  
  // Estados
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const isActive = (path: string) => location.pathname.includes(path);

  const navBtnClass = (active: boolean) => `
    flex flex-col items-center justify-center w-full h-full pt-2 pb-1
    transition-all duration-200 active:scale-95
    ${active 
      ? 'text-primary' 
      : 'text-base-content/40 hover:text-base-content/70'
    }
  `;

  const handleMenuAction = (action: string) => {
    setIsMenuOpen(false);
    if (action === 'expense' || action === 'income') {
      setIsTxModalOpen(true); 
    } else if (action === 'rule') {
       setIsRuleModalOpen(true); 
    } else if (action === 'debt') {
       setIsDebtModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-base-200">
      
      {/* --- MODALES --- */}
      <AddTransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} />
      <AddRuleModal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} />
      <AddDebtModal isOpen={isDebtModalOpen} onClose={() => setIsDebtModalOpen(false)} />

      {/* --- MENÚ EXPANDIBLE (Overlay) --- */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* --- BOTONES DEL MENÚ EXPANDIBLE --- */}
      <div className={`fixed bottom-28 left-0 right-0 z-50 flex justify-center gap-5 transition-all duration-300 ${isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
         
         <button onClick={() => handleMenuAction('rule')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-secondary text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform">
               <HiScale className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md">Regla</span>
         </button>

         <button onClick={() => handleMenuAction('debt')} className="flex flex-col items-center gap-2 -mt-10">
            <div className="w-14 h-14 rounded-full bg-error text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform">
               <HiReceiptPercent className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md">Deuda</span>
         </button>

         <button onClick={() => handleMenuAction('income')} className="flex flex-col items-center gap-2 -mt-10">
            <div className="w-14 h-14 rounded-full bg-success text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform">
               <HiBanknotes className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md">Ingreso</span>
         </button>

         <button onClick={() => handleMenuAction('expense')} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform">
               <HiCreditCard className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md">Gasto</span>
         </button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="w-full pb-28"> 
        <Switch>
          <Route path="/app/dashboard" component={TabDashboard} />
          <Route path="/app/cuentas" component={TabCuentas} />
          <Route path="/app/proyeccion" component={TabProyeccion} />
          <Route path="/app/reglas" component={TabReglasFijas} />
          <Route path="/app/ajustes" component={TabAjustes} />
          <Route path="/app/ver-mas" component={TabMore} />
          <Route path="/app/historial" component={TabHistorial} />
          <Route exact path="/app">
            <Redirect to="/app/dashboard" />
          </Route>
        </Switch>
      </div>

      {/* --- BARRA DE NAVEGACIÓN "DOCKED" --- */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        {/* Fondo curvado */}
        <div className="absolute bottom-0 w-full h-24 bg-base-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe rounded-t-[2rem]"></div>

        <div className="relative flex justify-between items-end w-full h-24 pb-safe px-2">
          
          {/* IZQUIERDA */}
          <div className="flex w-2/5 justify-around h-full items-center pt-2">
            <Link to="/app/dashboard" className={navBtnClass(isActive('/dashboard'))}>
              {/* CAMBIO AQUÍ: w-8 h-8 (Antes w-6 h-6) */}
              <HiHome className={`w-8 h-8 mb-1 ${isActive('/dashboard') ? 'drop-shadow-sm' : ''}`} />
              {/* CAMBIO AQUÍ: text-xs (Antes text-[10px]) */}
              <span className="text-xs font-bold">Inicio</span>
            </Link>
            <Link to="/app/ver-mas" className={navBtnClass(isActive('/ver-mas'))}>
              <HiSquares2X2 className={`w-8 h-8 mb-1 ${isActive('/ver-mas') ? 'drop-shadow-sm' : ''}`} />
              <span className="text-xs font-bold">Más</span>
            </Link>
          </div>

          {/* CENTRO (Botón Flotante +) */}
          <div className="relative -top-8 w-1/5 flex justify-center">
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className={`w-16 h-16 rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center transition-transform duration-300 border-[6px] border-base-200
               ${isMenuOpen ? 'bg-base-content text-base-100 rotate-45' : 'bg-primary text-white rotate-0'}`}
             >
               <HiPlus className="w-8 h-8" />
             </button>
          </div>

          {/* DERECHA */}
          <div className="flex w-2/5 justify-around h-full items-center pt-2">
            <Link to="/app/proyeccion" className={navBtnClass(isActive('/proyeccion'))}>
              <HiChartBar className={`w-8 h-8 mb-1 ${isActive('/proyeccion') ? 'drop-shadow-sm' : ''}`} />
              <span className="text-xs font-bold">Futuro</span>
            </Link>
            <Link to="/app/ajustes" className={navBtnClass(isActive('/ajustes'))}>
              <HiCog6Tooth className={`w-8 h-8 mb-1 ${isActive('/ajustes') ? 'drop-shadow-sm' : ''}`} />
              <span className="text-xs font-bold">Ajustes</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Tabs;