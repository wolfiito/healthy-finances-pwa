import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';
// Iconos modernos Outline
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';

const Login: React.FC = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sistema de Tema Automático
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (isDark: boolean) => {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };
    applyTheme(query.matches);
    const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', { username, password });
      if (response.data.token) {
        setToken(response.data.token);
        history.push('/app');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'No pudimos verificar tus datos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-base-200 transition-colors duration-500">
      
      {/* --- FONDO ANIMADO --- */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-50 animate-pulse mix-blend-multiply filter dark:mix-blend-screen dark:opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full blur-3xl opacity-50 animate-pulse delay-1000 mix-blend-multiply filter dark:mix-blend-screen dark:opacity-20"></div>

      {/* --- TARJETA PRINCIPAL --- */}
      <div className="z-10 w-full max-w-md p-6">
        <div className="card w-full shadow-2xl bg-base-100/80 backdrop-blur-xl border border-white/20 dark:border-white/5">
          <div className="card-body p-8 sm:p-10">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-base-content">
                Bienvenido
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Input Usuario */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-xs uppercase tracking-wide opacity-70">Usuario</span>
                </label>
                <div className="relative group">
                  {/* ICONO: z-10 para estar encima y drop-shadow para brillar */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 transition-all duration-300
                    text-base-content/40 
                    group-focus-within:text-primary 
                    group-focus-within:scale-110 
                    group-focus-within:drop-shadow-[0_0_6px_currentColor]">
                    <HiEnvelope className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ej. usuario@email.com" 
                    className="input input-bordered w-full pl-11 bg-base-200/50 focus:bg-base-100 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-xl"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div className="form-control">
                <div className="flex justify-between items-center">
                  <label className="label">
                    <span className="label-text font-semibold text-xs uppercase tracking-wide opacity-70">Contraseña</span>
                  </label>
                </div>
                <div className="relative group">
                  {/* ICONO: z-10 para estar encima y drop-shadow para brillar */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 transition-all duration-300
                    text-base-content/40 
                    group-focus-within:text-primary 
                    group-focus-within:scale-110 
                    group-focus-within:drop-shadow-[0_0_6px_currentColor]">
                    <HiLockClosed className="w-5 h-5" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="input input-bordered w-full pl-11 pr-12 bg-base-200/50 focus:bg-base-100 focus:ring-4 focus:ring-primary/10 transition-all duration-300 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* Botón Ver Contraseña */}
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-primary cursor-pointer transition-colors z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <a href="#" className="text-xs font-bold text-primary hover:text-primary-focus transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="animate-bounce-in text-error text-sm bg-error/10 p-3 rounded-lg flex items-center gap-2 border border-error/20">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                   </svg>
                   <span>{error}</span>
                </div>
              )}

              {/* Botón */}
              <button 
                type="submit" 
                className={`
                  btn btn-primary w-full text-lg normal-case tracking-wide rounded-xl shadow-lg shadow-primary/30 border-none
                  bg-gradient-to-r from-primary to-primary-focus hover:brightness-110 hover:scale-[1.01] transition-all duration-300
                  ${loading ? 'loading' : ''}
                `}
                disabled={loading}
              >
                {loading ? 'Iniciando...' : 'Acceder a mi cuenta'}
              </button>

            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-base-content/60">
              ¿Aún no tienes cuenta?{' '}
              <a href="#" className="font-bold text-primary hover:underline">
                Regístrate gratis
              </a>
            </div>

          </div>
        </div>

        <div className="text-center mt-8 opacity-40 text-xs">
          Protected by Healthy Finances Security
        </div>
      </div>
    </div>
  );
};

export default Login;