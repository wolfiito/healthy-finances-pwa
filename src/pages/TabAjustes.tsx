import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';
import { useThemeStore } from '../store/themeStore';
// Iconos
import { 
  HiMoon, 
  HiSun, 
  HiComputerDesktop, 
  HiArrowRightOnRectangle, 
  HiCurrencyDollar,
  HiCog6Tooth
} from 'react-icons/hi2';

const TabAjustes: React.FC = () => {
  const clearToken = useAuthStore((state) => state.clearToken);
  const triggerRefresh = useDataStore((state) => state.triggerRefresh);
  const history = useHistory();

  // Store de Tema
  const { theme, setTheme } = useThemeStore();

  const [balance, setBalance] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- EFECTO: Aplicar Tema al cambiarlo ---
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', systemDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', theme);
      }
    };
    
    applyTheme();
    
    // Si es sistema, escuchar cambios del OS
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const handleLogout = () => {
    clearToken();
    history.push('/login');
  };

  const handleSetInitialBalance = async () => {
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      // Podrías poner un error en estado aquí si quisieras
      return; 
    }
    
    setIsLoading(true);
    try {
      await apiClient.post('/api/transactions/set_initial', { amount });
      triggerRefresh();
      setBalance("");
      
      // Mostrar Toast de éxito
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Ocultar a los 3 seg

    } catch (err) {
      console.error("Error al establecer el saldo", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-24 font-sans relative">
      
      {/* 1. Header */}
      <div className="bg-base-100 pt-10 pb-6 px-6 shadow-sm border-b border-base-300">
        <div className="flex justify-between items-center">
           <div>
             <h1 className="text-2xl font-black text-base-content tracking-tight">Ajustes</h1>
             <p className="text-sm text-base-content/60">Personaliza tu experiencia</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
             <HiCog6Tooth className="w-6 h-6" />
           </div>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* 2. Tarjeta de Apariencia (Tema) */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-5">
            <h2 className="card-title text-base font-bold mb-4">Apariencia</h2>
            
            <div className="join w-full grid grid-cols-3">
              <input 
                className="join-item btn btn-sm h-12" 
                type="radio" 
                name="theme" 
                aria-label="Claro" 
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
              />
              <input 
                className="join-item btn btn-sm h-12" 
                type="radio" 
                name="theme" 
                aria-label="Oscuro" 
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
              />
              <input 
                className="join-item btn btn-sm h-12" 
                type="radio" 
                name="theme" 
                aria-label="Sistema"
                checked={theme === 'system'}
                onChange={() => setTheme('system')}
              />
            </div>
            
            {/* Iconos visuales debajo de los botones para reforzar */}
            <div className="flex justify-between px-4 mt-2 text-base-content/40">
              <HiSun className="w-5 h-5" />
              <HiMoon className="w-5 h-5" />
              <HiComputerDesktop className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 3. Configurar Saldo Inicial */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-5">
            <h2 className="card-title text-base font-bold mb-2">Cuenta Maestra</h2>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Restablecer Saldo Inicial</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                  <HiCurrencyDollar className="w-5 h-5" />
                </div>
                <input 
                  type="number" 
                  placeholder="10000.00" 
                  className="input input-bordered w-full pl-10 focus:input-primary font-mono"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
            </div>

            <div className="alert bg-base-200/50 text-xs mt-2 border-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>
                <b>Aviso:</b> Esto borrará el historial y establecerá un nuevo punto de partida.
              </span>
            </div>

            <button 
              onClick={handleSetInitialBalance}
              className="btn btn-primary w-full mt-4"
              disabled={isLoading || !balance}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Actualizar Saldo'}
            </button>
          </div>
        </div>

        {/* 4. Cerrar Sesión */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-5">
            <h2 className="card-title text-base font-bold mb-4">Sesión</h2>
            <button 
              onClick={handleLogout}
              className="btn btn-error btn-outline w-full gap-2"
            >
              <HiArrowRightOnRectangle className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>

      </div>

      {/* 5. TOAST (Notificación Flotante) */}
      {showToast && (
        <div className="toast toast-bottom toast-center z-50 mb-20 animate-fade-in-up">
          <div className="alert alert-success shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>¡Saldo actualizado correctamente!</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default TabAjustes;