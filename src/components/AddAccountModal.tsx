// En: src/components/AddAccountModal.tsx

import { 
    IonModal, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonButtons, 
    IonList, 
    IonItem, 
    IonInput, 
    IonSelect, 
    IonSelectOption
  } from '@ionic/react';
  import React, { useState } from 'react';
  import apiClient from '../services/api';
  import { useDataStore } from '../store/dataStore'; // Importamos el "gatillo"
  
  interface AddAccountModalProps {
    isOpen: boolean;
    onDidDismiss: () => void;
  }
  
  const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onDidDismiss }) => {
    // Estados para el formulario
    const [name, setName] = useState('');
    const [type, setType] = useState<'debit_card' | 'credit_card' | 'cash'>('debit_card');
    const [closingDate, setClosingDate] = useState<number>();
    const [paymentDate, setPaymentDate] = useState<number>();
  
    const triggerRefresh = useDataStore((state) => state.triggerRefresh);
  
    const handleSave = async () => {
      if (!name || !type) {
        console.error("Faltan datos");
        return;
      }
  
      try {
        await apiClient.post('/api/accounts/new', {
          name: name,
          type: type,
          // Solo enviamos las fechas si el tipo es 'credit_card'
          closing_date: type === 'credit_card' ? closingDate : null,
          payment_date: type === 'credit_card' ? paymentDate : null,
        });
        
        triggerRefresh(); // Dispara el gatillo (para refrescar la pestaña Cuentas)
        
        onDidDismiss(); // Cierra el modal
        // Limpiar formulario
        setName('');
        setType('debit_card');
        setClosingDate(undefined);
        setPaymentDate(undefined);
        
      } catch (error) {
        console.error("Error al guardar la cuenta", error);
      }
    };
  
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={onDidDismiss}>Cancelar</IonButton>
            </IonButtons>
            <IonTitle>Nueva Cuenta</IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} onClick={handleSave}>Guardar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonInput 
                label="Nombre de la cuenta" 
                labelPlacement="floating" 
                value={name}
                onIonInput={(e) => setName(e.detail.value!)}
              />
            </IonItem>
            
            <IonItem>
              <IonSelect 
                label="Tipo de cuenta" 
                value={type} 
                onIonChange={(e) => setType(e.detail.value)}
              >
                <IonSelectOption value="debit_card">Tarjeta de Débito</IonSelectOption>
                <IonSelectOption value="credit_card">Tarjeta de Crédito</IonSelectOption>
                <IonSelectOption value="cash">Efectivo</IonSelectOption>
              </IonSelect>
            </IonItem>
  
            {/* Mostrar estos campos solo si es Tarjeta de Crédito */}
            {type === 'credit_card' && (
              <>
                <IonItem>
                  <IonInput 
                    label="Día de Corte (1-31)" 
                    labelPlacement="floating" 
                    type="number"
                    value={closingDate}
                    onIonInput={(e) => setClosingDate(parseInt(e.detail.value!))}
                  />
                </IonItem>
                <IonItem>
                  <IonInput 
                    label="Día de Pago (1-31)" 
                    labelPlacement="floating" 
                    type="number"
                    value={paymentDate}
                    onIonInput={(e) => setPaymentDate(parseInt(e.detail.value!))}
                  />
                </IonItem>
              </>
            )}
          </IonList>
        </IonContent>
      </IonModal>
    );
  };
  
  export default AddAccountModal;