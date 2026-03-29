import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TypographyData } from "@/components/TypographyPicker";
import { SpacingData } from "@/components/SpacingPicker";

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export const defaultTypography: TypographyData = { fontFamily: "Inter", fontWeight: "400", fontSize: 12, lineHeight: 1.2, letterSpacing: 0, textAlign: "center", verticalAlign: "middle", textTransform: "none", textDecoration: "none", color: "#000000", opacity: 100, decimalScale: 100 };
export const defaultSpacing: SpacingData = { t: 0, r: 0, b: 0, l: 0, linked: true };

export interface BannerBorderData {
  t: number; r: number; b: number; l: number;
  linked: boolean;
  color: { c: string; o: number };
  style: "solid" | "dashed" | "dotted";
}

export interface BannerCell {
  id: string;
  text: string;
  colSpan: number;
  rowSpan: number;
  hidden: boolean;
  mergedInto: string | null;
  font: TypographyData;
  padding: SpacingData;
  bgColor: { c: string; o: number };
  border: BannerBorderData;
  image: string | null;
}

export interface BannerSettings {
  cells: BannerCell[];
}

interface BannerState {
  bannerSettings: BannerSettings;
  selectedBannerCellIds: string[];
  pastBanners: BannerSettings[];
  futureBanners: BannerSettings[];
}

interface BannerActions {
  updateBannerCell: (cellId: string, updates: DeepPartial<BannerCell>) => void;
  updateSelectedBannerCells: (updates: DeepPartial<BannerCell>) => void;
  toggleBannerCellSelection: (id: string, isMulti: boolean) => void;
  clearBannerSelection: () => void;
  mergeBannerCells: () => { success: boolean; error?: string };
  unmergeBannerCell: (cellId: string) => void;
  resetSelectedBannerCells: () => void;
  undo: () => void;
  redo: () => void;
}

function createInitialBannerCells(): BannerCell[] {
  const cells: BannerCell[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      cells.push({
        id: `banner-${r}-${c}`,
        text: "",
        colSpan: 1,
        rowSpan: 1,
        hidden: false,
        mergedInto: null,
        font: { ...defaultTypography, fontSize: 14, fontWeight: "700", color: "#1e293b" },
        padding: { ...defaultSpacing },
        bgColor: { c: "#ffffff", o: 0 },
        border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" },
        image: null,
      });
    }
  }
  return cells;
}

const initialBannerSettings: BannerSettings = {
  cells: createInitialBannerCells(),
};

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

