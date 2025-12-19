import React from 'react';
import { Link } from 'react-router-dom';
// Iconos para darle vida
import { 
  HiCreditCard, 
  HiClipboardDocumentList, 
  HiEye 
} from 'react-icons/hi2';

const TabVer: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200 pb-24 font-sans">
      
      {/* 1. Header */}
      <div className="bg-base-100 shadow-sm border-b border-base-300 px-6 py-6 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-base-content tracking-tight">Explorar</h1>
            <p className="text-sm text-base-content/60">Accesos directos</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <HiEye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Contenido (Lista de Accesos) */}
      <div className="p-4 grid gap-4">
        
        {/* Acceso a Cuentas */}
        <Link to="/app/cuentas" className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200 active:scale-[0.98]">
          <div className="card-body flex-row items-center gap-4 p-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <HiCreditCard className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Cuentas</h2>
              <p className="text-xs opacity-60">Gestiona tarjetas y efectivo</p>
            </div>
          </div>
        </Link>

        {/* Acceso a Reglas Fijas */}
        <Link to="/app/reglas" className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-200 active:scale-[0.98]">
          <div className="card-body flex-row items-center gap-4 p-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <HiClipboardDocumentList className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Reglas Fijas</h2>
              <p className="text-xs opacity-60">Configura pagos recurrentes</p>
            </div>
          </div>
        </Link>

        {/* Aquí podrías agregar más opciones futuras como "Exportar Datos", "Reportes", etc. */}

      </div>
    </div>
  );
};

export default TabVer;