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
  IonLoading,
  IonNote
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';

interface AddAccountModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onDidDismiss }) => {
  // --- Estados del Componente ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Estados del Formulario (Simplificado) ---
  const [name, setName] = useState('');
  const [closingDate, setClosingDate] = useState<number | string>('');
  const [paymentDate, setPaymentDate] = useState<number | string>('');

  const triggerRefresh = useDataStore((state) => state.triggerRefresh);

  // --- Limpiar el formulario y errores ---
  const resetForm = () => {
    setName('');
    setClosingDate('');
    setPaymentDate('');
    setError(null);
  };

  // --- Efecto para limpiar al abrir ---
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

  // --- Lógica de Guardado y Validación ---
  const handleSave = async () => {
    setError(null);
    
    // 1. Validar nombre
    if (!name.trim()) {
      setError('El Nombre de la tarjeta es requerido.');
      return;
    }
    
    // 2. Validar campos de tarjeta de crédito (siempre visibles)
    const closingDay = Number(closingDate);
    const paymentDay = Number(paymentDate);

    if (!closingDay || closingDay < 1 || closingDay > 31) {
      setError('El Día de Corte debe ser un número válido entre 1 y 31.');
      return;
    }
    if (!paymentDay || paymentDay < 1 || paymentDay > 31) {
      setError('El Día de Pago debe ser un número válido entre 1 y 31.');
      return;
    }

    setIsLoading(true);
    try {
      // Usamos el "contrato" exacto que definiste
      await apiClient.post('/api/accounts/new', {
        name: name,
        type: 'credit_card', // Valor fijo
        closing_date: closingDay,
        payment_date: paymentDay,
      });

      triggerRefresh();
      onDidDismiss();

    } catch (err: any) {
      const apiError = err.response?.data?.error || "Error al guardar la tarjeta";
      setError(apiError);
      console.error("Error al guardar la tarjeta", err);
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
          {/* Título actualizado */}
          <IonTitle>Nueva Tarjeta de Crédito</IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={handleSave} disabled={isLoading}>Guardar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Guardando..." />
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
              label="Nombre de la Tarjeta (ej. Banamex Oro)"
              labelPlacement="floating"
              value={name}
              onIonInput={(e) => handleInput(setName, e.detail.value!)}
            />
          </IonItem>
          
          {/* Campo de tipo de cuenta eliminado */}

          {/* Campos de fecha siempre visibles */}
          <>
            <IonItem>
              <IonInput
                label="Día de Corte (ej. 25)"
                labelPlacement="floating"
                type="number"
                inputmode="numeric"
                value={closingDate}
                onIonInput={(e) => handleInput(setClosingDate, e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Día de Pago (ej. 15)"
                labelPlacement="floating"
                type="number"
                inputmode="numeric"
                value={paymentDate}
                onIonInput={(e) => handleInput(setPaymentDate, e.detail.value!)}
              />
            </IonItem>
          </>
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default AddAccountModal;
