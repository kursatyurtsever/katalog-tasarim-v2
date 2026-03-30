import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Template1, availableTemplates } from "@/lib/templates";
import type { BrochureTemplate } from "@/lib/templates";
import { useLayerStore } from "./useLayerStore";
import { Layer } from "../types/document";
import { v4 as uuidv4 } from "uuid";

import { TypographyData } from "@/components/TypographyPicker";
import { BorderRadiusData } from "@/components/BorderRadiusPicker";
import { SpacingData } from "@/components/SpacingPicker";
import { ShadowData } from "@/components/ShadowPicker";

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export const defaultTypography: TypographyData = { fontFamily: "Inter", fontWeight: "400", fontSize: 12, lineHeight: 1.2, letterSpacing: 0, textAlign: "left", verticalAlign: "middle", textTransform: "none", textDecoration: "none", color: "#000000", opacity: 100, decimalScale: 100 };
export const defaultRadius: BorderRadiusData = { tl: 8, tr: 8, bl: 8, br: 8, linked: true };
export const defaultSpacing: SpacingData = { t: 8, r: 8, b: 8, l: 8, linked: true };
export const defaultShadow: ShadowData = { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, active: false };

// DEPRECATED: Will be replaced by useLayerStore

// DEPRECATED: Will be replaced by useLayerStore

export interface ProductInfo {
  id?: string;
  name?: string;
  price?: string;
  image?: string;
  sku?: string;
  category?: string;
  raw?: any;
  [key: string]: unknown;
}

export interface CatalogSettings {
  gridGap: number;
  borderWidth: number;
  priceBorderWidth: number;
  pricePosition: "left" | "center" | "right";
  priceWidth: number;
  priceHeight: number;
  imageScale: number;
  imagePosX: number;
  imagePosY: number;
  imageEditMode: boolean;
  badge: {
    active: boolean;
    text: string;
    bgColor: string;
    textColor: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    shape: 'rectangle' | 'pill' | 'circle' | 'banner' | 'burst' | 'flama';
    borderColor: string;
    borderWidth: number;
    font: TypographyData;
    shadow: ShadowData;
    size: number;
    isFreePosition: boolean;
    posX: number;
    posY: number;
  };
  colors: {
    cellBg: { c: string; o: number };
    cellBorder: { c: string; o: number };
    priceBg: { c: string; o: number };
    priceBorder: { c: string; o: number };
  };
  radiuses: {
    cell: BorderRadiusData;
    price: BorderRadiusData;
  };
  fonts: {
    productName: TypographyData;
    price: TypographyData;
  };
  spacings: {
    cell: SpacingData;
  };
  shadows: {
    cell: ShadowData;
  };
    }

export interface Slot {
  id: string;
  colSpan: number;
  rowSpan: number;
  product: ProductInfo | null;
  hidden?: boolean;
  mergedInto?: string | null;
  isCustom?: boolean; 
  customSettings?: DeepPartial<CatalogSettings>;
  // YENİ: Resim ayarları hücrenin global statüsünden bağımsız tutuluyor
  imageSettings?: {
    scale?: number;
    posX?: number;
    posY?: number;
    editMode?: boolean;
  }; 
}

export interface CatalogPage {
  id: string;
  pageNumber: number;
  slots: Slot[];
  footerText: string;
  footerLogo: string | null;
  }

export interface Forma {
  id: number;
  name: string;
  pages: CatalogPage[];
  // YENİ: Sayfa grupları (Excel hücre birleştirme mantığı)
  pageMergeGroups: string[][]; // Her bir alt dizi birleştirilmiş sayfa ID'lerini tutar
    }

export interface CatalogState {
  activeTemplate: BrochureTemplate;
  formas: Forma[];
  activeFormaId: number;
  activeTab: "outer" | "inner";
  productPool: ProductInfo[]; 
  masterProductPool: ProductInfo[]; 
  globalSettings: CatalogSettings;
  copiedSlotSettings: DeepPartial<CatalogSettings> | null;
  isZoomed: boolean;
  selectedSlotIds: string[];
  selectedPageNumber: number | null;
      selectedTextElement: { slotId: string, elementType: 'name' | 'price' | 'badge' } | null;
      pastPages: CatalogPage[][];
      futurePages: CatalogPage[][];
      sidebarState: { activePanel: string | null; activeTab: string | null; activeSubTab: string | null };
                  // ContextualBar UI state'leri
      contextualBarFormaId: string | null;
  contextualBarSelectedPages: number[];
}

