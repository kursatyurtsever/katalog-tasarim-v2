import { create } from "zustand";
import { Template1, availableTemplates, getSlotCountForPage } from "@/lib/templates";
import type { BrochureTemplate } from "@/lib/templates";

export interface ProductInfo {
  id?: string;
  name?: string;
  price?: string;
  image?: string;
  sku?: string;
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
  globalSettings: { gridGap: number };
  isZoomed: boolean;
  selectedSlotIds: string[];
}

export interface CatalogActions {
  setActiveTab: (tab: "outer" | "inner") => void;
  setActiveTemplate: (templateId: string) => void;
  setGlobalSettings: (settings: Partial<{ gridGap: number }>) => void;
  updatePageFooter: (pageNumber: number, data: Partial<{ footerText: string; footerLogo: string | null }>) => void;
  swapSlotContents: (sourcePage: number, sourceIndex: number, targetPage: number, targetIndex: number) => void;
  toggleZoom: () => void;
  setProductPool: (products: ProductInfo[]) => void;
  autoFillSlots: () => void;
  
  toggleSlotSelection: (id: string, isMulti: boolean) => void;
  clearSelection: () => void;
  mergeSelected: (pageNumber: number) => { success: boolean; error?: string };
  unmergeSlot: (pageNumber: number, slotId: string) => void;
}

function createPageSlots(pageNumber: number, count: number): Slot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `page-${pageNumber}-slot-${i + 1}`,
    colSpan: 1,
    rowSpan: 1,
    product: null,
    hidden: false,
    mergedInto: null,
  }));
}

function buildPagesForTemplate(template: BrochureTemplate): CatalogPage[] {
  const uniquePages = [...new Set(template.pages.map((p) => p.pageNumber))].sort((a, b) => a - b);
  return uniquePages.map((n) => ({
    id: `page-${n}`,
    pageNumber: n,
    slots: createPageSlots(n, getSlotCountForPage(n)),
    footerText: "Sayfa altı notu...",
    footerLogo: null
  }));
}

