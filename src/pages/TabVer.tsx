
// En: src/pages/TabVer.tsx

import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';

const TabVer: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ver</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Ver</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton expand="block" routerLink="/app/cuentas">Cuentas</IonButton>
        <IonButton expand="block" routerLink="/app/reglas-fijas">Reglas Fijas</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default TabVer;
