
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
import { useHistoryStore } from "./useHistoryStore";
import { useUIStore } from "./useUIStore";

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export const defaultTypography: TypographyData = { fontFamily: "Inter", fontWeight: "400", fontSize: 12, lineHeight: 1.2, letterSpacing: 0, textAlign: "left", verticalAlign: "middle", textTransform: "none", textDecoration: "none", color: "#000000", opacity: 100, decimalScale: 100 };
export const defaultRadius: BorderRadiusData = { tl: 8, tr: 8, bl: 8, br: 8, linked: true };
export const defaultSpacing: SpacingData = { t: 8, r: 8, b: 8, l: 8, linked: true };
export const defaultShadow: ShadowData = { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, active: false };

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
  defaultGrid: { rows: number; cols: number }; // EKLENDİ
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
  gridSettings?: { rows: number; cols: number }; // EKLENDİ (Sayfaya özel ezilebilir grid)
}

export interface Forma {
  id: number;
  name: string;
  pages: CatalogPage[];
  pageMergeGroups: string[][];
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
}

export interface CatalogActions {
  setActiveTemplate: (templateId: string) => void;
  setActiveTab: (tab: "outer" | "inner") => void;
  setActiveFormaId: (id: number) => void;
  setFormas: (formas: Forma[]) => void;
  setGlobalSettings: (settings: DeepPartial<CatalogSettings>) => void;
  updateGlobalSettings: (settings: any) => void;
  updatePageFooter: (pageNumber: number, data: Partial<{ footerText: string; footerLogo: string | null }>) => void;
  swapSlotContents: (sourcePageNumber: number, sourceIndex: number, targetPageNumber: number, targetIndex: number) => void;
  setProductPool: (products: ProductInfo[]) => void;
  setMasterProductPool: (products: ProductInfo[]) => void;
  autoFillSlots: () => void;
  clearProducts: () => void;
  resetCatalog: () => void;
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
  mergePages: (pageIds: string[]) => void;
  unmergePages: (pageIds: string[]) => void;
  getActivePages: () => CatalogPage[];
  setActivePages: (pages: CatalogPage[]) => void;
}