export interface CatalogActions {
  setActiveTemplate: (templateId: string) => void;
  setActiveTab: (tab: "outer" | "inner") => void;
  setActiveFormaId: (id: number) => void;
  setFormas: (formas: Forma[]) => void;
  setGlobalSettings: (settings: DeepPartial<CatalogSettings>) => void;
  updateGlobalSettings: (settings: any) => void;  setSelectedPage: (pageNumber: number | null) => void;
  setContextualBarFormaId: (id: string | null) => void;
  setContextualBarSelectedPages: (pages: number[]) => void;
  updatePageFooter: (pageNumber: number, data: Partial<{ footerText: string; footerLogo: string | null }>) => void;  swapSlotContents: (sourcePageNumber: number, sourceIndex: number, targetPageNumber: number, targetIndex: number) => void;
  toggleZoom: () => void;
  setProductPool: (products: ProductInfo[]) => void;
  setMasterProductPool: (products: ProductInfo[]) => void;
  autoFillSlots: () => void;
  clearProducts: () => void;
  resetCatalog: () => void;
  toggleSlotSelection: (id: string, isMulti: boolean) => void;
  clearSelection: () => void;
  setSelectedTextElement: (element: { slotId: string, elementType: 'name' | 'price' | 'badge' } | null) => void;
  disableAllImageEditModes: () => void;
  mergeSelected: (pageNumber: number, targetSlotId: string) => { success: boolean; error?: string };
  unmergeSlot: (pageNumber: number, slotId: string) => void;
  undo: () => void;
  redo: () => void;
  toggleSlotCustomSettings: (enabled: boolean) => void;
  updateSlotCustomSettings: (settings: DeepPartial<CatalogSettings>) => void;
  copySlotSettings: () => void;
  pasteSlotSettings: () => void;
  clearSlotSettings: () => void;
  clearSlot: (pageNumber: number, slotId: string) => void;
  setSlotProduct: (pageNumber: number, slotId: string, product: ProductInfo) => void;
  updateSlotProduct: (pageNumber: number, slotId: string, updates: Partial<ProductInfo>) => void;
  updateSlotImageSettings: (pageNumber: number, slotId: string, settings: any) => void;
  setSidebarState: (panel: string | null, tab?: string | null, subTab?: string | null) => void;
  clearSelectionAndSelectPage: (pageNumber: number) => void;
  // YENİ: Sayfa Gruplama İşlemleri
  mergePages: (pageIds: string[]) => void;
  unmergePages: (pageIds: string[]) => void;
}

const initialGlobalSettings: CatalogSettings = {
  gridGap: 0,
  borderWidth: 1,
  priceBorderWidth: 0,
  pricePosition: "right",
  priceWidth: 50,
  priceHeight: 10,
  imageScale: 100,
  imagePosX: 0,
  imagePosY: 0,
  imageEditMode: false,
  badge: {
    active: false,
    text: "YENİ",
    bgColor: "#e60000",
    textColor: "#ffffff",
    position: "top-left",
    shape: 'rectangle',
    borderColor: "#ffffff",
    borderWidth: 2,
    font: { ...defaultTypography, fontFamily: "Inter", fontWeight: "900", fontSize: 10, textAlign: "center", color: "#ffffff" },
    shadow: { ...defaultShadow, active: false },
    size: 100,
    isFreePosition: false,
    posX: 0,
    posY: 0,
  },
  colors: {
    cellBg: { c: "#ffffff", o: 100 },
    cellBorder: { c: "#e2e8f0", o: 100 },
    priceBg: { c: "#e60000", o: 100 },
    priceBorder: { c: "#ffffff", o: 100 }
  },
  radiuses: {
    cell: { ...defaultRadius, tl: 0, tr: 0, bl: 0, br: 0 },
    price: { ...defaultRadius, tl: 0, tr: 0, bl: 0, br: 4, linked: false }
  },
  fonts: {
    productName: { ...defaultTypography, fontFamily: "Inter", fontWeight: "700", fontSize: 10, textAlign: "center", verticalAlign: "bottom", color: "#1e293b" },
    price: { ...defaultTypography, fontFamily: "Inter", fontWeight: "900", fontSize: 20, textAlign: "center", verticalAlign: "middle", color: "#ffffff", decimalScale: 55 }
  },
  spacings: {
    cell: { ...defaultSpacing, t: 0, r: 0, b: 0, l: 0 }
  },
  shadows: {
    cell: { ...defaultShadow, active: false }
  },
  
  
};

