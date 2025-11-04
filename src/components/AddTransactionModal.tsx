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
  IonLoading
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useDataStore } from '../store/dataStore'; // Importamos el "gatillo"

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
        category: type === 'expense' ? 'Gasto' : 'Ingreso'
      });

      triggerRefresh(); // ¡Dispara el gatillo!

      onDidDismiss(); // Cierra el modal
      setDescription('');
      setAmount(undefined);
      setAccountId(undefined);

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
        <IonList>
          <IonItem>
            <IonSelect 
              label="Tipo" 
              value={type} 
              onIonChange={(e) => setType(e.detail.value)}
            >
              <IonSelectOption value="expense">Gasto</IonSelectOption>
              <IonSelectOption value="income">Ingreso</IonSelectOption>
            </IonSelect>
          </IonItem>

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