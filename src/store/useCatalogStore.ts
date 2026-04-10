"use client";

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
import { ModuleRegistry } from "@/lib/moduleRegistry";

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export const defaultTypography: TypographyData = { fontFamily: "Inter", fontWeight: "400", fontSize: 12, lineHeight: 1.2, letterSpacing: 0, textAlign: "left", verticalAlign: "middle", textTransform: "none", textDecoration: "none", color: "#000000", opacity: 100, decimalScale: 100 };
export const defaultRadius: BorderRadiusData = { tl: 8, tr: 8, bl: 8, br: 8, linked: true };
export const defaultSpacing: SpacingData = { t: 8, r: 8, b: 8, l: 8, linked: true };
export const defaultShadow: ShadowData = { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, active: false };

export interface FooterCell {
  id: string;
  colSpan: number;
  text: string;
  image: string | null;
  hidden: boolean;
  mergedInto: string | null;
  font: TypographyData;
  padding: SpacingData;
  bgColor: { c: string; o: number };
  border: { t: number; r: number; b: number; l: number; linked: boolean; color: { c: string; o: number }; style: string };
}

export interface FooterSettings {
  heightMm: number;
  cells: FooterCell[];
}

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
  footer: FooterSettings;
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
  role?: 'product' | 'free';
  moduleData?: any;
  gridPosition?: { colStart: number; rowStart: number };
  globalNumber?: number;
}

export interface CatalogPage {
  id: string;
  pageNumber: number;
  slots: Slot[];
  footerText: string;
  footerLogo: string | null;
  headerData?: { logoUrl: string; title: string; date: string; no: string };
  footerMode: 'global' | 'custom' | 'hidden';
  customFooter: FooterSettings | null;
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
  updatePageHeader: (pageNumber: number, data: Partial<{ logoUrl: string; title: string; date: string; no: string }>) => void;
  updatePageFooterCells: (pageNumber: number, cellId: string, updates: Partial<FooterCell>) => void;
  setPageFooterMode: (pageNumber: number, mode: 'global' | 'custom' | 'hidden') => void;
  updateFooterSettings: (scope: number | 'global', updates: Partial<FooterSettings>) => void;
  updateFooterCellStore: (scope: number | 'global', cellId: string, updates: Partial<FooterCell>) => void;
  mergeFooterCellsStore: (scope: number | 'global', selectedIds: string[]) => { success: boolean; error?: string };
  unmergeFooterCellStore: (scope: number | 'global', cellId: string) => void;
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
  toggleSlotRole: (role: 'product' | 'free') => void;
  setSlotModule: (pageNumber: number, slotId: string, moduleType: 'banner' | 'pizza' | null) => void;
  
  // YENİ FONKSİYONLAR
  updateGridSettings: (scope: 'global' | number, settings: { rows: number; cols: number }) => void;
  applyGridChanges: () => void;
  applyPageGridChange: (pageNumber: number) => void;
  revertToGlobalGrid: (pageNumber: number) => void;
  updateSelectedSlotsImageSettings: (settings: any) => void;
  updateSlotModuleData: (pageNumber: number, slotId: string, updates: any) => void;
}

