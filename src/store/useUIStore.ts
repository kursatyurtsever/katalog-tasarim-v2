import { create } from "zustand";

export type SelectionType = 'none' | 'slot' | 'layer' | 'bannerCell' | 'textElement' | 'footerCell';

export interface SelectionState {
  type: SelectionType;
  ids: string[];
  parentId?: string | null;
  textElementType?: 'name' | 'price' | 'badge';
}

export interface UIState {
  isZoomed: boolean;
  isTempPoolOpen: boolean;
  
  // Eski seçim state'leri (Uyumluluk için geçici olarak var ama kullanılmamalı)
  selectedSlotIds: string[];
  selectedPageNumber: number | null;
  selectedTextElement: { slotId: string, elementType: 'name' | 'price' | 'badge' } | null;
  
  // YENİ SEÇİM STATE'İ
  selection: SelectionState;

  sidebarState: { activePanel: string | null; activeTab: string | null; activeSubTab: string | null };
  contextualBarFormaId: string | null;
  contextualBarSelectedPages: number[];
  editingContent: { slotId: string, contentType: 'product' | 'banner' | 'pizza' } | null;
}

export interface UIActions {
  toggleZoom: () => void;
  toggleTempPool: () => void;
  setTempPoolOpen: (isOpen: boolean) => void;
  
  // YENİ SEÇİM AKSİYONLARI
  setSelection: (selection: Partial<SelectionState>) => void;
  toggleElementSelection: (type: SelectionType, id: string, isMulti: boolean, parentId?: string | null) => void;
  
  // Eski aksiyonlar (Geçiş süreci için)
  toggleSlotSelection: (id: string, isMulti: boolean) => void;
  clearSelection: () => void;
  setSelectedPage: (pageNumber: number | null) => void;
  setSelectedTextElement: (element: { slotId: string, elementType: 'name' | 'price' | 'badge' } | null) => void;
  
  setSidebarState: (panel: string | null, tab?: string | null, subTab?: string | null) => void;
  setContextualBarFormaId: (id: string | null) => void;
  setContextualBarSelectedPages: (pages: number[]) => void;
  clearSelectionAndSelectPage: (pageNumber: number) => void;
  setEditingContent: (content: { slotId: string, contentType: 'product' | 'banner' | 'pizza' } | null) => void;
}

const initialSidebarState = {
  activePanel: "products",
  activeTab: null as string | null,
  activeSubTab: null as string | null,
};

export const useUIStore = create<UIState & UIActions>()((set, get) => ({
  isZoomed: false,
  isTempPoolOpen: false,
  selectedSlotIds: [], // deprecated
  selectedPageNumber: null, // deprecated
  selectedTextElement: null, // deprecated
  
  selection: { type: 'none', ids: [] },

  sidebarState: initialSidebarState,
  contextualBarFormaId: "1",
  contextualBarSelectedPages: [],
  editingContent: null,

  toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),
  toggleTempPool: () => set((state) => ({ isTempPoolOpen: !state.isTempPoolOpen })),
  setTempPoolOpen: (isOpen) => set(() => ({ isTempPoolOpen: isOpen })),

  setSelection: (selectionUpdates) => set((state) => {
    const newSelection = { ...state.selection, ...selectionUpdates } as SelectionState;
    return {
      selection: newSelection,
      // Geriye dönük uyumluluk için senkronize edelim
      selectedSlotIds: newSelection.type === 'slot' ? newSelection.ids : [],
      selectedPageNumber: null,
      selectedTextElement: newSelection.type === 'textElement' ? { slotId: newSelection.parentId || '', elementType: newSelection.textElementType || 'name' } : null,
      sidebarState: {
        ...state.sidebarState
      }
    };
  }),

  toggleElementSelection: (type, id, isMulti, parentId = null) => set((state) => {
    let newSelectionIds: string[] = [];
    
    // Eğer başka tipte bir eleman seçiliyse veya selection null ise baştan başlat
    if (state.selection.type !== type || state.selection.parentId !== parentId) {
      newSelectionIds = [id];
    } else {
      if (isMulti) {
        if (state.selection.ids.includes(id)) {
          newSelectionIds = state.selection.ids.filter(x => x !== id);
        } else {
          newSelectionIds = [...state.selection.ids, id];
        }
      } else {
        newSelectionIds = [id];
      }
    }
    
    const newSelection: SelectionState = {
      type: newSelectionIds.length === 0 ? 'none' : type,
      ids: newSelectionIds,
      parentId
    };

    return {
      selection: newSelection,
      // Eski yapıyı besle (Geriye dönük uyumluluk)
      selectedSlotIds: newSelection.type === 'slot' ? newSelection.ids : [],
      selectedPageNumber: null,
      selectedTextElement: null,
      sidebarState: {
        ...state.sidebarState
      }
    };
  }),

  toggleSlotSelection: (id, isMulti) => {
    get().toggleElementSelection('slot', id, isMulti);
  },

  clearSelection: () => set(() => ({ 
    selection: { type: 'none', ids: [] },
    selectedSlotIds: [],
    selectedPageNumber: null,
    selectedTextElement: null,
  })),

  setSelectedPage: (pageNumber) => {
    if (pageNumber === null) {
      set({ selectedPageNumber: null, selection: { type: 'none', ids: [] }, selectedSlotIds: [] });
      return;
    }
    set({
      selectedPageNumber: pageNumber,
      selectedSlotIds: [],
      selection: { type: 'none', ids: [] },
      contextualBarSelectedPages: [pageNumber]
    });
  },

  setSelectedTextElement: (element) => {
    if (!element) {
      set({ selectedTextElement: null, selection: { type: 'none', ids: [] } });
    } else {
      set({ 
        selectedTextElement: element,
        selection: { 
          type: 'textElement', 
          ids: [`${element.slotId}-${element.elementType}`], 
          parentId: element.slotId, 
          textElementType: element.elementType 
        }
      });
    }
  },

  setContextualBarFormaId: (id) => set({ contextualBarFormaId: id }),
  setContextualBarSelectedPages: (pages) => set({ contextualBarSelectedPages: pages }),

  setEditingContent: (content) => set({ editingContent: content }),

  setSidebarState: (panel, tab = null, subTab = null) => set(() => ({
    sidebarState: { activePanel: panel, activeTab: tab, activeSubTab: subTab }
  })),
  
  clearSelectionAndSelectPage: (pageNumber: number) => {
    get().clearSelection();
    get().setSelectedPage(pageNumber);
  },
}));