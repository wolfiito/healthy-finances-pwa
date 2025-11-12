// En: src/components/AddTransactionModal.tsx

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
  IonLoading,
  IonSegment,        // <-- ¡NUEVO!
  IonSegmentButton,  // <-- ¡NUEVO!
  IonLabel           // <-- ¡NUEVO!
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore';

interface Account {
  account_id: number;
  account_name: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onDidDismiss }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState<number>();
  
  const triggerRefresh = useDataStore((state) => state.triggerRefresh);
  
  useEffect(() => {
    if (isOpen) {
      // Limpiar el formulario al abrir
      setDescription('');
      setAmount(undefined);
      setAccountId(undefined);
      setType('expense');

      const fetchAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
          const response = await apiClient.get('/api/accounts/summary');
          setAccounts(response.data.map((acc: any) => ({
            account_id: acc.account_id,
            account_name: acc.account_name
          })));
        } catch (error) {
          console.error("Error al cargar cuentas", error);
        } finally {
          setIsLoadingAccounts(false);
        }
      };
      fetchAccounts();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!description || !amount || !accountId) {
      console.error("Faltan datos");
      return;
    }

    try {
      await apiClient.post('/api/transactions/new', {
        description: description,
        amount: amount,
        type: type,
        account_id: accountId,
        category: type === 'expense' ? 'Gasto' : 'Ingreso' // Categoría simple
      });
      
      triggerRefresh();
      onDidDismiss();
      
    } catch (error) {
      console.error("Error al guardar la transacción", error);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onDidDismiss}>Cancelar</IonButton>
          </IonButtons>
          <IonTitle>Nuevo Movimiento</IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={handleSave}>Guardar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        
        {/* --- ¡AQUÍ ESTÁ EL CAMBIO! --- */}
        {/* Reemplazamos el IonSelect por un IonSegment */}
        <IonSegment 
          value={type} 
          onIonChange={(e) => setType(e.detail.value as 'expense' | 'income')}
          color="tertiary"
          style={{ marginBottom: '16px' }}
        >
          <IonSegmentButton value="expense">
            <IonLabel>Gasto</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="income">
            <IonLabel>Ingreso</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        {/* --- FIN DEL CAMBIO --- */}

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
            <IonInput 
              label="Monto" 
              labelPlacement="floating" 
              type="number" 
              value={amount}
              onIonInput={(e) => setAmount(parseFloat(e.detail.value!))}
            />
          </IonItem>

          <IonItem>
            {isLoadingAccounts && <IonLoading isOpen={true} />}
            <IonSelect 
              label="Cuenta" 
              value={accountId}
              onIonChange={(e) => setAccountId(e.detail.value)}
              placeholder="Seleccionar Cuenta"
            >
              {accounts.map(account => (
                <IonSelectOption key={account.account_id} value={account.account_id}>
                  {account.account_name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default AddTransactionModal;