export const defaultFooterCells = (): FooterCell[] => [
  { id: 'fc-1', colSpan: 1, text: '', image: null, hidden: false, mergedInto: null, font: { ...defaultTypography }, padding: { ...defaultSpacing, t: 2, b: 2, l: 2, r: 2 }, bgColor: { c: "#ffffff", o: 0 }, border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" } },
  { id: 'fc-2', colSpan: 4, text: 'Sayfa altı notu...', image: null, hidden: false, mergedInto: null, font: { ...defaultTypography, textAlign: 'right' }, padding: { ...defaultSpacing, t: 2, b: 2, l: 2, r: 2 }, bgColor: { c: "#ffffff", o: 0 }, border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" } },
  { id: 'fc-3', colSpan: 1, text: '', image: null, hidden: true, mergedInto: 'fc-2', font: { ...defaultTypography }, padding: { ...defaultSpacing }, bgColor: { c: "#ffffff", o: 0 }, border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" } },
  { id: 'fc-4', colSpan: 1, text: '', image: null, hidden: true, mergedInto: 'fc-2', font: { ...defaultTypography }, padding: { ...defaultSpacing }, bgColor: { c: "#ffffff", o: 0 }, border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" } },
  { id: 'fc-5', colSpan: 1, text: '', image: null, hidden: true, mergedInto: 'fc-2', font: { ...defaultTypography }, padding: { ...defaultSpacing }, bgColor: { c: "#ffffff", o: 0 }, border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" } }
];

const initialGlobalSettings: CatalogSettings = {
  defaultGrid: { rows: 4, cols: 4 },
  gridGap: 2, // Hücre arası boşluğu varsayılan olarak 2mm yapalım
  borderWidth: 1,
  priceBorderWidth: 0,
  // === Fiyat Kutusu Ayarları ===
  pricePosition: "right",
  priceWidth: 30, // İsteğiniz: Genişlik %30
  priceHeight: 8,  // İsteğiniz: Yükseklik 8mm

  imageScale: 100,
  imagePosX: 0,
  imagePosY: 0,
  imageEditMode: false,
  badge: {
    active: false,
    text: "YENİ",
    bgColor: "#e60000",
    textColor: "#ffffff",
    position: 'top-left',
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
    // === Fiyat Ovallik Ayarı ===
    price: { ...defaultRadius, tl: 0, tr: 0, bl: 0, br: 0, linked: true } // İsteğiniz: Bağlı ve 0
  },
  fonts: {
    // === Ürün İsmi Font Ayarları ===
    productName: { 
      ...defaultTypography, 
      fontFamily: "Inter", 
      fontWeight: "700", // Bold
      fontSize: 10,       // Punto 10
      lineHeight: 1.2,    // Satır Yüksekliği 1.2
      letterSpacing: 0,   // Harf Aralığı 0
      textAlign: "center",// Yatay Hizalama Orta
      verticalAlign: "middle",// Dikey Hizalama Orta
      color: "#1e293b",
      decimalScale: 100 // Varsayılan
    },
    // === Fiyat Font Ayarları ===
    price: { 
      ...defaultTypography, 
      fontFamily: "Inter", 
      fontWeight: "700", // Bold
      fontSize: 20,       // Punto 20
      lineHeight: 1.2,    // Satır Yüksekliği 1.2
      letterSpacing: 0,   // Harf Aralığı 0
      textAlign: "center",// Yatay Hizalama Orta
      verticalAlign: "middle",// Dikey Hizalama Orta (middle ve center aynı sonucu verir)
      color: "#ffffff",
      decimalScale: 40    // İsteğiniz: Küsurat Boyutu %40
    }
  },
  spacings: {
    cell: { ...defaultSpacing, t: 8, r: 8, b: 8, l: 8 }
  },
  shadows: {
    cell: { ...defaultShadow, active: false }
  },
  footer: { heightMm: 15, cells: defaultFooterCells() },
};

function createPageSlots(pageNumber: number, count: number): Slot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `page-${pageNumber}-slot-${i + 1}`,
    colSpan: 1, rowSpan: 1, product: null, hidden: false, mergedInto: null, isCustom: false, role: 'product'
  }));
}

function buildPagesForTemplate(template: BrochureTemplate): CatalogPage[] {
  return template.pages.map((p) => ({
    id: `page-${p.pageNumber}`,
    pageNumber: p.pageNumber,
    slots: createPageSlots(p.pageNumber, 16),
    footerText: "Sayfa altı notu...",
    footerLogo: null,
    footerMode: 'global',
    customFooter: null,
  }));
}


// @ts-ignore
const cloneDeep = <T>(value: T): T => ((typeof structuredClone === "function" ? structuredClone(value) : (JSON.parse(JSON.stringify(value)) as any)) as any);

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

function recalculateLayout(formas: Forma[], defaultGrid: { rows: number, cols: number }) {
  let globalNumberCounter = 0;
  
  const newFormas = cloneDeep(formas);

  newFormas.forEach(forma => {
    forma.pages.forEach(page => {
      const totalColumns = page.gridSettings?.cols || defaultGrid.cols;
      
      const grid: boolean[][] = [];
      let r = 0, c = 0;

      page.slots.forEach((slot: Slot) => {
        if (slot.hidden) {
          slot.gridPosition = undefined;
          slot.globalNumber = undefined;
          return;
        }

        let placed = false;
        let startR = r, startC = c;
        
        while (!placed) {
          if (!grid[r]) grid[r] = [];
          if (!grid[r][c]) {
            let canFit = (c + slot.colSpan <= totalColumns);
            if (canFit) {
              for (let ir = 0; ir < slot.rowSpan; ir++) {
                if (!grid[r + ir]) grid[r + ir] = [];
                for (let ic = 0; ic < slot.colSpan; ic++) {
                  if (grid[r + ir][c + ic]) { canFit = false; break; }
                }
                if (!canFit) break;
              }
            }
            if (canFit) {
              for (let ir = 0; ir < slot.rowSpan; ir++) {
                for (let ic = 0; ic < slot.colSpan; ic++) grid[r + ir][c + ic] = true;
              }
              startR = r; startC = c; placed = true;
            }
          }
          if (!placed) {
            c++; if (c >= totalColumns) { c = 0; r++; }
          }
        }
        
        slot.gridPosition = { colStart: startC + 1, rowStart: startR + 1 };
        
        if (slot.role === 'product') {
          globalNumberCounter++;
          slot.globalNumber = globalNumberCounter;
        } else {
          slot.globalNumber = undefined;
        }
      });
    });
  });
  
  return newFormas;
}

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
        const newFormas = buildFormasForTemplate(tmpl);
        set({
          activeTemplate: tmpl,
          formas: recalculateLayout(newFormas, initialGlobalSettings.defaultGrid),
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
          setActivePages(newPages as any);
      },

      updatePageHeader: (pageNum, data) => {
          const { getActivePages, setActivePages } = get();
          const newPages = getActivePages().map((p) => p.pageNumber === pageNum ? { 
            ...p, 
            headerData: { ...(p.headerData || { logoUrl: "", title: "SELBSTABHOLER - ANGEBOT", date: "", no: "41" }), ...data } 
          } : p);
          setActivePages(newPages as any);
      },

      updatePageFooterCells: (pageNumber, cellId, updates) => {
        const { getActivePages, setActivePages, globalSettings } = get();
        const currentPages = getActivePages();
        
        const newPages = currentPages.map(page => {
          if (page.pageNumber !== pageNumber) return page;

          // Eğer sayfa global footer kullanıyorsa ve kullanıcı sayfadaki bir hücreye tıkayıp yazı yazıyorsa,
          // bu sayfayı otomatik olarak 'custom' moda alıp global verileri kopyalamalıyız.
          let newCustomFooter = page.customFooter;
          let newFooterMode = page.footerMode;

          if (page.footerMode === 'global') {
            newFooterMode = 'custom';
            newCustomFooter = JSON.parse(JSON.stringify(globalSettings.footer));
          }

          if (newCustomFooter && newCustomFooter.cells) {
            newCustomFooter.cells = newCustomFooter.cells.map(c => 
              c.id === cellId ? { ...c, ...updates } : c
            );
          }

          return {
            ...page,
            footerMode: newFooterMode,
            customFooter: newCustomFooter
          };
        });
        
        setActivePages(newPages as any);
      },

      setPageFooterMode: (pageNumber, mode) => {
        const { getActivePages, setActivePages, globalSettings } = get();
        const currentPages = getActivePages();
        const newPages = currentPages.map(p => {
          if (p.pageNumber !== pageNumber) return p;
          let customFooter = p.customFooter;
          if (mode === 'custom' && !customFooter) {
            customFooter = JSON.parse(JSON.stringify(globalSettings.footer));
          }
          return { ...p, footerMode: mode, customFooter: mode === 'custom' ? customFooter : null };
        });
        setActivePages(newPages as any);
      },
      
      updateFooterSettings: (scope, updates) => {
        if (scope === 'global') {
          const { globalSettings } = get();
          set({ globalSettings: { ...globalSettings, footer: { ...globalSettings.footer, ...updates } } });
        } else {
          const { getActivePages, setActivePages } = get();
          const currentPages = getActivePages();
          const newPages = currentPages.map(p => 
            p.pageNumber === scope && p.customFooter 
              ? { ...p, customFooter: { ...p.customFooter, ...updates } } 
              : p
          );
          setActivePages(newPages as any);
        }
      },

      updateFooterCellStore: (scope, cellId, updates) => {
        if (scope === 'global') {
          const { globalSettings } = get();
          const newCells = globalSettings.footer.cells.map(c => c.id === cellId ? { ...c, ...updates } : c);
          set({ globalSettings: { ...globalSettings, footer: { ...globalSettings.footer, cells: newCells } } });
        } else {
          const { getActivePages, setActivePages } = get();
          const currentPages = getActivePages();
          const newPages = currentPages.map(p => {
            if (p.pageNumber === scope && p.customFooter) {
              const newCells = p.customFooter.cells.map(c => c.id === cellId ? { ...c, ...updates } : c);
              return { ...p, customFooter: { ...p.customFooter, cells: newCells } };
            }
            return p;
          });
          setActivePages(newPages as any);
        }
      },

      mergeFooterCellsStore: (scope, selectedIds) => {
        if (selectedIds.length < 2) return { success: false, error: "En az 2 hücre seçmelisiniz." };
        
        let cells: FooterCell[] = [];
        if (scope === 'global') {
          cells = get().globalSettings.footer.cells;
        } else {
          const p = get().getActivePages().find(p => p.pageNumber === scope);
          if (!p || !p.customFooter) return { success: false, error: "Custom footer bulunamadı." };
          cells = p.customFooter.cells;
        }

        const visibleCells = cells.filter(c => !c.hidden);
        const selectedVisible = visibleCells.filter(c => selectedIds.includes(c.id));
        if (selectedVisible.length !== selectedIds.length) return { success: false, error: "Geçersiz seçim." };

        const sortedSelected = selectedIds.slice().sort((a, b) => cells.findIndex(c => c.id === a) - cells.findIndex(c => c.id === b));
        const survivorId = sortedSelected[0];
        const survivorIdx = cells.findIndex(c => c.id === survivorId);
        
        let totalColSpan = 0;
        selectedVisible.forEach(c => totalColSpan += c.colSpan);

        const newCells = JSON.parse(JSON.stringify(cells));
        newCells[survivorIdx].colSpan = totalColSpan;

        sortedSelected.slice(1).forEach(id => {
          const idx = newCells.findIndex((c: any) => c.id === id);
          newCells[idx].hidden = true;
          newCells[idx].mergedInto = survivorId;
          newCells[idx].text = "";
          newCells[idx].image = null;
        });

        if (scope === 'global') {
          get().updateFooterSettings('global', { cells: newCells });
        } else {
          get().updateFooterSettings(scope, { cells: newCells });
        }
        return { success: true };
      },

      unmergeFooterCellStore: (scope, cellId) => {
        let cells: FooterCell[] = [];
        if (scope === 'global') {
          cells = get().globalSettings.footer.cells;
        } else {
          const p = get().getActivePages().find(p => p.pageNumber === scope);
          if (!p || !p.customFooter) return;
          cells = p.customFooter.cells;
        }

        const newCells = JSON.parse(JSON.stringify(cells));
        const survivorIdx = newCells.findIndex((c: any) => c.id === cellId);
        if (survivorIdx === -1) return;

        newCells[survivorIdx].colSpan = 1;
        newCells.forEach((c: any, i: number) => {
          if (c.mergedInto === cellId) {
            newCells[i].hidden = false;
            newCells[i].mergedInto = null;
          }
        });

        if (scope === 'global') {
          get().updateFooterSettings('global', { cells: newCells });
        } else {
          get().updateFooterSettings(scope, { cells: newCells });
        }
      },
      
      setProductPool: (products) => set({ productPool: products }),
      setMasterProductPool: (products) => set({ masterProductPool: products }),

      autoFillSlots: () => {
        const { formas, productPool } = get();
        const { saveState } = useHistoryStore.getState();
        saveState(cloneDeep(get().getActivePages()));

        const newFormas = cloneDeep(formas);
        const allPages = newFormas.flatMap(f => f.pages).sort((a, b) => a.pageNumber - b.pageNumber);
        const allValidSlots: Slot[] = [];
        
        allPages.forEach(p => {
          p.slots.forEach((s) => {
            // ASLA ızgarayı bozma! Sadece görünür ve "ürün" rolündeki slotları hedef al.
            if (!s.hidden && s.role === 'product') {
              allValidSlots.push(s);
            }
          });
        });
        
        allValidSlots.forEach(s => s.product = null);
        
        productPool.forEach((product) => {
          let posValue = 0;
          if (product.raw) {
            const keys = Object.keys(product.raw);
            const posKey = keys.find(k => ["POS", "SIRA", "INDEX"].includes(k.trim().toUpperCase()));
            if (posKey) {
              const match = String(product.raw[posKey]).match(/\d+/);
              posValue = match ? parseInt(match[0], 10) : 0;
            }
          }

          if (!isNaN(posValue) && posValue > 0 && posValue <= allValidSlots.length) {
            const autoImage = product.image || (product.sku ? `/images/products/${product.sku}.png` : null);
            allValidSlots[posValue - 1].product = { ...product, image: autoImage || product.image };
          }
        });
        
        set({ formas: recalculateLayout(newFormas, get().globalSettings.defaultGrid) });
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
          formas: recalculateLayout(buildFormasForTemplate(activeTemplate), initialGlobalSettings.defaultGrid),
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

        
        const newFormas = get().formas.map((forma) =>
          forma.id === get().activeFormaId ? { ...forma, pages: newPages } : forma
        );
        
        set({ formas: recalculateLayout(newFormas, get().globalSettings.defaultGrid) });
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

        const currentGrid = page.gridSettings || get().globalSettings.defaultGrid;
        const maxCols = currentGrid.cols;
        const grid: (string | null)[][] = [];
        const coords: Record<string, { r: number; c: number; w: number; h: number }> = {};
        let r = 0, c = 0;
        
        page.slots.filter(s => !s.hidden).forEach((slot) => {
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
        
        const newFormas = get().formas.map((forma) =>
          forma.id === get().activeFormaId ? { ...forma, pages: newPages } : forma
        );
        
        set({ formas: recalculateLayout(newFormas, get().globalSettings.defaultGrid) });
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
        
        const newFormas = get().formas.map((forma) =>
          forma.id === get().activeFormaId ? { ...forma, pages: newPages } : forma
        );
        
        set({ formas: recalculateLayout(newFormas, get().globalSettings.defaultGrid) });
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
          newPages.forEach(p => p.slots.forEach(s => { if (s.id === id) { s.isCustom = enabled; if (enabled && !s.customSettings) s.customSettings = (JSON.parse(JSON.stringify(globalSettings)) as any); } }));
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

        set({ copiedSlotSettings: settingsToCopy ? (JSON.parse(JSON.stringify(settingsToCopy)) as any) : null });
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
              const copied = (JSON.parse(JSON.stringify(copiedSlotSettings)) as any);
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

      updateSelectedSlotsImageSettings: (settings) => {
        const { getActivePages, setActivePages } = get();
        const { selectedSlotIds } = useUIStore.getState();
        if (selectedSlotIds.length === 0) return;

        const newPages = getActivePages().map(p => ({
          ...p,
          slots: p.slots.map(s => selectedSlotIds.includes(s.id) ? {
            ...s,
            imageSettings: { ...(s.imageSettings || {}), ...settings }
          } : s)
        }));
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

      toggleSlotRole: (role) => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const { selectedSlotIds, clearSelection } = useUIStore.getState();

        if (selectedSlotIds.length === 0) return;

        const currentPages = getActivePages();
        saveState((JSON.parse(JSON.stringify(currentPages)) as any));

        const newPages = (JSON.parse(JSON.stringify(currentPages)) as any);
        selectedSlotIds.forEach(id => {
          newPages.forEach((p: any) => p.slots.forEach((s: any) => {
            if (s.id === id) {
              s.role = role;
              // Serbest alana geçerken ürünü temizle, ürün alanına geçerken modül verisini temizle
              if (role === 'free') {
                s.product = null;
                s.isCustom = true;
                s.customSettings = (JSON.parse(JSON.stringify(get().globalSettings)) as any);
                if (s.customSettings) {
                    s.customSettings.spacings.cell = { t: 0, r: 0, b: 0, l: 0, linked: true };
                    s.customSettings.borderWidth = 0;
                    s.customSettings.colors.cellBg.o = 0;
                    s.customSettings.colors.cellBorder.o = 0;
                    s.customSettings.shadows.cell.active = false;
                    s.customSettings.radiuses.cell = { tl: 0, tr: 0, bl: 0, br: 0, linked: true };
                }
              } else {
                s.moduleData = null;
              }
            }
          }));
        });

        const newFormas = get().formas.map((forma) =>
          forma.id === get().activeFormaId ? { ...forma, pages: newPages } : forma
        );
        set({ formas: recalculateLayout(newFormas, get().globalSettings.defaultGrid) });
        // Rol değiştikten sonra seçim kalsın ki kullanıcı anında farkı görsün.
      },

      setSlotModule: (pageNumber, slotId, moduleType) => {
        const { getActivePages, setActivePages } = get();
        const { saveState } = useHistoryStore.getState();
        const currentPages = getActivePages();
        saveState((JSON.parse(JSON.stringify(currentPages)) as any));

        const newPages = (JSON.parse(JSON.stringify(currentPages)) as any);
        const page = newPages.find((p: any) => p.pageNumber === pageNumber);
        if (!page) return;
        const slot = page.slots.find((s: any) => s.id === slotId);
        if (!slot || slot.role !== 'free') return;

        if (moduleType === null) {
          slot.moduleData = null;
        } else if (ModuleRegistry[moduleType]) {
          slot.moduleData = ModuleRegistry[moduleType].initialData();
        } else {
          slot.moduleData = null;
        }
        setActivePages(newPages);
      },

      // --- YENİ EKLENEN VEYA GÜNCELLENEN FONKSİYONLAR ---

      updateGridSettings: (scope, settings) => {
        const { rows, cols } = settings;
        // Limitleri uygula
        const limitedRows = Math.max(1, Math.min(10, rows));
        const limitedCols = Math.max(1, Math.min(10, cols));
        const newSettings = { rows: limitedRows, cols: limitedCols };

        if (scope === 'global') {
          set(state => ({
            globalSettings: { ...state.globalSettings, defaultGrid: newSettings }
          }));
        } else {
          const { formas } = get();
          const newFormas = cloneDeep(formas);
          const page = newFormas.flatMap(f => f.pages).find(p => p.pageNumber === scope);
          if (page) {
            page.gridSettings = newSettings;
            set({ formas: newFormas });
          }
        }
      },
      
      applyGridChanges: () => {
        const { formas, globalSettings } = get();
        const { saveState } = useHistoryStore.getState();
        saveState(cloneDeep(get().getActivePages()));

        const newFormas = cloneDeep(formas);
        newFormas.forEach(f => {
          f.pages.forEach(p => {
const currentGrid = p.gridSettings || globalSettings.defaultGrid || { rows: 4, cols: 4 };
            const newSlotCount = currentGrid.rows * currentGrid.cols;
            
            // 1. Dolu slotları (ürün, serbest alan veya özel ayarı olanları) yedekle
            const savedSlots = p.slots.filter(s => s.product || s.role === 'free' || s.isCustom);

            // 2. Yeni grid yapısına göre tamamen boş slotlar oluştur
            const newSlots = createPageSlots(p.pageNumber, newSlotCount);

            // 3. Eski dolu slotları sırasıyla yeni ızgaraya yerleştir
            let savedIndex = 0;
            for (let i = 0; i < newSlots.length; i++) {
              if (savedIndex < savedSlots.length) {
                const oldSlot = savedSlots[savedIndex];
                newSlots[i].product = oldSlot.product;
                newSlots[i].role = oldSlot.role;
                newSlots[i].moduleData = oldSlot.moduleData;
                newSlots[i].isCustom = oldSlot.isCustom;
                newSlots[i].customSettings = oldSlot.customSettings;
                newSlots[i].imageSettings = oldSlot.imageSettings;
                savedIndex++;
              }
            }

            p.slots = newSlots;
          });
        });

        set({ formas: recalculateLayout(newFormas, globalSettings.defaultGrid) });
      },

      applyPageGridChange: (pageNumber) => {
        const { formas, globalSettings } = get();
        const { saveState } = useHistoryStore.getState();
        saveState(cloneDeep(get().getActivePages()));

        const newFormas = cloneDeep(formas);
        newFormas.forEach(f => {
          const page = f.pages.find(p => p.pageNumber === pageNumber);
          if (page) {
const currentGrid = page.gridSettings || globalSettings.defaultGrid || { rows: 4, cols: 4 };
            const newSlotCount = currentGrid.rows * currentGrid.cols;
            
            // SADECE bu sayfanın slotlarını yeni ölçüye göre baştan oluştur. Diğer sayfalara ASLA dokunma!
            page.slots = createPageSlots(page.pageNumber, newSlotCount);
          }
        });

        set({ formas: recalculateLayout(newFormas, globalSettings.defaultGrid) });
      },

      
      updateSlotModuleData: (pageNumber, slotId, updates) => {
        const { getActivePages, setActivePages } = get();
        const newPages = getActivePages().map((p) => p.pageNumber === pageNumber ? {
          ...p,
          slots: p.slots.map(s => s.id === slotId ? {
            ...s,
            moduleData: typeof updates === "object" && updates !== null ? { ...(s.moduleData || {}), ...updates } : updates
          } : s)
        } : p);
        setActivePages(newPages as any);
      },

      revertToGlobalGrid: (pageNumber) => {
        const { formas } = get();
        const { saveState } = useHistoryStore.getState();
        saveState(cloneDeep(get().getActivePages()));

        const newFormas = cloneDeep(formas);
        const page = newFormas.flatMap(f => f.pages).find(p => p.pageNumber === pageNumber);
        if (page) {
          page.gridSettings = undefined; // Sayfa bazlı ayarı kaldır, globale dönsün
          set({ formas: newFormas });
          setTimeout(() => get().applyPageGridChange(pageNumber), 50); // Sadece bu sayfayı globale döndür
        }
      },
    }),
    {
      name: "catalog-storage-v2",
merge: (persisted, current) => {
        const incoming = (persisted as any) || {};
        const base = current as any;
        
        const mergedGlobal = deepMerge(base.globalSettings || initialGlobalSettings, incoming.globalSettings || {});
        
        if (!mergedGlobal.defaultGrid) {
          mergedGlobal.defaultGrid = { rows: 4, cols: 4 };
        }
        
        if (!mergedGlobal.footer) {
          mergedGlobal.footer = initialGlobalSettings.footer;
        }

        // BURAYI DEĞİŞTİRİYORUZ: Global ayarlardaki resim ölçeklerini zorla %100 yapıyoruz
        const normalizedGlobalSettings: CatalogSettings = {
          ...mergedGlobal,
          imageScale: 100, 
          imagePosX: 0,
          imagePosY: 0,
          imageEditMode: false,
        };

        let formas = incoming.formas || base.formas || buildFormasForTemplate(base.activeTemplate || Template1);
        
        if (!incoming.formas && Array.isArray(incoming.pages)) {
          formas = formas.map((f: Forma) =>
            f.id === (incoming.activeFormaId || base.activeFormaId || 1)
              ? { ...f, pages: incoming.pages.map(normalizeCatalogPage) }
              : f
          );
        }

        const finalFormas = recalculateLayout(formas.map(normalizeForma), normalizedGlobalSettings.defaultGrid);

        return {
          ...base,
          ...incoming,
          formas: finalFormas,
          activeFormaId: incoming.activeFormaId || base.activeFormaId || 1,
          activeTab: incoming.activeTab || (incoming.activeFormaId === 2 ? "inner" : "outer"),
          globalSettings: normalizedGlobalSettings,
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
  let footerMode = page.footerMode;
  let customFooter = page.customFooter;

  if (!footerMode && (page.footerText || page.footerLogo)) {
    footerMode = 'custom';
    customFooter = { heightMm: 18, cells: defaultFooterCells() };
    if (page.footerLogo) {
      customFooter.cells[0].image = page.footerLogo;
    }
    if (page.footerText) {
      customFooter.cells[1].text = page.footerText;
    }
    page.footerText = "";
    page.footerLogo = null;
  }

  return {
      ...page,
      footerMode: footerMode || 'global',
      customFooter: customFooter || null,
  };
}