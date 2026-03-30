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
export interface BackgroundSettings {
  type: "color" | "image";
  color: string;
  opacity: number;
  imageUrl: string | null;
  scale: number;
  offsetX: number;
  offsetY: number;
  imageOpacity: number;
  rotation: number;
  isSpread?: boolean;
  fitMode: 'cover' | 'contain' | 'repeat' | 'stretch';
  flipX: boolean;
  flipY: boolean;
  blendMode: string;
}

// DEPRECATED: Will be replaced by useLayerStore
export const defaultBackground: BackgroundSettings = {
  type: "color",
  color: "#ffffff",
  opacity: 100,
  imageUrl: null,
  scale: 100,
  offsetX: 0,
  offsetY: 0,
  imageOpacity: 100,
  rotation: 0,
  isSpread: false,
  fitMode: 'cover',
  flipX: false,
  flipY: false,
  blendMode: 'normal',
};

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
  // DEPRECATED: Will be replaced by useLayerStore
  globalBackground: BackgroundSettings;
  // DEPRECATED: Will be replaced by useLayerStore
  isGlobalBackgroundActive: boolean;
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
  // DEPRECATED: Will be replaced by useLayerStore
  background?: BackgroundSettings;
}

export interface Forma {
  id: number;
  name: string;
  pages: CatalogPage[];
  // DEPRECATED: Will be replaced by useLayerStore
  globalBackground?: BackgroundSettings;
  // DEPRECATED: Will be replaced by useLayerStore
  isGlobalBackgroundActive: boolean;
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
      // DEPRECATED: Will be replaced by useLayerStore
      globalBackground: BackgroundSettings;
      // DEPRECATED: Will be replaced by useLayerStore
      isGlobalActive: boolean;
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
  updateGlobalSettings: (settings: any) => void;
  updateGlobalBackground: (bg: Partial<BackgroundSettings>) => void;
  setGlobalActive: (active: boolean) => void;
  setSelectedPage: (pageNumber: number | null) => void;
  setContextualBarFormaId: (id: string | null) => void;
  setContextualBarSelectedPages: (pages: number[]) => void;
  updatePageFooter: (pageNumber: number, data: Partial<{ footerText: string; footerLogo: string | null }>) => void;
  updatePageBackground: (pageNumber: number, bg: Partial<BackgroundSettings>) => void;
  updatePageBackgrounds: (pageNumbers: number[], bg: Partial<BackgroundSettings>) => void;
  updateFormaBackground: (formaId: number, updates: any) => void;
  applyBackgroundToAllPages: (bg: BackgroundSettings) => void;
  applyBackgroundToAllFormas: (bg: BackgroundSettings) => void;
  swapSlotContents: (sourcePageNumber: number, sourceIndex: number, targetPageNumber: number, targetIndex: number) => void;
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
  globalBackground: cloneDeep(defaultBackground),
  isGlobalBackgroundActive: false,
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
    background: cloneDeep(defaultBackground),
  }));
}

function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function normalizeBackgroundSettings(
  current?: Partial<BackgroundSettings> | null,
  incoming?: Partial<BackgroundSettings> | null
): BackgroundSettings {
  const merged = {
    ...cloneDeep(defaultBackground),
    ...(current ? cloneDeep(current) : {}),
    ...(incoming ? cloneDeep(incoming) : {}),
  };

  const normalizeNumber = (value: unknown, fallback: number) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;

  const normalizedImageUrl = typeof merged.imageUrl === "string" && merged.imageUrl.trim() !== ""
    ? merged.imageUrl
    : null;

  return {
    type: normalizedImageUrl ? "image" : "color",
    color: typeof merged.color === "string" ? merged.color : defaultBackground.color,
    opacity: Math.max(0, Math.min(100, normalizeNumber(merged.opacity, defaultBackground.opacity))),
    imageUrl: normalizedImageUrl,
    scale: normalizeNumber(merged.scale, defaultBackground.scale),
    offsetX: normalizeNumber(merged.offsetX, defaultBackground.offsetX),
    offsetY: normalizeNumber(merged.offsetY, defaultBackground.offsetY),
    imageOpacity: normalizeNumber(merged.imageOpacity, defaultBackground.imageOpacity),
    rotation: normalizeNumber(merged.rotation, defaultBackground.rotation),
    isSpread: typeof merged.isSpread === "boolean" ? merged.isSpread : false,
    fitMode: ['cover', 'contain', 'repeat', 'stretch'].includes(merged.fitMode) ? merged.fitMode : 'cover',
    flipX: typeof merged.flipX === 'boolean' ? merged.flipX : false,
    flipY: typeof merged.flipY === 'boolean' ? merged.flipY : false,
    blendMode: typeof merged.blendMode === 'string' ? merged.blendMode : 'normal',
  };
}

