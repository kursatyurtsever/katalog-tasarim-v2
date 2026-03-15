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
}

function createPageSlots(pageNumber: number, count: number): Slot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `page-${pageNumber}-slot-${i + 1}`,
    colSpan: 1,
    rowSpan: 1,
    product: null,
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

export const useCatalogStore = create<CatalogState & CatalogActions>((set) => ({
  activeTab: "outer",
  activeTemplate: Template1,
  pages: buildPagesForTemplate(Template1),
  productPool: [],
  globalSettings: { gridGap: 0 },
  isZoomed: false,

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
}));