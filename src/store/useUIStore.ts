
import { create } from "zustand";

export interface UIState {
  isZoomed: boolean;
  selectedSlotIds: string[];
  selectedPageNumber: number | null;
  selectedTextElement: { slotId: string, elementType: 'name' | 'price' | 'badge' } | null;
  sidebarState: { activePanel: string | null; activeTab: string | null; activeSubTab: string | null };
  contextualBarFormaId: string | null;
  contextualBarSelectedPages: number[];
}

export interface UIActions {
  toggleZoom: () => void;
  toggleSlotSelection: (id: string, isMulti: boolean) => void;
  clearSelection: () => void;
  setSelectedPage: (pageNumber: number | null) => void;
  setSelectedTextElement: (element: { slotId: string, elementType: 'name' | 'price' | 'badge' } | null) => void;
  setSidebarState: (panel: string | null, tab?: string | null, subTab?: string | null) => void;
  setContextualBarFormaId: (id: string | null) => void;
  setContextualBarSelectedPages: (pages: number[]) => void;
  clearSelectionAndSelectPage: (pageNumber: number) => void;
}

const initialSidebarState = {
  activePanel: "products",
  activeTab: null as string | null,
  activeSubTab: null as string | null,
};

export const useUIStore = create<UIState & UIActions>()((set, get) => ({
  isZoomed: false,
  selectedSlotIds: [],
  selectedPageNumber: null,
  selectedTextElement: null,
  sidebarState: initialSidebarState,
  contextualBarFormaId: "1",
  contextualBarSelectedPages: [],

  toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),

  toggleSlotSelection: (id, isMulti) => set((state) => {
    let newSelectedIds = [];
    if (isMulti) {
      if (state.selectedSlotIds.includes(id)) newSelectedIds = state.selectedSlotIds.filter((x) => x !== id);
      else newSelectedIds = [...state.selectedSlotIds, id];
    } else {
      newSelectedIds = [id];
    }
    return { 
      selectedSlotIds: newSelectedIds,
      selectedPageNumber: null,
      selectedTextElement: null,
    };
  }),

  clearSelection: () => set(() => ({ 
    selectedSlotIds: [],
    selectedPageNumber: null,
    selectedTextElement: null,
  })),

  setSelectedPage: (pageNumber) => set((state) => {
    const updates: Partial<UIState> = {
      selectedPageNumber: pageNumber,
      selectedSlotIds: [],
      selectedTextElement: null,
    };

    if (pageNumber !== null) {
      updates.contextualBarSelectedPages = [pageNumber];
      // This part requires access to `formas` from `useCatalogStore`.
      // We'll handle this interaction after all stores are created.
    }

    return updates;
  }),

  setSelectedTextElement: (element) => set({ selectedTextElement: element }),

  setContextualBarFormaId: (id) => set({ contextualBarFormaId: id }),
  setContextualBarSelectedPages: (pages) => set({ contextualBarSelectedPages: pages }),

  setSidebarState: (panel, tab = null, subTab = null) => set(() => ({
    sidebarState: { activePanel: panel, activeTab: tab, activeSubTab: subTab }
  })),
  
  clearSelectionAndSelectPage: (pageNumber: number) => {
    get().clearSelection();
    get().setSelectedPage(pageNumber);
  },
}));