function buildFormasForTemplate(template: BrochureTemplate): Forma[] {
  const pages = buildPagesForTemplate(template);
  const splitIndex = Math.ceil(pages.length / 2);
  return [
    {
      id: 1,
      name: "Forma 1 (Kapaklar)",
      pages: pages.slice(0, splitIndex),
      globalBackground: cloneDeep(defaultBackground),
      isGlobalBackgroundActive: false,
    },
    {
      id: 2,
      name: "Forma 2 (İç Sayfalar)",
      pages: pages.slice(splitIndex),
      globalBackground: cloneDeep(defaultBackground),
      isGlobalBackgroundActive: false,
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
    background: normalizeBackgroundSettings(defaultBackground, page.background),
  };
}

function normalizeForma(forma: Forma): Forma {
  return {
    ...forma,
    pages: (forma.pages || []).map(normalizeCatalogPage),
    globalBackground: normalizeBackgroundSettings(defaultBackground, forma.globalBackground),
    isGlobalBackgroundActive: typeof forma.isGlobalBackgroundActive === "boolean" ? forma.isGlobalBackgroundActive : false,
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
      globalBackground: cloneDeep(defaultBackground),
      isGlobalActive: false,
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

      updateGlobalBackground: (bg) => set((state) => {
        const newGlobalBg = normalizeBackgroundSettings(state.globalBackground, bg);
        
        // Eğer Global aktifse, globalSettings içindeki globalBackground'u da güncelle ki senkron kalsın
        return {
          globalBackground: newGlobalBg,
          globalSettings: {
            ...state.globalSettings,
            globalBackground: newGlobalBg
          }
        };
      }),

      setGlobalActive: (active) => set((state) => ({ 
        isGlobalActive: active,
        globalSettings: {
          ...state.globalSettings,
          isGlobalBackgroundActive: active
        }
      })),

      updatePageFooter: (pageNum, data) => set((state) => ({
        formas: setActivePages(
          state,
          getActivePages(state).map((p) => p.pageNumber === pageNum ? { ...p, ...data } : p)
        )
      })),

      updatePageBackground: (pageNumber, bg) => set((state) => {
        const currentFormas = cloneDeep(state.formas);
        const targetForma = currentFormas.find(f => f.pages.some(p => p.pageNumber === pageNumber));
        if (!targetForma) return state;

        const pagesInForma = targetForma.pages;
        const currentPage = pagesInForma.find(p => p.pageNumber === pageNumber);

        // Eğer güncellenen sayfanın resmi yayılmış durumdaysa, bağlı olduğu diğer sayfayı bul ve yaymayı iptal et.
        if (currentPage?.background?.isSpread) {
          // Bu mantık şimdilik basitçe tüm diğer sayfalarda arama yapıyor.
          // İleride daha karmaşık spread grupları (örn. 3'lü) olursa revize edilmeli.
          for (const forma of currentFormas) {
            for (const page of forma.pages) {
              if (page.pageNumber !== pageNumber && page.background?.isSpread && page.background?.imageUrl === currentPage.background.imageUrl) {
                page.background.isSpread = false;
              }
            }
          }
        }

        const newFormas = currentFormas.map((f) => {
          if (f.id === targetForma.id) {
            return {
              ...f,
              pages: f.pages.map((p) =>
                p.pageNumber === pageNumber
                  ? { ...p, background: normalizeBackgroundSettings(p.background, bg) }
                  : p
              ),
            };
          }
          return f;
        });

        return {
          formas: newFormas,
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(getActivePages(state))],
          futurePages: [],
        };
      }),

      updatePageBackgrounds: (pageNumbers, bg) => set((state) => {
        if (pageNumbers.length === 0) return state;

        const targetPageNumbers = new Set(pageNumbers);
        const currentFormas = state.formas;
        const newFormas = currentFormas.map((forma) => ({
          ...forma,
          pages: forma.pages.map((page) =>
            targetPageNumbers.has(page.pageNumber)
              ? { ...page, background: normalizeBackgroundSettings(page.background, bg) }
              : page
          ),
        }));

        return {
          formas: newFormas,
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(getActivePages(state))],
          futurePages: []
        };
      }),

      updateFormaBackground: (formaId, updates) => set((state) => {
        const currentFormas = state.formas;
        const newFormas = currentFormas.map((f) => {
          if (f.id === formaId) {
            const newForma: Forma = { ...f, ...updates };
            if (updates.globalBackground !== undefined) {
              newForma.globalBackground = normalizeBackgroundSettings(f.globalBackground, updates.globalBackground);
            }
            return newForma;
          }
          return f;
        });

        return {
          formas: newFormas,
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(getActivePages(state))],
          futurePages: []
        };
      }),

      applyBackgroundToAllPages: (bg) => set((state) => {
        const currentPages = getActivePages(state);
        const normalizedBg = normalizeBackgroundSettings(defaultBackground, bg);
        const newPages = currentPages.map((p) => ({ ...p, background: cloneDeep(normalizedBg) }));

        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      applyBackgroundToAllFormas: (bg) => set((state) => {
        const currentPages = getActivePages(state);
        const normalizedBg = normalizeBackgroundSettings(defaultBackground, bg);
        const formas = state.formas.map((f) => ({
          ...f,
          background: cloneDeep(normalizedBg),
          pages: f.pages.map((p) => ({ ...p, background: cloneDeep(normalizedBg) })),
        }));

        return {
          formas,
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
          futurePages: []
        };
      }),

      toggleZoom: () => set((state) => ({ isZoomed: !state.isZoomed })),
      setProductPool: (products) => set({ productPool: products }),
      setMasterProductPool: (products) => set({ masterProductPool: products }),

      autoFillSlots: () => set((state) => {
        const currentPages = getActivePages(state);
        const newPages = cloneDeep(currentPages);
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
        
        return {
          formas: setActivePages(state, newPages),
          pastPages: [...(state.pastPages || []).slice(-20), cloneDeep(currentPages)],
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

      clearSelectionAndSelectPage: (pageNumber: number) => set((state) => ({ 
        selectedSlotIds: [], 
        selectedTextElement: null, 
        selectedPageNumber: pageNumber 
      })),
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
          globalBackground: normalizeBackgroundSettings(
            baseState.globalSettings?.globalBackground || initialGlobalSettings.globalBackground,
            mergedGlobal.globalBackground
          ),
          isGlobalBackgroundActive:
            typeof mergedGlobal.isGlobalBackgroundActive === "boolean"
              ? mergedGlobal.isGlobalBackgroundActive
              : initialGlobalSettings.isGlobalBackgroundActive,
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
            globalBackground: normalizeBackgroundSettings(
              baseState.globalBackground || initialGlobalSettings.globalBackground,
              incomingState.globalBackground
            ),
            isGlobalActive: typeof incomingState.isGlobalActive === "boolean" ? incomingState.isGlobalActive : (baseState.isGlobalActive || false),
            contextualBarFormaId: incomingState.contextualBarFormaId || baseState.contextualBarFormaId || "1",
            contextualBarSelectedPages: incomingState.contextualBarSelectedPages || baseState.contextualBarSelectedPages || [],
          }
        };
      },

      // Migration logic for old background data to new layer structure
      onRehydrateStorage: (state) => {
        if (state) {
          const { addLayer } = useLayerStore.getState();
            state.formas.forEach(forma => {
            forma.pages.forEach(page => {
              if (page.background && (page.background.imageUrl || (page.background.color !== defaultBackground.color && page.background.color !== "transparent")) ) {
                const pageConfig = state.activeTemplate.pages.find(p => p.pageNumber === page.pageNumber);
                if (!pageConfig) return; // Sayfa konfigürasyonu bulunamazsa devam etme

                const newLayer: Layer = {
                  id: uuidv4(),
                  type: page.background.type === "image" ? "image" : "solid",
                  bounds: { x: 0, y: 0, w: pageConfig.widthMm, h: state.activeTemplate.openHeightMm }, // Sayfa genişliği ve şablon yüksekliği
                  transform: { rotation: page.background.rotation, scale: page.background.scale, flipX: page.background.flipX, flipY: page.background.flipY, offsetX: 0, offsetY: 0 },
                  mask: { type: "page", targetIds: [page.id] },
                  zIndex: 0, // En alta
                  properties: page.background.type === "image"
                    ? { imageUrl: page.background.imageUrl, opacity: page.background.imageOpacity }
                    : { color: page.background.color, opacity: page.background.opacity },
                };
                addLayer(newLayer);
                // Eski arka planı temizle (opsiyonel, persist etmemesi için)
                delete page.background; 
              }
            });

            // Forma global arka planı için de benzer migration yapılabilir
            if (forma.globalBackground && (forma.globalBackground.imageUrl || (forma.globalBackground.color !== defaultBackground.color && forma.globalBackground.color !== "transparent")) ) {
              const newLayer: Layer = {
                id: uuidv4(),
                type: forma.globalBackground.type === "image" ? "image" : "solid",
                bounds: { x: 0, y: 0, w: state.activeTemplate.openWidthMm, h: state.activeTemplate.openHeightMm }, // Forma genişliği ve yüksekliği
                transform: { rotation: forma.globalBackground.rotation, scale: forma.globalBackground.scale, flipX: forma.globalBackground.flipX, flipY: forma.globalBackground.flipY, offsetX: 0, offsetY: 0 },
                mask: { type: "document", targetIds: [] }, // Tüm dokümanı kapsayan katman
                zIndex: 0, // En alta
                properties: forma.globalBackground.type === "image"
                  ? { imageUrl: forma.globalBackground.imageUrl, opacity: forma.globalBackground.imageOpacity }
                  : { color: forma.globalBackground.color, opacity: forma.globalBackground.opacity },
              };
              addLayer(newLayer);
              delete forma.globalBackground;
            }
          });
        }
      }
    }
  )
);