const initialGlobalSettings: CatalogSettings = {
  defaultGrid: { rows: 4, cols: 4 }, // EKLENDİ (Varsayılan 4x4)
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

      getActivePages: () => {
        const state = get();
        return state.formas.find((f) => f.id === state.activeFormaId)?.pages || [];
      },

      setActivePages: (pages) => {
        const { activeFormaId, formas } = get();
        const newFormas = formas.map((forma) =>
          forma.id === activeFormaId ? { ...forma, pages } : forma
        );
        set({ formas: newFormas });
      },

      undo: () => {
        const { past, future } = useHistoryStore.getState();
        const { getActivePages, setActivePages } = get();
        const currentPages = getActivePages();
        if (past.length > 0) {
            const previousState = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);
            useHistoryStore.setState({ past: newPast, future: [currentPages, ...future] });
            setActivePages(previousState);
        }
      },

      redo: () => {
        const { past, future } = useHistoryStore.getState();
        const { getActivePages, setActivePages } = get();
        const currentPages = getActivePages();
        if (future.length > 0) {
            const nextState = future[0];
            const newFuture = future.slice(1);
            useHistoryStore.setState({ past: [...past, currentPages], future: newFuture });
            setActivePages(nextState);
        }
      },

      disableAllImageEditModes: () => {
        const { getActivePages, setActivePages } = get();
        const newPages = getActivePages().map(page => ({
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
          }));
        setActivePages(newPages);
      },

      setActiveTab: (tab) => set((state) => ({
        activeTab: tab,
        activeFormaId: tab === "inner" ? 2 : 1,
      })),

      setActiveFormaId: (id) => set((state) => ({
        activeFormaId: id,
        activeTab: id === 2 ? "inner" : "outer",
      })),

      setFormas: (formas) => set(() => ({ formas })),

      setActiveTemplate: (templateId) => {
        const tmpl = availableTemplates.find((t) => t.id === templateId);
        if (!tmpl) return;
        set({
          activeTemplate: tmpl,
          formas: buildFormasForTemplate(tmpl),
          activeFormaId: 1,
          activeTab: "outer",
        });
        useHistoryStore.getState().clearHistory();
      },
      
      setGlobalSettings: (settings) => set((state) => ({ 
        globalSettings: deepMerge(state.globalSettings, settings) 
      })),

      updateGlobalSettings: (settings) => set((state) => ({
        globalSettings: { ...state.globalSettings, ...settings }
      })),

      updatePageFooter: (pageNum, data) => {
          const { getActivePages, setActivePages } = get();
          const newPages = getActivePages().map((p) => p.pageNumber === pageNum ? { ...p, ...data } : p);
          setActivePages(newPages);
      },
      
      setProductPool: (products) => set({ productPool: products }),
      setMasterProductPool: (products) => set({ masterProductPool: products }),

      autoFillSlots: () => {
        const { formas, productPool, getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        saveState(cloneDeep(getActivePages()));

        const newFormas = cloneDeep(formas);
        const allPages = newFormas.flatMap(f => f.pages).sort((a, b) => a.pageNumber - b.pageNumber);
        const allValidSlots: any[] = [];
        
        allPages.forEach(p => {
          p.slots.forEach((s) => {
            if (!s.hidden) {
              allValidSlots.push(s);
            }
          });
        });
        
        allValidSlots.forEach(s => s.product = null);
        
        productPool.forEach((product) => {
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
        
        set({ formas: newFormas });
      },

      clearProducts: () => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const newPages = cloneDeep(currentPages);
        newPages.forEach(p => p.slots.forEach(s => s.product = null));
        setActivePages(newPages);
      },

      resetCatalog: () => {
        const { getActivePages, activeTemplate } = get();
        const { saveState, clearHistory } = useHistoryStore.getState();
        saveState(cloneDeep(getActivePages()));
        set({
          formas: buildFormasForTemplate(activeTemplate),
          activeFormaId: 1,
          activeTab: "outer",
          globalSettings: cloneDeep(initialGlobalSettings),
        });
        clearHistory();
      },

      swapSlotContents: (sPageNum, sIdx, tPageNum, tIdx) => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const newPages = cloneDeep(currentPages);
        const sPage = newPages.find(p => p.pageNumber === sPageNum), tPage = newPages.find(p => p.pageNumber === tPageNum);
        if (!sPage || !tPage) return;
        const sourceSlot = sPage.slots[sIdx];
        const targetSlot = tPage.slots[tIdx];

        const tempProduct = sourceSlot.product;
        sourceSlot.product = targetSlot.product;
        targetSlot.product = tempProduct;

        const tempImgSettings = sourceSlot.imageSettings;
        sourceSlot.imageSettings = targetSlot.imageSettings;
        targetSlot.imageSettings = tempImgSettings;

        setActivePages(newPages);
      },

      mergeSelected: (pageNumber, targetSlotId) => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const { selectedSlotIds, clearSelection } = useUIStore.getState();

        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const pageIndex = currentPages.findIndex((p) => p.pageNumber === pageNumber);
        if (pageIndex < 0) return { success: false, error: "Sayfa bulunamadı." };

        const page = currentPages[pageIndex];
        const selected = selectedSlotIds;
        
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
        
        setActivePages(newPages);
        clearSelection();

        return { success: true };
      },

      unmergeSlot: (pageNumber, slotId) => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const { clearSelection } = useUIStore.getState();

        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const pageIndex = currentPages.findIndex((p) => p.pageNumber === pageNumber);
        if (pageIndex < 0) return;

        const page = currentPages[pageIndex];
        const newSlots = [...page.slots];
        const survivorIdx = newSlots.findIndex((s) => s.id === slotId);
        newSlots[survivorIdx] = { ...newSlots[survivorIdx], colSpan: 1, rowSpan: 1 };
        newSlots.forEach((s, i) => { if (s.mergedInto === slotId) newSlots[i] = { ...s, hidden: false, mergedInto: null, product: null }; });

        const newPages = [...currentPages];
        newPages[pageIndex] = { ...page, slots: newSlots };
        
        setActivePages(newPages);
        clearSelection();
      },

      toggleSlotCustomSettings: (enabled) => {
        const { getActivePages, setActivePages, globalSettings } = get();
        const { saveState } = useHistoryStore.getState();
        const { selectedSlotIds } = useUIStore.getState();

        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const newPages = cloneDeep(currentPages);
        selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => { if (s.id === id) { s.isCustom = enabled; if (enabled && !s.customSettings) s.customSettings = JSON.parse(JSON.stringify(globalSettings)); } }));
        });

        setActivePages(newPages);
      },

      updateSlotCustomSettings: (settings) => {
        const { getActivePages, setActivePages } = get();
        const { selectedSlotIds } = useUIStore.getState();

        const currentPages = getActivePages();
        const newPages = cloneDeep(currentPages);
        selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => { 
            if (s.id === id && s.isCustom) {
              s.customSettings = deepMerge(s.customSettings || {}, settings);
            } 
          }));
        });

        setActivePages(newPages);
      },

      copySlotSettings: () => {
        const { getActivePages, globalSettings } = get();
        const { selectedSlotIds } = useUIStore.getState();

        if (selectedSlotIds.length !== 1) return;

        let settingsToCopy = null;
        getActivePages().forEach(p => p.slots.forEach(s => {
          if (s.id === selectedSlotIds[0]) {
            settingsToCopy = s.isCustom && s.customSettings ? s.customSettings : globalSettings;
          }
        }));

        set({ copiedSlotSettings: settingsToCopy ? JSON.parse(JSON.stringify(settingsToCopy)) : null });
      },

      pasteSlotSettings: () => {
        const { getActivePages, setActivePages, copiedSlotSettings } = get();
        const { saveState } = useHistoryStore.getState();
        const { selectedSlotIds } = useUIStore.getState();

        if (!copiedSlotSettings || selectedSlotIds.length === 0) return;

        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const newPages = cloneDeep(currentPages);
        selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => {
            if (s.id === id) {
              s.isCustom = true;
              const copied = JSON.parse(JSON.stringify(copiedSlotSettings));
              copied.imageEditMode = false;
              if (copied.badge) copied.badge.isFreePosition = false;
              s.customSettings = copied;
            }
          }));
        });

        setActivePages(newPages);
      },

      clearSlotSettings: () => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const { selectedSlotIds } = useUIStore.getState();

        if (selectedSlotIds.length === 0) return;

        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const newPages = cloneDeep(currentPages);
        selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => {
            if (s.id === id) {
              s.isCustom = false;
              s.customSettings = undefined;
            }
          }));
        });

        setActivePages(newPages);
      },

      clearSlot: (pageNumber, slotId) => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const newPages = cloneDeep(currentPages);
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot) slot.product = null; }
        setActivePages(newPages);
      },

      setSlotProduct: (pageNumber, slotId, product) => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const newPages = cloneDeep(currentPages);
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot) slot.product = product; }
        setActivePages(newPages);
      },

      updateSlotProduct: (pageNumber, slotId, updates) => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const currentPages = getActivePages();
        saveState(cloneDeep(currentPages));

        const newPages = cloneDeep(currentPages);
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot && slot.product) slot.product = { ...slot.product, ...updates }; }
        setActivePages(newPages);
      },

      updateSlotImageSettings: (pageNumber, slotId, settings) => {
        const { getActivePages, setActivePages } = get();
        const newPages = getActivePages().map((p) => p.pageNumber === pageNumber ? {
            ...p,
            slots: p.slots.map(s => s.id === slotId ? {
              ...s,
              imageSettings: { ...(s.imageSettings || {}), ...settings }
            } : s)
          } : p);
          setActivePages(newPages);
      },

      mergePages: (pageIds: string[]) => set((state) => {
        if (pageIds.length < 2) return state;

        const newFormas = state.formas.map(forma => {
          const hasSelectedPages = pageIds.some(id => forma.pages.some(p => p.id === id));
          if (!hasSelectedPages) return forma;

          const groups = forma.pageMergeGroups || forma.pages.map(p => [p.id]);
          const remainingGroups = groups.filter(
            group => !group.some(id => pageIds.includes(id))
          );

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

          const groups = forma.pageMergeGroups || forma.pages.map(p => [p.id]);
          const newGroups: string[][] = [];
          groups.forEach(group => {
            if (group.some(id => pageIds.includes(id))) {
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
      merge: (persisted, current) => {
        const incoming = (persisted as any) || {};
        const base = current as any;
        const baseState = base?.state || {};
        const mergedGlobal = deepMerge(baseState.globalSettings || initialGlobalSettings, incoming?.state?.globalSettings || {});
        const normalizedGlobalSettings: CatalogSettings = {
          ...mergedGlobal,
        };

        const incomingState = { ...(incoming?.state || {}) };
        const formas = (incomingState.formas || baseState.formas || buildFormasForTemplate(baseState.activeTemplate || Template1)).map(normalizeForma);

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
          }
        };
      },
    }
  )
);

function normalizeForma(forma: Forma): Forma {
    return {
      ...forma,
      pages: (forma.pages || []).map(normalizeCatalogPage),
      pageMergeGroups: (forma.pageMergeGroups && forma.pageMergeGroups.length > 0)
        ? forma.pageMergeGroups
        : (forma.pages || []).map(p => [p.id]),
    };
  }

function normalizeCatalogPage(page: CatalogPage): CatalogPage {
return {
    ...page,
};
}
