// En: src/components/AddDebtModal.tsx

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
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonLabel
  } from '@ionic/react';
  import React, { useState } from 'react';
  import apiClient from '../services/api';
  import { useDataStore } from '../store/dataStore'; // Importamos el "gatillo"
  
  interface AddDebtModalProps {
    isOpen: boolean;
    onDidDismiss: () => void;
  }
  
  const AddDebtModal: React.FC<AddDebtModalProps> = ({ isOpen, onDidDismiss }) => {
    // Estados para el formulario, basados en nuestra API
    const [debtName, setDebtName] = useState('');
    const [originalAmount, setOriginalAmount] = useState<number>();
    const [monthlyPayment, setMonthlyPayment] = useState<number>();
    const [termMonths, setTermMonths] = useState<number>();
    const [frequency, setFrequency] = useState<'monthly' | 'bi-weekly' | 'weekly' | 'yearly' | 'once'>('monthly');
    const [firstDate, setFirstDate] = useState<string>();
  
    const triggerRefresh = useDataStore((state) => state.triggerRefresh);
  
    const handleSave = async () => {
      if (!debtName || !originalAmount || !monthlyPayment || !termMonths || !firstDate) {
        console.error("Faltan datos");
        return;
      }
  
      try {
        const dateToSend = Array.isArray(firstDate) ? firstDate[0].split('T')[0] : firstDate.split('T')[0];
  
        // Llamamos al endpoint de "deudas" (préstamos)
        await apiClient.post('/api/debts/new', {
          debt_name: debtName,
          original_amount: originalAmount,
          monthly_payment_amount: monthlyPayment,
          term_months: termMonths,
          frequency: frequency,
          first_payment_date: dateToSend
        });
        
        triggerRefresh(); // Dispara el gatillo (para refrescar la Proyección)
        
        onDidDismiss(); // Cierra el modal
        // Limpiar formulario
        setDebtName('');
        setOriginalAmount(undefined);
        setMonthlyPayment(undefined);
        setTermMonths(undefined);
        setFirstDate(undefined);
        
      } catch (error) {
        console.error("Error al guardar la deuda", error);
      }
    };
  
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={onDidDismiss}>Cancelar</IonButton>
            </IonButtons>
            <IonTitle>Nuevo Préstamo</IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} onClick={handleSave}>Guardar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonInput 
                label="Nombre del préstamo" 
                labelPlacement="floating" 
                value={debtName}
                onIonInput={(e) => setDebtName(e.detail.value!)}
                placeholder="Ej. Préstamo Coche"
              />
            </IonItem>
            
            <IonItem>
              <IonInput 
                label="Monto Total Original" 
                labelPlacement="floating" 
                type="number" 
                value={originalAmount}
                onIonInput={(e) => setOriginalAmount(parseFloat(e.detail.value!))}
              />
            </IonItem>
  
            <IonItem>
              <IonInput 
                label="Pago Mensual Fijo" 
                labelPlacement="floating" 
                type="number" 
                value={monthlyPayment}
                onIonInput={(e) => setMonthlyPayment(parseFloat(e.detail.value!))}
              />
            </IonItem>
  
            <IonItem>
              <IonInput 
                label="Plazo (en meses)" 
                labelPlacement="floating" 
                type="number" 
                value={termMonths}
                onIonInput={(e) => setTermMonths(parseInt(e.detail.value!))}
              />
            </IonItem>
  
            <IonItem>
              {/* Por ahora solo 'mensual', pero podríamos añadir más */}
              <IonSelect 
                label="Frecuencia de Pago" 
                value={frequency} 
                onIonChange={(e) => setFrequency(e.detail.value)}
              >
                <IonSelectOption value="monthly">Mensual</IonSelectOption>
                <IonSelectOption value="bi-weekly">Quincenal</IonSelectOption>
                <IonSelectOption value="weekly">Semanal</IonSelectOption>
                <IonSelectOption value="yearly">Anual</IonSelectOption>
                <IonSelectOption value="once">Una vez</IonSelectOption>
              </IonSelect>
            </IonItem>
  
            <IonItem>
              <IonLabel>Fecha del primer pago</IonLabel>
              <IonDatetimeButton datetime="debt-datetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime 
                  id="debt-datetime"
                  presentation="date"
                  onIonChange={(e) => {
                    const value = e.detail.value;
                    if (Array.isArray(value)) {
                      setFirstDate(value[0]);
                    } else {
                      setFirstDate(value as string | undefined);
                    }
                  }}
                ></IonDatetime>
              </IonModal>
            </IonItem>
  
          </IonList>
        </IonContent>
      </IonModal>
    );
  };
  
  export default AddDebtModal;