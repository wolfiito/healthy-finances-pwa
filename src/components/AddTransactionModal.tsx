// En: src/components/AddTransactionModal.tsx

import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonButtons, IonList, IonItem, IonInput, IonSelect, IonSelectOption,
  IonLoading, IonNote, IonToggle, IonLabel
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { getAccountsSummary } from '../services/api';
import apiClient from '../services/api';

// --- Interfaces y Constantes ---
interface Account {
  account_id: number;
  account_name: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH'; 
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

const GASTO_CATEGORIES = [
  "Comida", "Super", "Uber", "Disposición Efectivo", 
  "Transporte", "Oxxo", "Tecnologia", "Otros"
];

// --- Componente Principal ---
const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onDidDismiss }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Estados del Formulario ---
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [accountId, setAccountId] = useState<number | undefined>();
  const [category, setCategory] = useState<string>('');
  const [showInstallments, setShowInstallments] = useState(false);
  const [installments, setInstallments] = useState<number | string>('');

  const triggerRefresh = useDataStore((state) => state.triggerRefresh);

  const resetForm = () => {
    setType('expense');
    setDescription('');
    setAmount('');
    setAccountId(undefined);
    setCategory('');
    setShowInstallments(false);
    setInstallments('');
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      const fetchAccounts = async () => {
        try {
          const response = await getAccountsSummary(); 
          setAccounts(response.data); 
        } catch (error) {
          console.error("Error al cargar cuentas", error);
          setError("No se pudieron cargar las cuentas.");
        }
      };
      fetchAccounts();
    }
  }, [isOpen]);

  const selectedAccount = accounts.find(a => a.account_id === accountId);

  const handleInput = (setter: Function, value: any) => {
    if (error) setError(null);
    setter(value);
  };

  const handleSave = async () => {
    // --- Validaciones ---
    if (!description.trim()) return setError('La Descripción es requerida.');
    if (!amount || parseFloat(amount as string) <= 0) return setError('El Monto debe ser un número positivo.');
    if (!accountId) return setError('Debe seleccionar una Cuenta.');
    if (type === 'expense' && !category) return setError('La Categoría es requerida para un gasto.');
    if (showInstallments && (!installments || Number(installments) <= 1)) return setError('Los meses deben ser 2 o más.');

    setError(null);
    setIsLoading(true);

    // --- Construcción del Payload ---
    const payload: any = {
      description,
      amount: parseFloat(amount as string),
      type: type, 
      account_id: accountId,
    };
    if (type === 'expense') {
      payload.category = category;
    }
    
    if (showInstallments && selectedAccount?.type?.toUpperCase() === 'CREDIT_CARD') {
      payload.installments = Number(installments);
    }

    // --- Envío a la API ---
    try {
      await apiClient.post('/api/transactions/new', payload);
      triggerRefresh();
      onDidDismiss();
    } catch (err: any) {
      const apiError = err.response?.data?.error || "Error al guardar la transacción";
      setError(apiError);
      console.error("Error al guardar", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonButton onClick={onDidDismiss}>Cancelar</IonButton></IonButtons>
          <IonTitle>Nueva Transacción</IonTitle>
          <IonButtons slot="end"><IonButton strong={true} onClick={handleSave} disabled={isLoading}>Guardar</IonButton></IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message={"Guardando..."}/>
        <IonList>
          {error && <IonItem lines="none"><IonNote color="danger" className="ion-text-center" style={{fontWeight: 500}}>{error}</IonNote></IonItem>}

          <IonItem>
            <IonSelect label="Tipo" value={type} onIonChange={(e) => handleInput(setType, e.detail.value)} interface="action-sheet">
              <IonSelectOption value="expense">Gasto</IonSelectOption>
              <IonSelectOption value="income">Ingreso</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonInput label="Descripción" labelPlacement="floating" value={description} onIonInput={(e) => handleInput(setDescription, e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonInput label="Monto" labelPlacement="floating" type="number" inputmode="decimal" value={amount} onIonInput={(e) => handleInput(setAmount, e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonSelect label="Cuenta" placeholder="Seleccionar cuenta" value={accountId} onIonChange={(e) => handleInput(setAccountId, e.detail.value)} interface="action-sheet">
              {accounts.map(acc => <IonSelectOption key={acc.account_id} value={acc.account_id}>{acc.account_name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>

          {type === 'expense' && (
            <IonItem>
              <IonSelect label="Categoría" placeholder="Seleccionar categoría" value={category} onIonChange={(e) => handleInput(setCategory, e.detail.value)} interface="action-sheet">
                {GASTO_CATEGORIES.map(cat => <IonSelectOption key={cat} value={cat}>{cat}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
          )}

          {/* ¡CORREGIDO! Lógica para Meses Sin Intereses con comprobación insensible a mayúsculas/minúsculas */}
          {type === 'expense' && selectedAccount?.type?.toUpperCase() === 'CREDIT_CARD' && (
            <>
              <IonItem>
                <IonLabel>¿Es a meses sin intereses?</IonLabel>
                <IonToggle checked={showInstallments} onIonChange={e => handleInput(setShowInstallments, e.detail.checked)} slot="end" />
              </IonItem>
              {showInstallments && (
                <IonItem>
                  <IonInput label="Número de Meses" labelPlacement="floating" type="number" inputmode="numeric" value={installments} onIonInput={(e) => handleInput(setInstallments, e.detail.value!)} />
                </IonItem>
              )}
            </>
          )}

        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default AddTransactionModal;
