import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Template1, availableTemplates, getSlotCountForPage } from "@/lib/templates";
import type { BrochureTemplate } from "@/lib/templates";

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

export interface Slot {
  id: string;
  colSpan: number;
  rowSpan: number;
  product: ProductInfo | null;
  hidden?: boolean;
  mergedInto?: string | null;
  isCustom?: boolean; 
  customSettings?: Partial<CatalogState["globalSettings"]>; 
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
  globalSettings: { 
    gridGap: number;
    radiusTL: number; radiusTR: number; radiusBR: number; radiusBL: number; linkRadius: boolean;
    fontFamily: string; fontWeight: string; fontStyle: string; fontSize: number; lineHeight: number; fontColor: string; textAlign: "left" | "center" | "right" | "justify";
    letterSpacing: number; textVerticalAlign: "top" | "middle" | "bottom";
    bgColor: string; bgOpacity: number; borderColor: string; borderOpacity: number; borderWidth: number;
    priceBgColor: string; priceFontColor: string;
    priceFontFamily: string; priceFontWeight: string; priceFontSize: number; priceDecimalSize: number;
    priceRadiusTL: number; priceRadiusTR: number; priceRadiusBR: number; priceRadiusBL: number; linkPriceRadius: boolean;
    priceTextAlign: "left" | "center" | "right" | "justify";
    priceTextVerticalAlign: "top" | "middle" | "bottom";
    priceLetterSpacing: number;
  };
  isZoomed: boolean;
  selectedSlotIds: string[];
  pastPages: CatalogPage[][];
  futurePages: CatalogPage[][];
}

export interface CatalogActions {
  setActiveTab: (tab: "outer" | "inner") => void;
  setActiveTemplate: (templateId: string) => void;
  setGlobalSettings: (settings: Partial<CatalogState["globalSettings"]>) => void;
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
  mergeSelected: (pageNumber: number, targetSlotId: string) => { success: boolean; error?: string };
  unmergeSlot: (pageNumber: number, slotId: string) => void;
  undo: () => void;
  redo: () => void;
  toggleSlotCustomSettings: (enabled: boolean) => void;
  updateSlotCustomSettings: (settings: Partial<CatalogState["globalSettings"]>) => void;
  clearSlot: (pageNumber: number, slotId: string) => void;
  setSlotProduct: (pageNumber: number, slotId: string, product: ProductInfo) => void;
  updateSlotProduct: (pageNumber: number, slotId: string, updates: Partial<ProductInfo>) => void;
}

const initialGlobalSettings: CatalogState["globalSettings"] = {
  gridGap: 0,
  radiusTL: 0, radiusTR: 0, radiusBR: 0, radiusBL: 0, linkRadius: true,
  fontFamily: "Inter, sans-serif", fontWeight: "700", fontStyle: "normal", fontSize: 10, lineHeight: 1.2, fontColor: "#1e293b", textAlign: "center",
  letterSpacing: 0, textVerticalAlign: "bottom",
  bgColor: "#ffffff", bgOpacity: 100, borderColor: "#e2e8f0", borderOpacity: 100, borderWidth: 1,
  priceBgColor: "#e60000", priceFontColor: "#ffffff",
  priceFontFamily: "Inter, sans-serif", priceFontWeight: "900", priceFontSize: 20, priceDecimalSize: 11,
  priceRadiusTL: 0, priceRadiusTR: 0, priceRadiusBR: 0, priceRadiusBL: 4, linkPriceRadius: false,
  priceTextAlign: "center", priceTextVerticalAlign: "middle", priceLetterSpacing: -1
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

export const useCatalogStore = create<CatalogState & CatalogActions>()(
  persist(
    (set, get) => ({
      activeTab: "outer",
      activeTemplate: Template1,
      pages: buildPagesForTemplate(Template1),
      productPool: [],
      masterProductPool: [],
      globalSettings: initialGlobalSettings,
      isZoomed: false,
      selectedSlotIds: [],
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
        if (isMulti) {
          if (state.selectedSlotIds.includes(id)) return { selectedSlotIds: state.selectedSlotIds.filter((x) => x !== id) };
          return { selectedSlotIds: [...state.selectedSlotIds, id] };
        }
        return { selectedSlotIds: state.selectedSlotIds[0] === id && state.selectedSlotIds.length === 1 ? [] : [id] };
      }),

      clearSelection: () => set({ selectedSlotIds: [] }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveTemplate: (templateId) => {
        const tmpl = availableTemplates.find((t) => t.id === templateId);
        if (!tmpl) return;
        set({ activeTemplate: tmpl, pages: buildPagesForTemplate(tmpl), pastPages: [], futurePages: [] });
      },
      setGlobalSettings: (settings) => set((state) => ({ globalSettings: { ...state.globalSettings, ...settings } })),
      updatePageFooter: (pageNum, data) => set((state) => ({ pages: state.pages.map(p => p.pageNumber === pageNum ? { ...p, ...data } : p) })),
      toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),
      setProductPool: (products) => set({ productPool: products }),
      setMasterProductPool: (products) => set({ masterProductPool: products }),

      autoFillSlots: () => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        const validSlots: any[] = [];
        
        // Sayfaları 1, 2, 3, 4, 5, 6 sırasına diziyoruz ki ekrandaki hücre numaralarıyla POS numaraları tam eşleşsin.
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

      resetCatalog: () => set((state) => ({
        pages: buildPagesForTemplate(state.activeTemplate),
        selectedSlotIds: [],
        globalSettings: initialGlobalSettings,
        pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))],
        futurePages: []
      })),

      swapSlotContents: (sPageNum, sIdx, tPageNum, tIdx) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        const sPage = newPages.find(p => p.pageNumber === sPageNum), tPage = newPages.find(p => p.pageNumber === tPageNum);
        if (!sPage || !tPage) return state;
        const temp = sPage.slots[sIdx].product;
        sPage.slots[sIdx].product = tPage.slots[tIdx].product;
        tPage.slots[tIdx].product = temp;
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
          newPages.forEach(p => p.slots.forEach(s => { if (s.id === id) { s.isCustom = enabled; if (enabled && !s.customSettings) s.customSettings = { ...state.globalSettings }; } }));
        });
        return { pages: newPages, pastPages: [...(state.pastPages || []).slice(-20), JSON.parse(JSON.stringify(state.pages))], futurePages: [] };
      }),

      updateSlotCustomSettings: (settings) => set((state) => {
        const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
        state.selectedSlotIds.forEach(id => {
          newPages.forEach(p => p.slots.forEach(s => { if (s.id === id && s.isCustom) s.customSettings = { ...s.customSettings, ...settings }; }));
        });
        return { pages: newPages };
      }),
    }),
    { name: "catalog-storage" }
  )
);