const initialSidebarState = {
  activePanel: "products",
  activeTab: null as string | null,
  activeSubTab: null as string | null,
};

function createPageSlots(pageNumber: number, count: number): Slot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `page-${pageNumber}-slot-${i + 1}`,
    colSpan: 1, rowSpan: 1, product: null, hidden: false, mergedInto: null, isCustom: false,
  }));
}

function buildPagesForTemplate(template: BrochureTemplate): CatalogPage[] {
  return template.pages.map((p) => ({
    id: `page-${p.pageNumber}`,
    pageNumber: p.pageNumber,
    slots: createPageSlots(p.pageNumber, 16),
    footerText: "Sayfa altı notu...",
    footerLogo: null,
    
  }));
}

function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}


function buildFormasForTemplate(template: BrochureTemplate): Forma[] {
  const pages = buildPagesForTemplate(template);
  const splitIndex = Math.ceil(pages.length / 2);
  
  const createInitialGroups = (formPages: CatalogPage[]) => 
    formPages.map(p => [p.id]);

  const p1 = pages.slice(0, splitIndex);
  const p2 = pages.slice(splitIndex);

  return [
    {
      id: 1,
      name: "Forma 1 (Kapaklar)",
      pages: p1,
      pageMergeGroups: createInitialGroups(p1),
      
      
    },
    {
      id: 2,
      name: "Forma 2 (İç Sayfalar)",
      pages: p2,
      pageMergeGroups: createInitialGroups(p2),
      
      
    },
  ];
}

function getActivePages(state: CatalogState): CatalogPage[] {
  return state.formas.find((f) => f.id === state.activeFormaId)?.pages || [];
}

function setActivePages(state: CatalogState, pages: CatalogPage[]): Forma[] {
  return state.formas.map((forma) =>
    forma.id === state.activeFormaId ? { ...forma, pages } : forma
  );
}

