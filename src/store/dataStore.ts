// En: src/store/dataStore.ts
import { create } from 'zustand';

interface DataState {
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  refreshKey: 0,

  // Esta función "grita" a la app que los datos cambiaron
  triggerRefresh: () => set((state) => ({ 
    refreshKey: state.refreshKey + 1 
  })),
}));