import { create } from 'zustand';
import { TypographyData } from '../components/TypographyPicker';
import { BorderRadiusData } from '../components/BorderRadiusPicker';
import { SpacingData } from '../components/SpacingPicker';
import { ShadowData } from '../components/ShadowPicker';

export const defaultTypography: TypographyData = { fontFamily: "Inter", fontWeight: "400", fontSize: 12, lineHeight: 1.2, letterSpacing: 0, textAlign: "left", verticalAlign: "middle", textTransform: "none", textDecoration: "none", color: "#000000", opacity: 100, decimalScale: 100 };
export const defaultRadius: BorderRadiusData = { tl: 8, tr: 8, bl: 8, br: 8, linked: true };
export const defaultSpacing: SpacingData = { t: 8, r: 8, b: 8, l: 8, linked: true };
export const defaultShadow: ShadowData = { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, active: false };

interface PizzaStore {
  // YENİ EKLENEN DURUMLAR (STATE)
  isSelected: boolean;
  selectPizza: () => void;
  clearSelection: () => void;
  
  // Mevcut Durumlar...
  colors: {
    bg: { c: string; o: number };
    border: { c: string; o: number };
    tableBg: { c: string; o: number };
    tableTitleBg: { c: string; o: number };
    cellBg: { c: string; o: number };
    cellPriceBg: { c: string; o: number };
    tableLine: { c: string; o: number };
    imgBg: { c: string; o: number };
    imgBorder: { c: string; o: number };
  };
  fonts: {
    title: TypographyData;
    tableTitle: TypographyData;
    sizes: TypographyData;
    prices: TypographyData;
  };
  radiuses: {
    container: BorderRadiusData;
    table: BorderRadiusData;
    image: BorderRadiusData;
  };
  spacings: {
    container: SpacingData;
    tableTitle: SpacingData;
    cell: SpacingData;
  };
  shadows: {
    container: ShadowData;
    table: ShadowData;
    image: ShadowData;
    cell: ShadowData;
  };
  tableLineWidth: number;
  updateColor: (key: keyof PizzaStore['colors'], c: string, o: number) => void;
  updateFont: (key: keyof PizzaStore['fonts'], val: TypographyData) => void;
  updateRadius: (key: keyof PizzaStore['radiuses'], val: BorderRadiusData) => void;
  updateSpacing: (key: keyof PizzaStore['spacings'], val: SpacingData) => void;
  updateShadow: (key: keyof PizzaStore['shadows'], val: ShadowData) => void;
  updateTableLineWidth: (val: number) => void;
}

export const usePizzaStore = create<PizzaStore>((set) => ({
  // YENİ EKLENEN FONKSİYONLAR
  isSelected: false,
  selectPizza: () => set({ isSelected: true }),
  clearSelection: () => set({ isSelected: false }),

  // Mevcut Veriler...
  colors: {
    bg: { c: "#ffffff", o: 100 },
    border: { c: "#1e293b", o: 100 },
    tableBg: { c: "#ffffff", o: 100 },
    tableTitleBg: { c: "#1e293b", o: 100 },
    cellBg: { c: "#f1f5f9", o: 100 },
    cellPriceBg: { c: "#ffffff", o: 100 },
    tableLine: { c: "#cbd5e1", o: 100 },
    imgBg: { c: "#f8fafc", o: 100 },
    imgBorder: { c: "#94a3b8", o: 100 },
  },
  fonts: {
    title: { ...defaultTypography, fontFamily: "Inter", fontWeight: "900", fontSize: 18, textAlign: "center", textTransform: "uppercase", color: "#0f172a" },
    tableTitle: { ...defaultTypography, fontFamily: "Inter", fontWeight: "700", fontSize: 11, textAlign: "center", textTransform: "uppercase", color: "#ffffff" },
    sizes: { ...defaultTypography, fontFamily: "Inter", fontWeight: "700", fontSize: 10, textAlign: "center", color: "#000000" },
    prices: { ...defaultTypography, fontFamily: "Inter", fontWeight: "900", fontSize: 12, textAlign: "center", color: "#dc2626" },
  },
  radiuses: {
    container: { ...defaultRadius, tl: 8, tr: 8, bl: 8, br: 8 },
    table: { ...defaultRadius, tl: 4, tr: 4, bl: 4, br: 4 },
    image: { ...defaultRadius, tl: 4, tr: 4, bl: 4, br: 4 },
  },
  spacings: {
    container: { t: 16, r: 16, b: 16, l: 16, linked: true },
    tableTitle: { t: 6, r: 8, b: 6, l: 8, linked: false },
    cell: { t: 2, r: 4, b: 2, l: 4, linked: false },
  },
  shadows: {
    container: { ...defaultShadow, active: true, blur: 10, opacity: 5 },
    table: { ...defaultShadow },
    image: { ...defaultShadow },
    cell: { ...defaultShadow },
  },
  tableLineWidth: 2,
  updateColor: (key, c, o) => set((state) => ({ colors: { ...state.colors, [key]: { c, o } } })),
  updateFont: (key, val) => set((state) => ({ fonts: { ...state.fonts, [key]: val } })),
  updateRadius: (key, val) => set((state) => ({ radiuses: { ...state.radiuses, [key]: val } })),
  updateSpacing: (key, val) => set((state) => ({ spacings: { ...state.spacings, [key]: val } })),
  updateShadow: (key, val) => set((state) => ({ shadows: { ...state.shadows, [key]: val } })),
  updateTableLineWidth: (val) => set({ tableLineWidth: val }),
}));