export const useBannerStore = create<BannerState & BannerActions>()(
  persist(
    (set, get) => {
      const saveHistory = (state: BannerState) => ({
        pastBanners: [...state.pastBanners.slice(-20), JSON.parse(JSON.stringify(state.bannerSettings))],
        futureBanners: []
      });

      return {
        bannerSettings: initialBannerSettings,
        selectedBannerCellIds: [],
        pastBanners: [],
        futureBanners: [],

        undo: () => set((state) => {
          if (!state.pastBanners || state.pastBanners.length === 0) return state;
          const previous = state.pastBanners[state.pastBanners.length - 1];
          const newPast = state.pastBanners.slice(0, -1);
          return { pastBanners: newPast, futureBanners: [JSON.parse(JSON.stringify(state.bannerSettings)), ...state.futureBanners], bannerSettings: previous };
        }),

        redo: () => set((state) => {
          if (!state.futureBanners || state.futureBanners.length === 0) return state;
          const next = state.futureBanners[0];
          const newFuture = state.futureBanners.slice(1);
          return { pastBanners: [...state.pastBanners, JSON.parse(JSON.stringify(state.bannerSettings))], futureBanners: newFuture, bannerSettings: next };
        }),

        updateBannerCell: (cellId, updates) => set((state) => {
          const newCells = state.bannerSettings.cells.map(c => c.id === cellId ? deepMerge(c, updates) : c);
          return { ...saveHistory(state), bannerSettings: { ...state.bannerSettings, cells: newCells } };
        }),

        updateSelectedBannerCells: (updates) => set((state) => {
          const newCells = state.bannerSettings.cells.map(c => state.selectedBannerCellIds.includes(c.id) ? deepMerge(c, updates) : c);
          return { ...saveHistory(state), bannerSettings: { ...state.bannerSettings, cells: newCells } };
        }),

        toggleBannerCellSelection: (id, isMulti) => set((state) => {
          let newSelectedIds = [];
          if (isMulti) {
            if (state.selectedBannerCellIds.includes(id)) newSelectedIds = state.selectedBannerCellIds.filter(x => x !== id);
            else newSelectedIds = [...state.selectedBannerCellIds, id];
          } else {
            newSelectedIds = state.selectedBannerCellIds[0] === id && state.selectedBannerCellIds.length === 1 ? [] : [id];
          }
          return { selectedBannerCellIds: newSelectedIds };
        }),

        clearBannerSelection: () => set({ selectedBannerCellIds: [] }),

        mergeBannerCells: () => {
          const state = get();
          const selected = state.selectedBannerCellIds;
          if (selected.length < 2) return { success: false, error: "En az 2 hücre seçmelisiniz." };

          const grid: (string | null)[][] = [];
          const coords: Record<string, { r: number; c: number; w: number; h: number }> = {};
          let r = 0, c = 0;
          
          state.bannerSettings.cells.filter(cell => !cell.hidden).forEach((cell) => {
            let placed = false;
            while (!placed) {
              if (!grid[r]) grid[r] = Array(8).fill(null);
              if (grid[r][c] === null) {
                for (let ir = 0; ir < cell.rowSpan; ir++) {
                  if (!grid[r + ir]) grid[r + ir] = Array(8).fill(null);
                  for (let ic = 0; ic < cell.colSpan; ic++) grid[r + ir][c + ic] = cell.id;
                }
                coords[cell.id] = { r, c, w: cell.colSpan, h: cell.rowSpan };
                placed = true;
              }
              if (!placed) { c++; if (c >= 8) { c = 0; r++; } }
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

          const newCells = [...state.bannerSettings.cells];
          const survivorIdx = newCells.findIndex(cell => cell.id === survivorId);
          
          newCells[survivorIdx] = { ...newCells[survivorIdx], colSpan: maxC - minC + 1, rowSpan: maxR - minR + 1 };

          selected.filter(id => id !== survivorId).forEach(id => {
            const idx = newCells.findIndex(cell => cell.id === id);
            newCells[idx] = { ...newCells[idx], hidden: true, mergedInto: survivorId, text: "", image: null };
          });

          set({ ...saveHistory(state), bannerSettings: { ...state.bannerSettings, cells: newCells }, selectedBannerCellIds: [survivorId] });
          return { success: true };
        },

        unmergeBannerCell: (cellId) => {
          const state = get();
          const newCells = [...state.bannerSettings.cells];
          const survivorIdx = newCells.findIndex(c => c.id === cellId);
          if (survivorIdx === -1) return;

          newCells[survivorIdx] = { ...newCells[survivorIdx], colSpan: 1, rowSpan: 1 };
          newCells.forEach((c, i) => { if (c.mergedInto === cellId) newCells[i] = { ...c, hidden: false, mergedInto: null }; });

          set({ ...saveHistory(state), bannerSettings: { ...state.bannerSettings, cells: newCells } });
        },

        // DÜZELTİLEN KISIM
        resetSelectedBannerCells: () => set((state) => {
          if (state.selectedBannerCellIds.length === 0) return state;
          
          const newCells = state.bannerSettings.cells.map(c => 
            state.selectedBannerCellIds.includes(c.id) ? {
              ...c,
              text: "", 
              image: null, 
              font: { ...defaultTypography, fontSize: 14, fontWeight: "700", color: "#1e293b" },
              padding: { ...defaultSpacing },
              bgColor: { c: "#ffffff", o: 0 },
              border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" as const } // "as const" eklendi
            } : c
          );

          return { ...saveHistory(state), bannerSettings: { ...state.bannerSettings, cells: newCells } };
        })

      };
    },
    { name: "banner-storage-v2" }
  )
);