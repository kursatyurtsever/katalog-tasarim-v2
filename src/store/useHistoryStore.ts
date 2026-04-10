
import { create } from "zustand";
import { useCatalogStore } from "./useCatalogStore";
import type { CatalogPage } from "./useCatalogStore";


// @ts-ignore
const cloneDeep = <T>(value: T): T => ((typeof structuredClone === "function" ? structuredClone(value) : (JSON.parse(JSON.stringify(value)) as any)) as any);

export interface HistoryState {
  past: CatalogPage[][];
  future: CatalogPage[][];
}

export interface HistoryActions {
  undo: () => void;
  redo: () => void;
  saveState: (pages: CatalogPage[]) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState & HistoryActions>()((set, get) => ({
  past: [],
  future: [],

  saveState: (pages) => {
    const { past } = get();
    const newPast = [...past.slice(-20), pages];
    set({ past: newPast, future: [] });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const { getActivePages, setActivePages } = useCatalogStore.getState();
    const currentPages = getActivePages();

    const previousState = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    set({ past: newPast, future: [cloneDeep(currentPages), ...future] });
    setActivePages(previousState);
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const { getActivePages, setActivePages } = useCatalogStore.getState();
    const currentPages = getActivePages();

    const nextState = future[0];
    const newFuture = future.slice(1);
    
    set({ past: [...past, cloneDeep(currentPages)], future: newFuture });
    setActivePages(nextState);
  },
  
  clearHistory: () => set({ past: [], future: [] }),
}));
