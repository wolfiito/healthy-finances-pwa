import React from 'react';
import { Switch, Route, Redirect, useLocation, Link } from 'react-router-dom';

// Importamos tus pantallas
import TabDashboard from './TabDashboard';
import TabCuentas from './TabCuentas';
import TabProyeccion from './TabProyeccion';
import TabReglasFijas from './TabReglasFijas';
import TabAjustes from './TabAjustes';

// Iconos
import { 
  HiHome, 
  HiCreditCard, 
  HiChartBar, 
  HiClipboardDocumentList, 
  HiCog6Tooth 
} from 'react-icons/hi2';

const Tabs: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  const navBtnClass = (active: boolean) => `
    flex flex-col items-center justify-center w-full h-full py-1 
    transition-all duration-200 active:scale-95
    ${active 
      ? 'text-primary' 
      : 'text-base-content/40 hover:text-base-content/70'
    }
  `;

  return (
    // CAMBIO CLAVE 1:
    // Quitamos 'h-screen' y 'flex-col'. Usamos 'min-h-screen'.
    // Esto permite que el <body> crezca y el navegador detecte el scroll.
    <div className="min-h-screen w-full bg-base-200">
      
      {/* CAMBIO CLAVE 2:
          Quitamos 'overflow-y-auto' y 'flex-1'.
          El 'pb-24' (padding bottom) es vital para que el contenido final 
          no quede tapado por la barra de navegación fija.
      */}
      <div className="w-full pb-24"> 
        <Switch>
          <Route path="/app/dashboard" component={TabDashboard} />
          <Route path="/app/cuentas" component={TabCuentas} />
          <Route path="/app/proyeccion" component={TabProyeccion} />
          <Route path="/app/reglas" component={TabReglasFijas} />
          <Route path="/app/ajustes" component={TabAjustes} />
          <Route exact path="/app">
            <Redirect to="/app/dashboard" />
          </Route>
        </Switch>
      </div>

      {/* Barra de Navegación (Sigue igual, fija abajo) */}
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] h-auto z-50 pb-safe pt-1">
        
        {/* Contenedor interno con altura fija para los botones (64px/4rem) */}
        <div className="flex justify-around items-center h-16 w-full">
          
          <Link to="/app/dashboard" className={navBtnClass(isActive('/dashboard'))}>
            <HiHome className={`w-6 h-6 mb-1 ${isActive('/dashboard') ? 'drop-shadow-sm' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">Inicio</span>
          </Link>

          <Link to="/app/cuentas" className={navBtnClass(isActive('/cuentas'))}>
            <HiCreditCard className={`w-6 h-6 mb-1 ${isActive('/cuentas') ? 'drop-shadow-sm' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">Cuentas</span>
          </Link>

          <Link to="/app/proyeccion" className={navBtnClass(isActive('/proyeccion'))}>
            <HiChartBar className={`w-6 h-6 mb-1 ${isActive('/proyeccion') ? 'drop-shadow-sm' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">Futuro</span>
          </Link>

          <Link to="/app/reglas" className={navBtnClass(isActive('/reglas'))}>
            <HiClipboardDocumentList className={`w-6 h-6 mb-1 ${isActive('/reglas') ? 'drop-shadow-sm' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">Reglas</span>
          </Link>

          <Link to="/app/ajustes" className={navBtnClass(isActive('/ajustes'))}>
            <HiCog6Tooth className={`w-6 h-6 mb-1 ${isActive('/ajustes') ? 'drop-shadow-sm' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">Ajustes</span>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Tabs;