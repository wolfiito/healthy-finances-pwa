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
  IonLabel,
  IonLoading,
  IonNote
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';

interface AddRuleModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

const AddRuleModal: React.FC<AddRuleModalProps> = ({ isOpen, onDidDismiss }) => {
  // --- Estados del Formulario ---
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>();
  const [type, setType] = useState<'expense' | 'income'>('expense');

  // --- CAMBIO AQUÍ (1/2): Actualizado el tipo y el valor default ---
  // Los valores (ej. 'monthly') deben coincidir con tu Enum de Python
  const [frequency, setFrequency] = useState<'monthly' | 'bi_weekly' | 'weekly' | 'daily' | 'yearly' | 'once'>('monthly');
  
  const [firstDate, setFirstDate] = useState<string>();

  // --- Estados del Componente ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRefresh = useDataStore((state) => state.triggerRefresh);

  // --- Limpiar el formulario y errores ---
  const resetForm = () => {
    setDescription('');
    setAmount(undefined);
    setType('expense');
    setFrequency('monthly'); // Reseteamos al valor default en inglés
    setFirstDate(undefined);
    setError(null);
  };

  // --- Efecto para limpiar al abrir/cerrar ---
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // --- Wrapper para limpiar error al escribir ---
  const handleInput = (setter: Function, value: any) => {
    if (error) setError(null);
    setter(value);
  };

  // --- Lógica de Guardado ---
  const handleSave = async () => {
    // Validación de cliente
    if (!description || !amount || !firstDate) {
      setError("Todos los campos son requeridos.");
      return;
    }
    if (amount <= 0) {
        setError("El monto debe ser un número positivo.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dateToSend = Array.isArray(firstDate) ? firstDate[0].split('T')[0] : firstDate.split('T')[0];

      // El 'frequency' ahora se envía en inglés (ej. 'monthly')
      await apiClient.post('/api/rules/new', {
        description: description,
        amount: amount,
        type: type,
        frequency: frequency,
        first_execution_date: dateToSend
        // 'account_id' se omite correctamente,
        // tal como modificamos el backend.
      });

      triggerRefresh();
      onDidDismiss();

    } catch (err: any) {
      let apiError = "Error desconocido al guardar la regla."; // Mensaje por defecto
      if (err.response && err.response.data) {
          const errorData = err.response.data;
          console.error("Server error data:", errorData); // Dejar esto para depuración
          
          // --- Manejo de Errores Mejorado ---
          // Intenta leer el error específico de la API (ej. "Frecuencia no válida")
          if (errorData.error) {
            apiError = errorData.error;
          } else if (typeof errorData === 'object' && errorData !== null) {
              const errorValues = Object.values(errorData);
              if (errorValues.length > 0) {
                  const firstError = errorValues[0];
                  if (Array.isArray(firstError) && firstError.length > 0) {
                      apiError = firstError[0];
                  } else if (typeof firstError === 'string') {
                      apiError = firstError;
                  }
              }
          } else if (typeof errorData === 'string') {
              apiError = errorData;
          }
      } else if (err.message) {
          apiError = err.message;
      }
      setError(apiError);
    } finally {
      setIsLoading(false);
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
            <IonButton strong={true} onClick={handleSave} disabled={isLoading}>Guardar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message={"Guardando..."} />
        <IonList>

          {error && (
            <IonItem lines="none">
            <IonNote color="danger" style={{ width: '100%', textAlign: 'center', fontWeight: 500 }}>
                {error}
            </IonNote>
            </IonItem>
          )}

          <IonItem>
            <IonInput
              label="Descripción"
              labelPlacement="floating"
              value={description}
              onIonInput={(e) => handleInput(setDescription, e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonSelect
              label="Tipo"
              value={type}
              onIonChange={(e) => handleInput(setType, e.detail.value)}
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
              inputmode="numeric"
              value={amount}
              onIonInput={(e) => handleInput(setAmount, parseInt(e.detail.value!))}
            />
          </IonItem>

          {/* --- CAMBIO AQUÍ (2/2): Actualizados los 'value' --- */}
          {/* El 'value' se envía a la API (inglés), el texto se muestra al usuario (español) */}
          <IonItem>
            <IonSelect
              label="Frecuencia"
              value={frequency}
              onIonChange={(e) => handleInput(setFrequency, e.detail.value)}
            >
              <IonSelectOption value="monthly">Mensual</IonSelectOption>
              <IonSelectOption value="bi_weekly">Quincenal</IonSelectOption>
              <IonSelectOption value="weekly">Semanal</IonSelectOption>
              <IonSelectOption value="daily">Diario</IonSelectOption>
              <IonSelectOption value="yearly">Anual</IonSelectOption>
              <IonSelectOption value="once">Una vez</IonSelectOption>
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
                  if (error) setError(null);
                  const value = e.detail.value;
                  if (Array.isArray(value)) {
                    handleInput(setFirstDate, value[0]);
                  } else {
                    handleInput(setFirstDate, value as string | undefined);
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

export default AddRuleModal;