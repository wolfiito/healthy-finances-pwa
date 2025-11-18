
import React, { useState, useEffect } from 'react';
import {//
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  useIonToast
} from '@ionic/react';
import { trash } from 'ionicons/icons';
import { getRules, deleteRule } from '../services/api';

// 1. Definimos la "forma" de una regla
interface Rule {
  id: number;
  description: string;
  amount: string;
  frequency: string;
  type: string;
  next_execution_date: string;
  account_id: number | null;
  debt_id: number | null;
}

const TabReglasFijas: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);
  const [present] = useIonToast();
  // 3. Función para cargar los datos
  const fetchData = async (event?: any) => {
    try {
      setError(null);
      const response = await getRules();
      setRules(response.data);
    } catch (err: any) {
      const apiError = err.response?.data?.error || "Error al obtener las reglas fijas";
      setError(apiError);
      console.error("Error fetching rules:", err);
    } finally {
      event?.detail?.complete(); // Para el refresher
    }
  };

  // 4. Cargar datos al entrar a la página
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (ruleToDelete === null) return;
    try {
      await deleteRule(ruleToDelete);
      setRules(rules.filter((rule) => rule.id !== ruleToDelete));
      present({ 
        message: 'Regla eliminada exitosamente', 
        duration: 2000, 
        color: 'success'
      });
    } catch (err: any) {
      const apiError = err.response?.data?.error || "Error al eliminar la regla";
      setError(apiError);
      console.error("Error deleting rule:", err);
    } finally {
      setRuleToDelete(null);
      setShowDeleteAlert(false);
    }
  };
  const confirmDelete = (ruleId: number) => {
    setRuleToDelete(ruleId);
    setShowDeleteAlert(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Reglas Fijas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Refresher para actualizar al deslizar */}
        <IonRefresher slot="fixed" onIonRefresh={fetchData}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Reglas Fijas</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* 5. Lista de reglas */}
        <IonList>
          {rules.map((rule) => (
            <IonItemSliding key={rule.id}>
            <IonItem>
              <IonLabel>
                <h2>{rule.description}</h2>
                <p>Monto: ${rule.amount}</p>
                <p>Próxima vez: {rule.next_execution_date}</p>
              </IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption color="danger" onClick={() => confirmDelete(rule.id)}>
                <IonIcon slot="icon-only" icon={trash} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
          ))}
        </IonList>

        {/* 6. Alerta de error */}
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header={'Error'}
          message={error || ''}
          buttons={['OK']}
        />
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirmar Eliminación'}
          message={'¿Estás seguro de que quieres eliminar esta regla?'}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              handler: handleDelete,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default TabReglasFijas;
