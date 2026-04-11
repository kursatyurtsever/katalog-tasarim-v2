import { create } from "zustand";
import { useCatalogStore } from "./useCatalogStore";
import type { CatalogPage, TempPoolProduct } from "./useCatalogStore";

// @ts-ignore
const cloneDeep = <T>(value: T): T => ((typeof structuredClone === "function" ? structuredClone(value) : (JSON.parse(JSON.stringify(value)) as any)) as any);

export interface HistorySnapshot {
  pages: CatalogPage[];
  tempPool: TempPoolProduct[];
}

export interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
}

export interface HistoryActions {
  undo: () => void;
  redo: () => void;
  saveState: (pages: CatalogPage[], tempPool?: TempPoolProduct[]) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState & HistoryActions>()((set, get) => ({
  past: [],
  future: [],

  saveState: (pages, tempPool) => {
    const { past } = get();
    const currentTempPool = tempPool || cloneDeep(useCatalogStore.getState().tempProductPool);
    const newPast = [...past.slice(-20), { pages: cloneDeep(pages), tempPool: cloneDeep(currentTempPool) }];
    set({ past: newPast as any, future: [] });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const catalogStore = useCatalogStore.getState();
    const currentPages = catalogStore.getActivePages();
    const currentTempPool = catalogStore.tempProductPool;

    const previousState = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    set({ past: newPast as any, future: [{ pages: cloneDeep(currentPages), tempPool: cloneDeep(currentTempPool) } as any, ...future] });
    catalogStore.setActivePages(previousState.pages);
    useCatalogStore.setState({ tempProductPool: previousState.tempPool });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const catalogStore = useCatalogStore.getState();
    const currentPages = catalogStore.getActivePages();
    const currentTempPool = catalogStore.tempProductPool;

    const nextState = future[0];
    const newFuture = future.slice(1);
    
    set({ past: [...past, { pages: cloneDeep(currentPages), tempPool: cloneDeep(currentTempPool) } as any], future: newFuture as any });
    catalogStore.setActivePages(nextState.pages);
    useCatalogStore.setState({ tempProductPool: nextState.tempPool });
  },
  
  clearHistory: () => set({ past: [], future: [] }),
}));
