import React, { useState } from 'react';
import { Switch, Route, Redirect, useLocation, Link } from 'react-router-dom';

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
  
  // Estados
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const isActive = (path: string) => location.pathname.includes(path);

  const navBtnClass = (active: boolean) => `
    finance-nav-button flex flex-col items-center justify-center w-full h-full pt-2 pb-1
    transition-all duration-200 active:scale-95
    ${active 
      ? 'finance-nav-button--active'
      : 'finance-nav-button--idle'
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
          className="fixed inset-0 z-40 bg-[#2f1a28]/35 backdrop-blur-[2px]"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* --- BOTONES DEL MENÚ EXPANDIBLE --- */}
      <div className={`finance-quick-actions fixed bottom-28 left-0 right-0 z-50 flex justify-center gap-4 transition-all duration-300 ${isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
         
         <button onClick={() => handleMenuAction('rule')} className="finance-action finance-action--rule flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform">
               <HiScale className="w-7 h-7" />
            </div>
            <span>Regla</span>
         </button>

         <button onClick={() => handleMenuAction('debt')} className="finance-action finance-action--debt flex flex-col items-center gap-2 -mt-10">
            <div className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform">
               <HiReceiptPercent className="w-7 h-7" />
            </div>
            <span>Deuda</span>
         </button>

         <button onClick={() => handleMenuAction('income')} className="finance-action finance-action--income flex flex-col items-center gap-2 -mt-10">
            <div className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform">
               <HiBanknotes className="w-7 h-7" />
            </div>
            <span>Ingreso</span>
         </button>

         <button onClick={() => handleMenuAction('expense')} className="finance-action finance-action--expense flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform">
               <HiCreditCard className="w-7 h-7" />
            </div>
            <span>Gasto</span>
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
      <div className="finance-dock fixed bottom-0 left-0 w-full z-50">
        {/* Fondo curvado */}
        <div className="finance-dock__surface absolute bottom-0 w-full h-24 pb-safe rounded-t-[2rem]"></div>

        <div className="relative flex justify-between items-end w-full h-24 pb-safe px-2">
          
          {/* IZQUIERDA */}
          <div className="flex w-2/5 justify-around h-full items-center pt-2">
            <Link to="/app/dashboard" className={navBtnClass(isActive('/dashboard'))}>
              <HiHome className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">Inicio</span>
            </Link>
            <Link to="/app/cuentas" className={navBtnClass(isActive('/cuentas'))}>
              <HiCreditCard className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">Cuentas</span>
            </Link>
          </div>

          {/* CENTRO (Botón Flotante +) */}
          <div className="relative -top-8 w-1/5 flex justify-center">
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className={`finance-fab w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-300 border-[6px]
               ${isMenuOpen ? 'rotate-45' : 'rotate-0'}`}
             >
               <HiPlus className="w-8 h-8" />
             </button>
          </div>

          {/* DERECHA */}
          <div className="flex w-2/5 justify-around h-full items-center pt-2">
            <Link to="/app/proyeccion" className={navBtnClass(isActive('/proyeccion'))}>
              <HiChartBar className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">Proyección</span>
            </Link>
            <Link to="/app/ajustes" className={navBtnClass(isActive('/ajustes'))}>
              <HiCog6Tooth className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">Ajustes</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Tabs;
