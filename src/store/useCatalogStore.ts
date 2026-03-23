import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Template1, availableTemplates, getSlotCountForPage } from "@/lib/templates";
import type { BrochureTemplate } from "@/lib/templates";

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

export interface CatalogState {
  activeTab: "outer" | "inner";
  activeTemplate: BrochureTemplate;
  pages: CatalogPage[];
  productPool: ProductInfo[]; 
  masterProductPool: ProductInfo[]; 
  globalSettings: CatalogSettings;
  copiedSlotSettings: DeepPartial<CatalogSettings> | null;
  isZoomed: boolean;
  selectedSlotIds: string[];
  selectedTextElement: { slotId: string, elementType: 'name' | 'price' | 'badge' } | null;
  pastPages: CatalogPage[][];
  futurePages: CatalogPage[][];
}

export interface CatalogActions {
  setActiveTab: (tab: "outer" | "inner") => void;
  setActiveTemplate: (templateId: string) => void;
  setGlobalSettings: (settings: DeepPartial<CatalogSettings>) => void;
  updateGlobalSettings: (settings: any) => void;
  updatePageFooter: (pageNumber: number, data: Partial<{ footerText: string; footerLogo: string | null }>) => void;
  swapSlotContents: (sourcePage: number, sourceIndex: number, targetPage: number, targetIndex: number) => void;
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
}

