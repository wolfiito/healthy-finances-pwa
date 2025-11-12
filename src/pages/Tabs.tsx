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

// --- ¡NUEVO! Se importan los íconos "outline" para un look más limpio ---
import { 
  homeOutline, 
  walletOutline, 
  settingsOutline, 
  addCircleOutline, 
  trendingUpOutline,
  close, // El ícono de cerrar se queda igual
  cashOutline, 
  cardOutline, 
  repeatOutline, 
  speedometerOutline 
} from 'ionicons/icons';

import TabDashboard from './TabDashboard';
import TabCuentas from './TabCuentas';
import TabAjustes from './TabAjustes';
import TabProyeccion from './TabProyeccion';

// Modales (sin cambios)
import AddTransactionModal from '../components/AddTransactionModal';
import AddAccountModal from '../components/AddAccountModal';
import AddRuleModal from '../components/AddRuleModal';
import AddDebtModal from '../components/AddDebtModal';

const Tabs: React.FC = () => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);

  return (
    <>
      {/* Los modales no cambian */}
      <AddTransactionModal isOpen={showTransactionModal} onDidDismiss={() => setShowTransactionModal(false)} />
      <AddAccountModal isOpen={showAccountModal} onDidDismiss={() => setShowAccountModal(false)} />
      <AddRuleModal isOpen={showRuleModal} onDidDismiss={() => setShowRuleModal(false)} />
      <AddDebtModal isOpen={showDebtModal} onDidDismiss={() => setShowDebtModal(false)} />

      <IonTabs>
        {/* Las rutas no cambian */}
        <IonRouterOutlet>
          <Route exact path="/app/dashboard" component={TabDashboard} />
          <Route exact path="/app/cuentas" component={TabCuentas} />
          <Route exact path="/app/proyeccion" component={TabProyeccion} />
          <Route exact path="/app/ajustes" component={TabAjustes} />
          <Route exact path="/app"><Redirect to="/app/dashboard" /></Route>
        </IonRouterOutlet>

        {/* --- BARRA DE PESTAÑAS CON ÍCONOS "OUTLINE" --- */}
        <IonTabBar slot="bottom">
          <IonTabButton tab="dashboard" href="/app/dashboard">
            <IonIcon icon={homeOutline} />
            <IonLabel>Resumen</IonLabel>
          </IonTabButton>

          <IonTabButton tab="cuentas" href="/app/cuentas">
            <IonIcon icon={walletOutline} />
            <IonLabel>Cuentas</IonLabel>
          </IonTabButton>

          {/* El botón central sigue abriendo el menú */}
          <IonTabButton tab="add" onClick={() => setShowActionSheet(true)}>
            <IonIcon icon={addCircleOutline} />
            <IonLabel>Añadir</IonLabel>
          </IonTabButton>

          <IonTabButton tab="proyeccion" href="/app/proyeccion">
            <IonIcon icon={trendingUpOutline} />
            <IonLabel>Proyección</IonLabel>
          </IonTabButton>

          <IonTabButton tab="ajustes" href="/app/ajustes">
            <IonIcon icon={settingsOutline} />
            <IonLabel>Ajustes</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>

      {/* Menú de acciones también usará íconos "outline" */}
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header={'¿Qué quieres agregar?'}
        buttons={[
          { text: 'Gasto / Ingreso', icon: cashOutline, handler: () => { setShowTransactionModal(true); } },
          { text: 'Cuenta Nueva', icon: cardOutline, handler: () => { setShowAccountModal(true); } },
          { text: 'Regla Fija', icon: repeatOutline, handler: () => { setShowRuleModal(true); } },
          { text: 'Préstamo (Deuda)', icon: speedometerOutline, handler: () => { setShowDebtModal(true); } },
          { text: 'Cancelar', icon: close, role: 'cancel' },
        ]}
      />
    </>
  );
};

export default Tabs;