function isObject(item: any) { return (item && typeof item === 'object' && !Array.isArray(item)); }
function deepMerge(target: any, source: any) {
  if (!target) return source;
  if (!source) return target;
  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (isObject(source[key]) && key in target && isObject(target[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}

function normalizeCatalogPage(page: CatalogPage): CatalogPage {
  return {
    ...page,
    
  };
}

function normalizeForma(forma: Forma): Forma {
  return {
    ...forma,
    pages: (forma.pages || []).map(normalizeCatalogPage),
    
    
    // Her zaman pageMergeGroups'un dolu olmasını garantile
    pageMergeGroups: (forma.pageMergeGroups && forma.pageMergeGroups.length > 0)
      ? forma.pageMergeGroups
      : (forma.pages || []).map(p => [p.id]),
  };
}

export const useCatalogStore = create<CatalogState & CatalogActions>()(
  persist(
    (set, get) => ({
      activeTemplate: Template1,
      activeFormaId: 1,
      activeTab: "outer",
      formas: buildFormasForTemplate(Template1),
      productPool: [],
      masterProductPool: [],
      globalSettings: cloneDeep(initialGlobalSettings),
      copiedSlotSettings: null,
      isZoomed: false,
      selectedSlotIds: [],
      selectedPageNumber: null,
      selectedTextElement: null,
      pastPages: [],
      futurePages: [],
      sidebarState: initialSidebarState,
      
      
      contextualBarFormaId: "1",
      contextualBarSelectedPages: [],

      undo: () => set((state) => {
        if (!state.pastPages || state.pastPages.length === 0) return state;
        const previous = state.pastPages[state.pastPages.length - 1];
        const newPast = state.pastPages.slice(0, -1);
        const currentPages = getActivePages(state);
        return {
          pastPages: newPast,
          futurePages: [cloneDeep(currentPages), ...(state.futurePages || [])],
          formas: setActivePages(state, previous),
          selectedSlotIds: [],
          selectedPageNumber: null,
        };
      }),

      redo: () => set((state) => {
        if (!state.futurePages || state.futurePages.length === 0) return state;
        const next = state.futurePages[0];
        const newFuture = state.futurePages.slice(1);
        const currentPages = getActivePages(state);
        return {
          pastPages: [...(state.pastPages || []), cloneDeep(currentPages)],
          futurePages: newFuture,
          formas: setActivePages(state, next),
          selectedSlotIds: [],
          selectedPageNumber: null,
        };
      }),

      toggleSlotSelection: (id, isMulti) => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        newPages.forEach(p => p.slots.forEach(s => {
          if (s.isCustom && s.customSettings) {
            s.customSettings.imageEditMode = false;
            if (s.customSettings.badge) s.customSettings.badge.isFreePosition = false;
          }
        }));

        let newSelectedIds = [];
        if (isMulti) {
          if (state.selectedSlotIds.includes(id)) newSelectedIds = state.selectedSlotIds.filter((x) => x !== id);
          else newSelectedIds = [...state.selectedSlotIds, id];
        } else {
          newSelectedIds = state.selectedSlotIds[0] === id && state.selectedSlotIds.length === 1 ? [] : [id];
        }
        
        return { 
          selectedSlotIds: newSelectedIds,
          selectedPageNumber: null,
          selectedTextElement: null,
          formas: setActivePages(state, newPages),
          globalSettings: { ...state.globalSettings, imageEditMode: false }
        };
      }),

      clearSelection: () => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        newPages.forEach(p => p.slots.forEach(s => {
          if (s.isCustom && s.customSettings) {
            s.customSettings.imageEditMode = false;
            if (s.customSettings.badge) s.customSettings.badge.isFreePosition = false;
          }
        }));
        
        return { 
          selectedSlotIds: [],
          selectedPageNumber: null,
          selectedTextElement: null,
          formas: setActivePages(state, newPages),
          globalSettings: { ...state.globalSettings, imageEditMode: false }
        };
      }),

      setSelectedPage: (pageNumber) => set((state) => {
        const updates: any = {
          selectedPageNumber: pageNumber,
          selectedSlotIds: [],
          selectedTextElement: null,
        };

        // Eğer bir sayfa seçiliyse ve ContextualBar'daki forma/sayfa seçimi henüz yapılmadıysa veya o formadaysak güncelle
        if (pageNumber !== null) {
          updates.contextualBarSelectedPages = [pageNumber];
          // Sayfanın hangi formaya ait olduğunu bulalım
          const forma = state.formas.find(f => f.pages.some(p => p.pageNumber === pageNumber));
          if (forma) {
            updates.contextualBarFormaId = forma.id.toString();
          }
        }

        return updates;
      }),

      setSelectedTextElement: (element) => set({ selectedTextElement: element }),

      setContextualBarFormaId: (id) => set({ contextualBarFormaId: id }),
      setContextualBarSelectedPages: (pages) => set({ contextualBarSelectedPages: pages }),

      disableAllImageEditModes: () => set((state) => ({
        formas: setActivePages(
          state,
          getActivePages(state).map(page => ({
            ...page,
            slots: page.slots.map(slot => {
              if (slot.imageSettings?.editMode) {
                return {
                  ...slot,
                  imageSettings: { ...slot.imageSettings, editMode: false }
                };
              }
              return slot;
            })
          }))
        )
      })),

      setActiveTab: (tab) => set((state) => ({
        activeTab: tab,
        activeFormaId: tab === "inner" ? 2 : 1,
        selectedSlotIds: [],
        selectedPageNumber: null,
        selectedTextElement: null,
      })),

      setActiveFormaId: (id) => set((state) => {
        const forma = state.formas.find(f => f.id === id);
        return {
          activeFormaId: id,
          activeTab: id === 2 ? "inner" : "outer",
          selectedSlotIds: [],
          selectedPageNumber: null,
          selectedTextElement: null,
          contextualBarFormaId: id.toString(),
          contextualBarSelectedPages: [] // Forma değişince sayfaları sıfırla (tüm forma seçili olsun diye boş bırakıyoruz veya ilk sayfayı seçebiliriz)
        };
      }),

      setFormas: (formas) => set(() => ({ formas })),

      setActiveTemplate: (templateId) => {
        const tmpl = availableTemplates.find((t) => t.id === templateId);
        if (!tmpl) return;
        set({
          activeTemplate: tmpl,
          formas: buildFormasForTemplate(tmpl),
          activeFormaId: 1,
          activeTab: "outer",
          selectedSlotIds: [],
          selectedPageNumber: null,
          selectedTextElement: null,
          pastPages: [],
          futurePages: []
        });
      },
      
      setGlobalSettings: (settings) => set((state) => ({ 
        globalSettings: deepMerge(state.globalSettings, settings) 
      })),

      updateGlobalSettings: (settings) => set((state) => ({
        globalSettings: { ...state.globalSettings, ...settings }
      })),



      updatePageFooter: (pageNum, data) => set((state) => ({
        formas: setActivePages(
          state,
          getActivePages(state).map((p) => p.pageNumber === pageNum ? { ...p, ...data } : p)
        )
      })),
      
      toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),
      setProductPool: (products) => set({ productPool: products }),
      setMasterProductPool: (products) => set({ masterProductPool: products }),

      autoFillSlots: () => set((state) => {
        const newFormas = cloneDeep(state.formas);
        const allPages = newFormas.flatMap(f => f.pages).sort((a, b) => a.pageNumber - b.pageNumber);
        const allValidSlots: any[] = [];
        
        allPages.forEach(p => {
          p.slots.forEach((s) => {
            if (!s.hidden) {
              allValidSlots.push(s);
            }
          });
        });
        
        // Önce tüm hücreleri temizle
        allValidSlots.forEach(s => s.product = null);
        
        // Ürünleri POS/SIRA değerine göre global sıraya yerleştir
        state.productPool.forEach((product) => {
          let posValue = 0;
          if (product.raw) {
            const keys = Object.keys(product.raw);
            const posKey = keys.find(k => {
              const uk = k.trim().toUpperCase();
              return uk === "POS" || uk === "SIRA" || uk === "INDEX";
            });
            
            if (posKey) {
              const rawValue = product.raw[posKey];
              const rawString = String(rawValue);
              const match = rawString.match(/\d+/); 
              posValue = match ? parseInt(match[0], 10) : 0;
            }
          }

          if (!isNaN(posValue) && posValue > 0 && posValue <= allValidSlots.length) {
            const autoImage = product.image || (product.sku ? `/images/products/${product.sku}.png` : null);
            allValidSlots[posValue - 1].product = { ...product, image: autoImage || product.image };
          }
        });
        
        return {
          formas: newFormas,
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(getActivePages(state))],
          futurePages: []
        };
      }),

      clearProducts: () => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        newPages.forEach(p => p.slots.forEach(s => s.product = null));
        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      clearSlot: (pageNumber, slotId) => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot) slot.product = null; }
        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      setSlotProduct: (pageNumber, slotId, product) => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot) slot.product = product; }
        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      updateSlotProduct: (pageNumber, slotId, updates) => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot && slot.product) slot.product = { ...slot.product, ...updates }; }
        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      updateSlotImageSettings: (pageNumber, slotId, settings) => set((state) => ({
        formas: setActivePages(
          state,
          getActivePages(state).map((p) => p.pageNumber === pageNumber ? {
            ...p,
            slots: p.slots.map(s => s.id === slotId ? {
              ...s,
              imageSettings: { ...(s.imageSettings || {}), ...settings }
            } : s)
          } : p)
        )
      })),

      setSidebarState: (panel, tab = null, subTab = null) => set(() => ({
        sidebarState: { activePanel: panel, activeTab: tab, activeSubTab: subTab }
      })),

      resetCatalog: () => set((state) => ({
        formas: buildFormasForTemplate(state.activeTemplate),
        activeFormaId: 1,
        activeTab: "outer",
        selectedSlotIds: [],
        selectedPageNumber: null,
        selectedTextElement: null,
        globalSettings: cloneDeep(initialGlobalSettings),
        pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(getActivePages(state))],
        futurePages: []
      })),

      swapSlotContents: (sPageNum, sIdx, tPageNum, tIdx) => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        const sPage = newPages.find(p => p.pageNumber === sPageNum), tPage = newPages.find(p => p.pageNumber === tPageNum);
        if (!sPage || !tPage) return state;
        const sourceSlot = sPage.slots[sIdx];
        const targetSlot = tPage.slots[tIdx];

        // 1. Ürün takası
        const tempProduct = sourceSlot.product;
        sourceSlot.product = targetSlot.product;
        targetSlot.product = tempProduct;

        // 2. Resim Ayarları (Büyütme/Kaydırma) takası
        const tempImgSettings = sourceSlot.imageSettings;
        sourceSlot.imageSettings = targetSlot.imageSettings;
        targetSlot.imageSettings = tempImgSettings;

        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      mergeSelected: (pageNumber, targetSlotId) => {
        const state = get();
        const currentPages = getActivePages(state);
        const pageIndex = currentPages.findIndex((p) => p.pageNumber === pageNumber);
        if (pageIndex < 0) return { success: false, error: "Sayfa bulunamadı." };
        const page = currentPages[pageIndex];
        const selected = state.selectedSlotIds;
        
        const targetSlot = page.slots.find(s => s.id === targetSlotId);
        const targetProduct = targetSlot ? targetSlot.product : null;

        const maxCols = 4;
        const grid: (string | null)[][] = [];
        const coords: Record<string, { r: number; c: number; w: number; h: number }> = {};
        let r = 0, c = 0;
        
        let startIndex = (page.pageNumber === 1 ? 4 : page.pageNumber === 6 ? 8 : 0);
        
        page.slots.slice(startIndex).filter(s => !s.hidden).forEach((slot) => {
          let placed = false;
          while (!placed) {
            if (!grid[r]) grid[r] = Array(maxCols).fill(null);
            if (grid[r][c] === null) {
              let canFit = true;
              if (c + slot.colSpan > maxCols) canFit = false;
              else {
                for (let ir = 0; ir < slot.rowSpan; ir++) {
                  if (!grid[r + ir]) grid[r + ir] = Array(maxCols).fill(null);
                  for (let ic = 0; ic < slot.colSpan; ic++) {
                    if (grid[r + ir][c + ic] !== null) { canFit = false; break; }
                  }
                  if (!canFit) break;
                }
              }
              if (canFit) {
                for (let ir = 0; ir < slot.rowSpan; ir++) {
                  for (let ic = 0; ic < slot.colSpan; ic++) grid[r + ir][c + ic] = slot.id;
                }
                coords[slot.id] = { r, c, w: slot.colSpan, h: slot.rowSpan };
                placed = true;
              }
            }
            if (!placed) { c++; if (c >= maxCols) { c = 0; r++; } }
          }
        });

        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity, totalArea = 0;
        selected.forEach(id => {
          const ci = coords[id];
          if (ci) { 
            minR = Math.min(minR, ci.r); maxR = Math.max(maxR, ci.r + ci.h - 1); 
            minC = Math.min(minC, ci.c); maxC = Math.max(maxC, ci.c + ci.w - 1); 
            totalArea += (ci.w * ci.h);
          }
        });

        const expectedArea = (maxR - minR + 1) * (maxC - minC + 1);
        if (totalArea !== expectedArea) return { success: false, error: "Hatalı Seçim: Yalnızca kare veya dikdörtgen formunda birleştirme yapabilirsiniz." };

        const survivorId = grid[minR][minC];
        if (!survivorId || !selected.includes(survivorId)) return { success: false, error: "Hücre yerleşimi hesaplanamadı." };

        const newSlots = [...page.slots];
        const survivorIdx = newSlots.findIndex(s => s.id === survivorId);
        
        newSlots[survivorIdx] = { 
          ...newSlots[survivorIdx], 
          colSpan: maxC - minC + 1, 
          rowSpan: maxR - minR + 1, 
          product: targetProduct 
        };

        selected.filter(id => id !== survivorId).forEach(id => {
          const idx = newSlots.findIndex(s => s.id === id);
          newSlots[idx] = { ...newSlots[idx], hidden: true, mergedInto: survivorId, product: null };
        });

        const newPages = [...currentPages];
        newPages[pageIndex] = { ...page, slots: newSlots };
        set({
          formas: setActivePages(state, newPages),
          selectedSlotIds: [],
          selectedPageNumber: null,
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        });
        return { success: true };
      },

      unmergeSlot: (pageNumber, slotId) => {
        const state = get();
        const currentPages = getActivePages(state);
        const pageIndex = currentPages.findIndex((p) => p.pageNumber === pageNumber);
        if (pageIndex < 0) return;
        const page = currentPages[pageIndex];
        const newSlots = [...page.slots];
        const survivorIdx = newSlots.findIndex((s) => s.id === slotId);
        newSlots[survivorIdx] = { ...newSlots[survivorIdx], colSpan: 1, rowSpan: 1 };
        newSlots.forEach((s, i) => { if (s.mergedInto === slotId) newSlots[i] = { ...s, hidden: false, mergedInto: null, product: null }; });
        const newPages = [...currentPages];
        newPages[pageIndex] = { ...page, slots: newSlots };
        set({
          formas: setActivePages(state, newPages),
          selectedSlotIds: [],
          selectedPageNumber: null,
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        });
      },

      toggleSlotCustomSettings: (enabled) => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        state.selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => { if (s.id === id) { s.isCustom = enabled; if (enabled && !s.customSettings) s.customSettings = JSON.parse(JSON.stringify(state.globalSettings)); } }));
        });
        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      updateSlotCustomSettings: (settings) => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        state.selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => { 
            if (s.id === id && s.isCustom) {
              s.customSettings = deepMerge(s.customSettings || {}, settings);
            } 
          }));
        });
        return { formas: setActivePages(state, newPages) };
      }),

      copySlotSettings: () => set((state) => {
        if (state.selectedSlotIds.length !== 1) return state;
        let settingsToCopy = null;
        getActivePages(state).forEach(p => p.slots.forEach(s => {
          if (s.id === state.selectedSlotIds[0]) {
            settingsToCopy = s.isCustom && s.customSettings ? s.customSettings : state.globalSettings;
          }
        }));
        return { copiedSlotSettings: settingsToCopy ? JSON.parse(JSON.stringify(settingsToCopy)) : null };
      }),

      pasteSlotSettings: () => set((state) => {
        if (!state.copiedSlotSettings || state.selectedSlotIds.length === 0) return state;
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        state.selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => {
            if (s.id === id) {
              s.isCustom = true;
              const copied = JSON.parse(JSON.stringify(state.copiedSlotSettings));
              copied.imageEditMode = false;
              if (copied.badge) copied.badge.isFreePosition = false;
              s.customSettings = copied;
            }
          }));
        });
        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      clearSlotSettings: () => set((state) => {
        if (state.selectedSlotIds.length === 0) return state;
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
        state.selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => {
            if (s.id === id) {
              s.isCustom = false;
              s.customSettings = undefined;
            }
          }));
        });
        return { 
          formas: setActivePages(state, newPages), 
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)], 
          futurePages: [] 
        };
      }),

      clearSelectionAndSelectPage: (pageNumber: number) => {
        const state = get();
        state.clearSelection();
        state.setSelectedPage(pageNumber);
      },

      mergePages: (pageIds: string[]) => set((state) => {
        if (pageIds.length < 2) return state;

        const newFormas = state.formas.map(forma => {
          // Sadece seçili sayfaları içeren formayı güncelle
          const hasSelectedPages = pageIds.some(id => forma.pages.some(p => p.id === id));
          if (!hasSelectedPages) return forma;

          // Seçili sayfaları mevcut gruplardan çıkar
          const groups = forma.pageMergeGroups || forma.pages.map(p => [p.id]);
          const remainingGroups = groups.filter(
            group => !group.some(id => pageIds.includes(id))
          );

          // Yeni birleşmiş grubu ekle
          return {
            ...forma,
            pageMergeGroups: [...remainingGroups, pageIds]
          };
        });

        return { formas: newFormas };
      }),

      unmergePages: (pageIds: string[]) => set((state) => {
        const newFormas = state.formas.map(forma => {
          const hasSelectedPages = pageIds.some(id => forma.pages.some(p => p.id === id));
          if (!hasSelectedPages) return forma;

          // Seçili sayfaların bulunduğu grupları tespit et ve parçala
          const groups = forma.pageMergeGroups || forma.pages.map(p => [p.id]);
          const newGroups: string[][] = [];
          groups.forEach(group => {
            if (group.some(id => pageIds.includes(id))) {
              // Grubu parçala: her ID kendi grubu olsun
              group.forEach(id => newGroups.push([id]));
            } else {
              newGroups.push(group);
            }
          });

          return {
            ...forma,
            pageMergeGroups: newGroups
          };
        });

        return { formas: newFormas };
      }),
    }),
    {
      name: "catalog-storage-v2",
      // Persist edilmiş eski state'i yeni defaultlarla güvenli şekilde birleştir
      merge: (persisted, current) => {
        // persisted veya current undefined ise fallback
        const incoming = (persisted as any) || {};
        const base = current as any;
        const baseState = base?.state || {};
        // globalSettings deep merge
        const mergedGlobal = deepMerge(baseState.globalSettings || initialGlobalSettings, incoming?.state?.globalSettings || {});
        const normalizedGlobalSettings: CatalogSettings = {
          ...mergedGlobal,
          
          
        };

        const incomingState = { ...(incoming?.state || {}) };
        const formas = (incomingState.formas || baseState.formas || buildFormasForTemplate(baseState.activeTemplate || Template1)).map(normalizeForma);

        // Eski persist yapısından kalan pages state'i varsa migrasyon amaçlı aktif formaya uygula
        if (!incomingState.formas && Array.isArray(incomingState.pages)) {
          incomingState.formas = (formas || []).map((f: Forma) =>
            f.id === (incomingState.activeFormaId || baseState.activeFormaId || 1)
              ? { ...f, pages: incomingState.pages.map(normalizeCatalogPage) }
              : f
          );
        }

        return {
          ...base,
          ...incoming,
          state: {
            ...baseState,
            ...incomingState,
            formas: (incomingState.formas || formas).map(normalizeForma),
            activeFormaId: incomingState.activeFormaId || baseState.activeFormaId || 1,
            activeTab: incomingState.activeTab || (incomingState.activeFormaId === 2 ? "inner" : "outer"),
            globalSettings: normalizedGlobalSettings,
            
            
            contextualBarFormaId: incomingState.contextualBarFormaId || baseState.contextualBarFormaId || "1",
            contextualBarSelectedPages: incomingState.contextualBarSelectedPages || baseState.contextualBarSelectedPages || [],
          }
        };
      },

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const { addLayer, layers } = useLayerStore.getState();
        const template = state.activeTemplate;
        if (!template) return;

        // Migration Helper
        const migrateBackground = (bg: any, maskType: "page" | "spread" | "document", targetIds: string[], bounds: { x: number; y: number; w: number; h: number }) => {
          // Eğer zaten bu maskeye sahip bir katman varsa (veya varsayılan beyaz renkteyse) geç
          const isDefault = bg.type === "color" && bg.color === "#ffffff" && bg.opacity === 100 && !bg.imageUrl;
          if (isDefault) return;

          const newLayer: Layer = {
            id: uuidv4(),
            type: bg.type === "image" ? "image" : "solid",
            name: `Migrated ${maskType === "page" ? "Page" : maskType === "spread" ? "Spread" : "Global"} BG`,
            bounds: bounds,
            transform: { rotation: bg.rotation || 0, scale: bg.scale || 100, flipX: bg.flipX || false, flipY: bg.flipY || false, offsetX: bg.offsetX || 0, offsetY: bg.offsetY || 0 },
            mask: { type: maskType, targetIds, excludeGaps: maskType !== "page" },
            zIndex: 0,
            properties: bg.type === "image"
              ? { imageUrl: bg.imageUrl, opacity: bg.imageOpacity ?? bg.opacity ?? 100, fitMode: bg.fitMode || "cover", blendMode: bg.blendMode || "normal" }
              : { color: bg.color, opacity: bg.opacity ?? 100 },
            visible: true
          };
          addLayer(newLayer);
        };

        let migrationCount = 0;

        // 1. Global Background Migration (Broşür geneli)
        if ((state as any).isGlobalActive && (state as any).globalBackground) {
          migrateBackground((state as any).globalBackground, "document", [], { x: 0, y: 0, w: template.openWidthMm, h: template.openHeightMm });
          (state as any).isGlobalActive = false;
          migrationCount++;
        }

         // 2. Forma & Sayfa Bazlı Migrasyon
        state.formas.forEach(forma => {
          // Sayfa gruplarını garantiye al
          if (!forma.pageMergeGroups) {
            forma.pageMergeGroups = forma.pages.map(p => [p.id]);
          }

          // Forma spread arka planı
          if ((forma as any).isGlobalBackgroundActive && (forma as any).globalBackground) {
            migrateBackground((forma as any).globalBackground, "spread", forma.pages.map(p => p.id), { x: 0, y: 0, w: template.openWidthMm, h: template.openHeightMm });
            (forma as any).isGlobalBackgroundActive = false;
            migrationCount++;
          }

          // Tekil sayfa arka planları
          forma.pages.forEach(page => {
            if ((page as any).background) {
              // Sayfa OFFSET hesaplama (mm)
              const pageIndex = template.pages.findIndex(p => p.pageNumber === page.pageNumber);
              if (pageIndex !== -1) {
                const xOffset = template.pages.slice(0, pageIndex).reduce((sum, p) => sum + p.widthMm, 0);
                const pageWidth = template.pages[pageIndex].widthMm;
                
                migrateBackground((page as any).background, "page", [page.id], { x: xOffset, y: 0, w: pageWidth, h: template.openHeightMm });
                (page as any).background = undefined; // Legacy veriyi sil
                migrationCount++;
              }
            }
          });
        });

        if (migrationCount > 0) {
          console.log(`[LMS Migration] ${migrationCount} legacy background(s) migrated to layers.`);
        }
      }
    }
  )
);