const initialGlobalSettings: CatalogSettings = {
  gridGap: 0,
  borderWidth: 1,
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
    priceBg: { c: "#e60000", o: 100 }
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
    cell: { ...defaultSpacing, t: 8, r: 8, b: 8, l: 8 }
  },
  shadows: {
    cell: { ...defaultShadow, active: false }
  }
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
    footerLogo: null
  }));
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
      activeTab: "outer",
      activeTemplate: Template1,
      pages: buildPagesForTemplate(Template1),
      productPool: [],
      masterProductPool: [],
      globalSettings: initialGlobalSettings,
      copiedSlotSettings: null,
      isZoomed: false,
      selectedSlotIds: [],
      selectedTextElement: null,
      pastPages: [],
      futurePages: [],

      undo: () => set((state) => {
        if (!state.pastPages || state.pastPages.length === 0) return state;
        const previous = state.pastPages[state.pastPages.length - 1];
        const newPast = state.pastPages.slice(0, -1);
        return { pastPages: newPast, futurePages: [JSON.parse(JSON.stringify(state.pages)), ...(state.futurePages || [])], pages: previous, selectedSlotIds: [] };
      }),

      redo: () => set((state) => {
        if (!state.futurePages || state.futurePages.length === 0) return state;
        const next = state.futurePages[0];
        const newFuture = state.futurePages.slice(1);
        return { pastPages: [...(state.pastPages || []), JSON.parse(JSON.stringify(state.pages))], futurePages: newFuture, pages: next, selectedSlotIds: [] };
      }),

      toggleSlotSelection: (id, isMulti) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
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
          selectedTextElement: null,
          pages: newPages,
          globalSettings: { ...state.globalSettings, imageEditMode: false }
        };
      }),

      clearSelection: () => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        newPages.forEach(p => p.slots.forEach(s => {
          if (s.isCustom && s.customSettings) {
            s.customSettings.imageEditMode = false;
            if (s.customSettings.badge) s.customSettings.badge.isFreePosition = false;
          }
        }));
        
        return { 
          selectedSlotIds: [],
          selectedTextElement: null,
          pages: newPages,
          globalSettings: { ...state.globalSettings, imageEditMode: false }
        };
      }),

      setSelectedTextElement: (element) => set({ selectedTextElement: element }),

      disableAllImageEditModes: () => set((state) => ({
        pages: state.pages.map(page => ({
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
      })),

      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveTemplate: (templateId) => {
        const tmpl = availableTemplates.find((t) => t.id === templateId);
        if (!tmpl) return;
        set({ activeTemplate: tmpl, pages: buildPagesForTemplate(tmpl), pastPages: [], futurePages: [] });
      },
      
      setGlobalSettings: (settings) => set((state) => ({ 
        globalSettings: deepMerge(state.globalSettings, settings) 
      })),

      updateGlobalSettings: (settings) => set((state) => ({
        globalSettings: { ...state.globalSettings, ...settings }
      })),

      updatePageFooter: (pageNum, data) => set((state) => ({ pages: state.pages.map(p => p.pageNumber === pageNum ? { ...p, ...data } : p) })),
      toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),
      setProductPool: (products) => set({ productPool: products }),
      setMasterProductPool: (products) => set({ masterProductPool: products }),

      autoFillSlots: () => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        const validSlots: any[] = [];
        const sortedPages = [...newPages].sort((a, b) => a.pageNumber - b.pageNumber);
        
        sortedPages.forEach(p => {
          let startIdx = (p.pageNumber === 1 ? 4 : p.pageNumber === 6 ? 8 : 0);
          p.slots.forEach((s, idx) => { if (idx >= startIdx && !s.hidden) validSlots.push(s); });
        });
        
        validSlots.forEach(s => s.product = null);
        
        state.productPool.forEach((product) => {
          let posValue = 0;
          if (product.raw) {
            const keys = Object.keys(product.raw);
            const posKey = keys.find(k => k.trim().toUpperCase() === "POS");
            if (posKey) {
              const rawString = String(product.raw[posKey]);
              const match = rawString.match(/\d+/); 
              posValue = match ? parseInt(match[0], 10) : 0;
            }
          }

          if (!isNaN(posValue) && posValue > 0 && posValue <= validSlots.length) {
            const autoImage = product.image || `/images/products/${product.sku}.png`;
            validSlots[posValue - 1].product = { ...product, image: autoImage };
          }
        });
        
        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      clearProducts: () => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        newPages.forEach(p => p.slots.forEach(s => s.product = null));
        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      clearSlot: (pageNumber, slotId) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot) slot.product = null; }
        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      setSlotProduct: (pageNumber, slotId, product) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot) slot.product = product; }
        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      updateSlotProduct: (pageNumber, slotId, updates) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        const page = newPages.find(p => p.pageNumber === pageNumber);
        if (page) { const slot = page.slots.find(s => s.id === slotId); if (slot && slot.product) slot.product = { ...slot.product, ...updates }; }
        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      updateSlotImageSettings: (pageNumber, slotId, settings) => set((state) => ({
        pages: state.pages.map(p => p.pageNumber === pageNumber ? {
          ...p,
          slots: p.slots.map(s => s.id === slotId ? {
            ...s,
            imageSettings: { ...(s.imageSettings || {}), ...settings }
          } : s)
        } : p)
      })),

      resetCatalog: () => set((state) => ({
        pages: buildPagesForTemplate(state.activeTemplate),
        selectedSlotIds: [],
        selectedTextElement: null,
        globalSettings: initialGlobalSettings,
        pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))],
        futurePages: []
      })),

      swapSlotContents: (sPageNum, sIdx, tPageNum, tIdx) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
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

        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      mergeSelected: (pageNumber, targetSlotId) => {
        const state = get();
        const pageIndex = state.pages.findIndex((p) => p.pageNumber === pageNumber);
        const page = state.pages[pageIndex];
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

        const newPages = [...state.pages];
        newPages[pageIndex] = { ...page, slots: newSlots };
        set({ pages: newPages, selectedSlotIds: [], pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] });
        return { success: true };
      },

      unmergeSlot: (pageNumber, slotId) => {
        const state = get();
        const pageIndex = state.pages.findIndex((p) => p.pageNumber === pageNumber);
        const page = state.pages[pageIndex];
        const newSlots = [...page.slots];
        const survivorIdx = newSlots.findIndex((s) => s.id === slotId);
        newSlots[survivorIdx] = { ...newSlots[survivorIdx], colSpan: 1, rowSpan: 1 };
        newSlots.forEach((s, i) => { if (s.mergedInto === slotId) newSlots[i] = { ...s, hidden: false, mergedInto: null, product: null }; });
        const newPages = [...state.pages];
        newPages[pageIndex] = { ...page, slots: newSlots };
        set({ pages: newPages, selectedSlotIds: [], pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] });
      },

      toggleSlotCustomSettings: (enabled) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        state.selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => { if (s.id === id) { s.isCustom = enabled; if (enabled && !s.customSettings) s.customSettings = JSON.parse(JSON.stringify(state.globalSettings)); } }));
        });
        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      updateSlotCustomSettings: (settings) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        state.selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => { 
            if (s.id === id && s.isCustom) {
              s.customSettings = deepMerge(s.customSettings || {}, settings);
            } 
          }));
        });
        return { pages: newPages };
      }),

      copySlotSettings: () => set((state) => {
        if (state.selectedSlotIds.length !== 1) return state;
        let settingsToCopy = null;
        state.pages.forEach(p => p.slots.forEach(s => {
          if (s.id === state.selectedSlotIds[0]) {
            settingsToCopy = s.isCustom && s.customSettings ? s.customSettings : state.globalSettings;
          }
        }));
        return { copiedSlotSettings: settingsToCopy ? JSON.parse(JSON.stringify(settingsToCopy)) : null };
      }),

      pasteSlotSettings: () => set((state) => {
        if (!state.copiedSlotSettings || state.selectedSlotIds.length === 0) return state;
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
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
        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      clearSlotSettings: () => set((state) => {
        if (state.selectedSlotIds.length === 0) return state;
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        state.selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => {
            if (s.id === id) {
              s.isCustom = false;
              s.customSettings = undefined;
            }
          }));
        });
        return { 
          pages: newPages, 
          pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], 
          futurePages: [] 
        };
      }),
    }),
    { name: "catalog-storage-v2" }
  )
);