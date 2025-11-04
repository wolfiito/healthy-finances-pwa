// En: src/components/AddRuleModal.tsx

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
    IonLabel // <-- ¡ARREGLO 1: IMPORTAR IONLABEL!
  } from '@ionic/react';
  import React, { useState } from 'react';
  import apiClient from '../services/api';
  import { useDataStore } from '../store/dataStore';
  
  interface AddRuleModalProps {
    isOpen: boolean;
    onDidDismiss: () => void;
  }
  
  const AddRuleModal: React.FC<AddRuleModalProps> = ({ isOpen, onDidDismiss }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number>();
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [frequency, setFrequency] = useState<'mensual' | 'quincenal' | 'semanal'>('mensual');
    const [firstDate, setFirstDate] = useState<string>();
  
    const triggerRefresh = useDataStore((state) => state.triggerRefresh);
  
    const handleSave = async () => {
      if (!description || !amount || !firstDate) {
        console.error("Faltan datos");
        return;
      }
  
      try {
        // Enviamos solo la parte de la fecha (YYYY-MM-DD)
        const dateToSend = Array.isArray(firstDate) ? firstDate[0].split('T')[0] : firstDate.split('T')[0];
  
        await apiClient.post('/api/rules/new', {
          description: description,
          amount: amount,
          type: type,
          frequency: frequency,
          first_execution_date: dateToSend
        });
        
        triggerRefresh();
        
        onDidDismiss();
        // Limpiar formulario
        setDescription('');
        setAmount(undefined);
        setType('expense');
        setFrequency('mensual');
        setFirstDate(undefined);
        
      } catch (error) {
        console.error("Error al guardar la regla", error);
      }
    };
  
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={onDidDismiss}>Cancelar</IonButton>
            </IonButtons>
            <IonTitle>Nueva Regla Fija</IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} onClick={handleSave}>Guardar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonInput 
                label="Descripción" 
                labelPlacement="floating" 
                value={description}
                onIonInput={(e) => setDescription(e.detail.value!)}
              />
            </IonItem>
  
            <IonItem>
              <IonSelect 
                label="Tipo" 
                value={type} 
                onIonChange={(e) => setType(e.detail.value)}
              >
                <IonSelectOption value="expense">Gasto Fijo</IonSelectOption>
                <IonSelectOption value="income">Ingreso Fijo</IonSelectOption>
              </IonSelect>
            </IonItem>
            
            <IonItem>
              <IonInput 
                label="Monto" 
                labelPlacement="floating" 
                type="number" 
                value={amount}
                onIonInput={(e) => setAmount(parseFloat(e.detail.value!))}
              />
            </IonItem>
  
            <IonItem>
              <IonSelect 
                label="Frecuencia" 
                value={frequency} 
                onIonChange={(e) => setFrequency(e.detail.value)}
              >
                <IonSelectOption value="mensual">Mensual</IonSelectOption>
                <IonSelectOption value="quincenal">Quincenal</IonSelectOption>
                <IonSelectOption value="semanal">Semanal</IonSelectOption>
              </IonSelect>
            </IonItem>
  
            <IonItem>
              <IonLabel>Fecha del primer pago/cobro</IonLabel>
              <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime 
                  id="datetime"
                  presentation="date"
                  onIonChange={(e) => {
                    // --- ¡ARREGLO 2: MANEJAR EL TIPO DE VALOR! ---
                    const value = e.detail.value;
                    if (Array.isArray(value)) {
                      setFirstDate(value[0]); // Tomar solo el primer valor
                    } else {
                      setFirstDate(value as string | undefined); // Es un string
                    }
                    // --- FIN DEL ARREGLO ---
                  }}
                ></IonDatetime>
              </IonModal>
            </IonItem>
  
          </IonList>
        </IonContent>
      </IonModal>
    );
  };
  
  export default AddRuleModal;