export const useCatalogStore = create<CatalogState & CatalogActions>((set, get) => ({
  activeTab: "outer",
  activeTemplate: Template1,
  pages: buildPagesForTemplate(Template1),
  productPool: [],
  globalSettings: { gridGap: 0 },
  isZoomed: false,
  selectedSlotIds: [],

  toggleSlotSelection: (id, isMulti) => set((state) => {
    if (isMulti) {
      if (state.selectedSlotIds.includes(id)) {
        return { selectedSlotIds: state.selectedSlotIds.filter((x) => x !== id) };
      }
      return { selectedSlotIds: [...state.selectedSlotIds, id] };
    }
    return { selectedSlotIds: state.selectedSlotIds[0] === id && state.selectedSlotIds.length === 1 ? [] : [id] };
  }),

  clearSelection: () => set({ selectedSlotIds: [] }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTemplate: (templateId) => {
    const tmpl = availableTemplates.find((t) => t.id === templateId);
    if (!tmpl) return;
    set({ activeTemplate: tmpl, pages: buildPagesForTemplate(tmpl), activeTab: "outer" });
  },
  setGlobalSettings: (settings) => set((state) => ({ globalSettings: { ...state.globalSettings, ...settings } })),
  
  updatePageFooter: (pageNum, data) => set((state) => ({
    pages: state.pages.map(p => p.pageNumber === pageNum ? { ...p, ...data } : p)
  })),

  toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),
  setProductPool: (products) => set({ productPool: products }),

  autoFillSlots: () => set((state) => {
    const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
    const BASE_IMAGE_URL = "/images/products/"; 
    state.productPool.forEach((product) => {
      const pos = parseInt(String(product.raw?.POS || "0"), 10);
      if (isNaN(pos) || pos <= 0) return;
      const autoImage = `${BASE_IMAGE_URL}${product.sku}.png`;
      let currentGlobalPos = 0;
      for (const page of newPages) {
        const slotCount = page.slots.length;
        if (pos > currentGlobalPos && pos <= currentGlobalPos + slotCount) {
          const localIndex = pos - currentGlobalPos - 1;
          page.slots[localIndex].product = { ...product, image: autoImage };
          break;
        }
        currentGlobalPos += slotCount;
      }
    });
    return { pages: newPages };
  }),

  swapSlotContents: (sPageNum, sIdx, tPageNum, tIdx) => set((state) => {
    const newPages = JSON.parse(JSON.stringify(state.pages)) as CatalogPage[];
    const sPage = newPages.find(p => p.pageNumber === sPageNum);
    const tPage = newPages.find(p => p.pageNumber === tPageNum);
    if (!sPage || !tPage) return state;
    const temp = sPage.slots[sIdx].product;
    sPage.slots[sIdx].product = tPage.slots[tIdx].product;
    tPage.slots[tIdx].product = temp;
    return { pages: newPages };
  }),

  mergeSelected: (pageNumber) => {
    const state = get();
    const pageIndex = state.pages.findIndex((p) => p.pageNumber === pageNumber);
    const page = state.pages[pageIndex];
    const selected = state.selectedSlotIds;

    if (selected.length < 2) return { success: false, error: "En az 2 hücre seçmelisiniz." };

    const slotsToMerge = page.slots.filter((s) => selected.includes(s.id));
    if (slotsToMerge.length !== selected.length) {
      return { success: false, error: "Farklı sayfalardan hücreleri birleştiremezsiniz." };
    }

    let startIndex = 0;
    if (page.pageNumber === 1) startIndex = 4;
    if (page.pageNumber === 6) startIndex = 8;
    
    const visualSlots = page.slots.slice(startIndex).filter(s => !s.hidden);

    const grid: (string | null)[][] = [];
    const coords: Record<string, { r: number; c: number; w: number; h: number }> = {};
    const maxCols = 4;
    let r = 0, c = 0;

    visualSlots.forEach((slot) => {
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
              for (let ic = 0; ic < slot.colSpan; ic++) {
                grid[r + ir][c + ic] = slot.id;
              }
            }
            coords[slot.id] = { r, c, w: slot.colSpan, h: slot.rowSpan };
            placed = true;
          }
        }
        if (!placed) {
          c++;
          if (c >= maxCols) { c = 0; r++; }
        }
      }
    });

    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity, totalArea = 0;

    for (const slot of slotsToMerge) {
      const cInfo = coords[slot.id];
      if (!cInfo) return { success: false, error: "Geçersiz hücre seçimi." };
      minR = Math.min(minR, cInfo.r);
      maxR = Math.max(maxR, cInfo.r + cInfo.h - 1);
      minC = Math.min(minC, cInfo.c);
      maxC = Math.max(maxC, cInfo.c + cInfo.w - 1);
      totalArea += cInfo.w * cInfo.h;
    }

    const expectedArea = (maxR - minR + 1) * (maxC - minC + 1);
    if (totalArea !== expectedArea) return { success: false, error: "Seçiminiz düzgün bir dikdörtgen/kare oluşturmuyor." };

    const survivorId = grid[minR][minC];
    if (!survivorId || !selected.includes(survivorId)) return { success: false, error: "Birleştirme hatası." };

    const newSlots = [...page.slots];
    const survivorIndex = newSlots.findIndex((s) => s.id === survivorId);

    newSlots[survivorIndex] = {
      ...newSlots[survivorIndex],
      colSpan: maxC - minC + 1,
      rowSpan: maxR - minR + 1,
    };

    const idsToHide = selected.filter((id) => id !== survivorId);
    idsToHide.forEach(id => {
      const idx = newSlots.findIndex(s => s.id === id);
      newSlots[idx] = { ...newSlots[idx], hidden: true, mergedInto: survivorId };
    });

    const newPages = [...state.pages];
    newPages[pageIndex] = { ...page, slots: newSlots };

    set({ pages: newPages, selectedSlotIds: [] });
    return { success: true };
  },

  unmergeSlot: (pageNumber, slotId) => {
    const state = get();
    const pageIndex = state.pages.findIndex((p) => p.pageNumber === pageNumber);
    const page = state.pages[pageIndex];

    const newSlots = [...page.slots];
    const survivorIndex = newSlots.findIndex((s) => s.id === slotId);

    newSlots[survivorIndex] = { ...newSlots[survivorIndex], colSpan: 1, rowSpan: 1 };

    newSlots.forEach((s, i) => {
      if (s.mergedInto === slotId) {
        newSlots[i] = { ...s, hidden: false, mergedInto: null };
      }
    });

    const newPages = [...state.pages];
    newPages[pageIndex] = { ...page, slots: newSlots };
    set({ pages: newPages, selectedSlotIds: [] });
  },
}));