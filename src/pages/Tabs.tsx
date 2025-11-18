// En: src/pages/Tabs.tsx

import React, { useState } from 'react';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet,
  IonActionSheet
} from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
// Importamos todos los íconos que usará el menú
import { home, wallet, settings, addCircle, trendingUp, close, cash, card, repeat, speedometer, eye } from 'ionicons/icons';

import TabDashboard from './TabDashboard';
import TabCuentas from './TabCuentas';
import TabAjustes from './TabAjustes';
import TabProyeccion from './TabProyeccion';
import TabVer from './TabVer';
import TabReglasFijas from './TabReglasFijas';


// Importar TODOS los modales
import AddTransactionModal from '../components/AddTransactionModal';
import AddAccountModal from '../components/AddAccountModal';
import AddRuleModal from '../components/AddRuleModal';
import AddDebtModal from '../components/AddDebtModal'; // <-- ¡EL NUEVO!

const Tabs: React.FC = () => {
  // Un estado para cada modal y uno para el menú
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false); // <-- ¡EL NUEVO!

  return (
    <>
      {/* Definimos todos los modales (estarán ocultos) */}
      <AddTransactionModal 
        isOpen={showTransactionModal} 
        onDidDismiss={() => setShowTransactionModal(false)} 
      />
      <AddAccountModal
        isOpen={showAccountModal}
        onDidDismiss={() => setShowAccountModal(false)}
      />
      <AddRuleModal
        isOpen={showRuleModal}
        onDidDismiss={() => setShowRuleModal(false)}
      />
      <AddDebtModal
        isOpen={showDebtModal}
        onDidDismiss={() => setShowDebtModal(false)}
      />

      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/app/dashboard" component={TabDashboard} />
          <Route exact path="/app/ver" component={TabVer} />
          <Route exact path="/app/cuentas" component={TabCuentas} />
          <Route exact path="/app/reglas-fijas" component={TabReglasFijas} />
          <Route exact path="/app/proyeccion" component={TabProyeccion} />
          <Route exact path="/app/ajustes" component={TabAjustes} />
          <Route exact path="/app">
            <Redirect to="/app/dashboard" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="dashboard" href="/app/dashboard">
            <IonIcon icon={home} />
            <IonLabel>Resumen</IonLabel>
          </IonTabButton>
          <IonTabButton tab="ver" href="/app/ver">
            <IonIcon icon={eye} />
            <IonLabel>Ver</IonLabel>
          </IonTabButton>
          <IonTabButton tab="add" onClick={() => setShowActionSheet(true)}>
            <IonIcon icon={addCircle} />
            <IonLabel>Añadir</IonLabel>
          </IonTabButton>
          <IonTabButton tab="proyeccion" href="/app/proyeccion">
            <IonIcon icon={trendingUp} />
            <IonLabel>Proyección</IonLabel>
          </IonTabButton>
          <IonTabButton tab="ajustes" href="/app/ajustes">
            <IonIcon icon={settings} />
            <IonLabel>Ajustes</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>

      {/* --- ¡MENÚ DESLIZANTE CON 4 OPCIONES! --- */}
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header={'¿Qué quieres agregar?'}
        buttons={[
          {
            text: 'Gasto / Ingreso',
            icon: cash,
            handler: () => { setShowTransactionModal(true); },
          },
          {
            text: 'Cuenta Nueva (TC, Débito)',
            icon: card,
            handler: () => { setShowAccountModal(true); },
          },
          {
            text: 'Regla Fija (Renta, Sueldo)',
            icon: repeat,
            handler: () => { setShowRuleModal(true); },
          },
          {
            text: 'Préstamo (Deuda a plazo)',
            icon: speedometer, // <-- ¡NUEVO BOTÓN!
            handler: () => { setShowDebtModal(true); },
          },
          {
            text: 'Cancelar',
            icon: close,
            role: 'cancel',
          },
        ]}
      />
    </>
  );
};

export default Tabs;