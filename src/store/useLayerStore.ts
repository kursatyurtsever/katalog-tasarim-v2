import { create } from 'zustand';
import { Layer } from '../types/document';
import { v4 as uuidv4 } from 'uuid';
import { useUIStore } from './useUIStore';
import { useCatalogStore } from './useCatalogStore';

interface LayerState {
  layers: Layer[];
  selectedPageIds: string[];
}

interface LayerActions {
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  updateLayerBounds: (layerId: string, bounds: { x?: number; y?: number; w?: number; h?: number }) => void;
  updateLayerTransform: (layerId: string, transform: Partial<Layer['transform']>) => void;
  updateLayerProperties: (layerId: string, properties: any) => void;
  setTargetPagesForMask: (layerId: string, pageIds: string[]) => void;
  selectPages: (pageIds: string[], options?: { multi?: boolean; toggle?: boolean }) => void;
  selectLayers: (layerIds: string[]) => void;
  moveLayer: (layerId: string, direction: 'up' | 'down') => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  fitLayerToPages: (layerId: string, pageIds: string[]) => void;
  setLayerMask: (layerId: string, mask: Layer['mask']) => void;
  duplicateLayer: (layerId: string) => void;
  reorderLayers: (newLayers: Layer[]) => void;
  syncGroupBackground: (groupIds: string[], type: 'base' | 'overlay', props: any) => void;
}

export const useLayerStore = create<LayerState & LayerActions>((set, get) => ({
  layers: [],
  selectedPageIds: [],

  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, { ...layer, visible: layer.visible ?? true }],
    })),

  removeLayer: (layerId) => {
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== layerId),
    }));
    
    // UI Store'daki seçimi de temizle
    const uiSelection = useUIStore.getState().selection;
    if (uiSelection.type === 'layer' && uiSelection.ids.includes(layerId)) {
      const newIds = uiSelection.ids.filter(id => id !== layerId);
      if (newIds.length === 0) {
        useUIStore.getState().clearSelection();
      } else {
        useUIStore.getState().setSelection({ ids: newIds });
      }
    }
  },

  updateLayerBounds: (layerId, newBounds) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, bounds: { ...layer.bounds, ...newBounds } }
          : layer
      ),
    })),

  updateLayerTransform: (layerId, newTransform) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, transform: { ...layer.transform, ...newTransform } }
          : layer
      ),
    })),

  updateLayerProperties: (layerId, newProperties) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, properties: { ...(layer.properties || {}), ...newProperties } }
          : layer
      ),
    })),

  setTargetPagesForMask: (layerId, pageIds) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, mask: layer.mask ? { ...layer.mask, targetIds: pageIds } : { type: 'page', targetIds: pageIds } }
          : layer
      ),
    })),

  selectPages: (pageIds, options) => {
    set((state) => {
      let newSelection = pageIds;
      if (options?.multi) {
        newSelection = [...state.selectedPageIds];
        pageIds.forEach(id => {
          if (newSelection.includes(id)) {
            if (options.toggle) newSelection = newSelection.filter(x => x !== id);
          } else {
            newSelection.push(id);
          }
        });
      } else if (options?.toggle && pageIds.length === 1) {
        const id = pageIds[0];
        newSelection = state.selectedPageIds.includes(id) ? [] : [id];
      }

      // Üst bar (Contextual Bar) ile senkronize et
      const numericIds = newSelection.map(id => {
        const match = id.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      }).filter(n => n !== null) as number[];
      
      // Async call to avoid infinite loops during render phase if called improperly
      setTimeout(() => {
        useUIStore.getState().setContextualBarSelectedPages(numericIds);
      }, 0);

      return { selectedPageIds: newSelection };
    });
  },

  selectLayers: (layerIds) => {
    if (layerIds.length === 0) {
      useUIStore.getState().clearSelection();
    } else {
      useUIStore.getState().setSelection({ type: 'layer', ids: layerIds });
    }
  },

  moveLayer: (layerId, direction) =>
    set((state) => {
      const index = state.layers.findIndex((l) => l.id === layerId);
      if (index === -1) return state;

      const newLayers = [...state.layers];
      const targetIndex = direction === 'up' ? index + 1 : index - 1;

      if (targetIndex >= 0 && targetIndex < newLayers.length) {
        [newLayers[index], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[index]];
      }

      return { layers: newLayers };
    }),

  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      ),
    })),

  toggleLayerLock: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, locked: !l.locked } : l
      ),
    })),

  setLayerMask: (layerId, mask) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, mask } : l
      ),
    })),

  fitLayerToPages: (layerId, pageIds) => {
    const catalogState = useCatalogStore.getState();
    const template = catalogState.activeTemplate;
    if (!template) return;

    let minX = Infinity;
    let maxX = -Infinity;
    const minY = 0;
    const maxY = template.openHeightMm;

    pageIds.forEach(pid => {
      const pageNum = parseInt(pid.split('-')[1]);
      const pageIndex = template.pages.findIndex(p => p.pageNumber === pageNum);
      if (pageIndex !== -1) {
        const xOffset = template.pages.slice(0, pageIndex).reduce((sum, p) => sum + p.widthMm, 0);
        const pageWidth = template.pages[pageIndex].widthMm;
        
        minX = Math.min(minX, xOffset);
        maxX = Math.max(maxX, xOffset + pageWidth);
      }
    });

    if (minX === Infinity) return;

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId 
          ? { ...l, bounds: { x: minX, y: minY, w: maxX - minX, h: maxY - minY } }
          : l
      ),
    }));
  },

  duplicateLayer: (layerId) => {
    const state = get();
    const sourceLayer = state.layers.find(l => l.id === layerId);
    if (!sourceLayer) return;

    const newLayer: Layer = {
      ...(JSON.parse(JSON.stringify(sourceLayer)) as any),
      id: uuidv4(),
      name: `${sourceLayer.name || 'Katman'} (Kopya)`,
      bounds: {
        ...sourceLayer.bounds,
        x: sourceLayer.bounds.x + 10,
        y: sourceLayer.bounds.y + 10
      }
    };

    set((state) => ({
      layers: [...state.layers, newLayer],
    }));
    useUIStore.getState().setSelection({ type: 'layer', ids: [newLayer.id] });
  },

  reorderLayers: (newLayers) => set(() => ({ layers: newLayers })),

  syncGroupBackground: (groupIds, type, props) => {
    if (!groupIds || groupIds.length === 0) {
      console.warn('[LMS] syncGroupBackground called with empty groupIds');
      return;
    }

    const state = get();
    const catalogState = useCatalogStore.getState();
    const template = catalogState.activeTemplate;
    if (!template) {
      console.warn('[LMS] No active template found');
      return;
    }

    // Hedef katmanı bul: tam olarak bu ID setini hedefleyen ve tipi eşleşen katman
    const existingLayer = state.layers.find(l => {
      const isCorrectType = type === 'base' ? l.type === 'solid' : l.type === 'image';
      const ids = l.mask?.targetIds || [];
      const sameLength = ids.length === groupIds.length;
      const sameIds = sameLength && ids.every(id => groupIds.includes(id));
      return isCorrectType && sameIds;
    });

    if (existingLayer) {
      // Mevcut katmanı güncelle
      state.updateLayerProperties(existingLayer.id, props);
      return;
    }

    // Yeni katman oluştur — koordinatları doğrudan hesapla
    let minX = Infinity;
    let maxX = -Infinity;

    groupIds.forEach(pid => {
        const forma = catalogState.formas.find(f => f.pages.some(p => p.id === pid));
        if (!forma) return;

        const targetIndex = forma.pages.findIndex(p => p.id === pid);
        if (targetIndex === -1) return;

        const xOffset = forma.pages.slice(0, targetIndex).reduce((sum: number, p: any) => {
          const pTemplate = template.pages.find((tp: any) => tp.pageNumber === p.pageNumber);
          return sum + (pTemplate?.widthMm || 210);
        }, 0);

        const pc = template.pages.find((tp: any) => tp.pageNumber === forma.pages[targetIndex].pageNumber);
        const pageWidth = pc ? pc.widthMm : 210;

        // HATA ÇÖZÜMÜ 3: Katman genişliklerine de taşma payını ekliyoruz
        let startX = xOffset + template.bleedMm;
        let endX = startX + pageWidth;

        if (targetIndex === 0) startX -= template.bleedMm; // İlk sayfanın sol taşması
        if (targetIndex === forma.pages.length - 1) endX += template.bleedMm; // Son sayfanın sağ taşması

        minX = Math.min(minX, startX);
        maxX = Math.max(maxX, endX);
      });

      if (minX === Infinity || maxX === -Infinity) {
        console.error('[LMS] Coordinate calculation failed for IDs:', groupIds);
        return;
      }

      const newLayer: Layer = {
        id: uuidv4(),
        type: type === 'base' ? 'solid' : 'image',
        name: type === 'base' ? 'Zemin Rengi' : 'Zemin Görseli',
        // HATA ÇÖZÜMÜ 4: Yüksekliği bleed alanlarını kapsayacak şekilde büyüttük
        bounds: { x: minX, y: 0, w: maxX - minX, h: template.openHeightMm + (template.bleedMm * 2) },
        transform: { rotation: 0, scale: 100, flipX: false, flipY: false, offsetX: 0, offsetY: 0 },
      mask: {
        type: groupIds.length > 1 ? 'spread' : 'page',
        targetIds: [...groupIds],
        excludeGaps: true,
      },
      zIndex: type === 'base' ? 0 : 1,
      properties: { ...props },
      visible: true,
      locked: false,
    };

    state.addLayer(newLayer);
  },
}));

// Yardımcı koordinat fonksiyonu
function pageIdsToRect(pageIds: string[], template: any, cb: (rect: {x:number, y:number, w:number, h:number}) => void) {
  if (!pageIds || pageIds.length === 0) return;
  
  pageIds.forEach(pid => {
    // page-1 veya sadece sayfa numarası formatını dene
    const match = pid.match(/\d+/);
    const pageNum = match ? parseInt(match[0]) : null;
    
    if (pageNum === null) return;

    const pageIndex = template.pages.findIndex((p:any) => p.pageNumber === pageNum);
    if (pageIndex !== -1) {
      const xOffset = template.pages.slice(0, pageIndex).reduce((sum:number, p:any) => sum + p.widthMm, 0);
      const pageWidth = template.pages[pageIndex].widthMm;
      cb({ x: xOffset, y: 0, w: pageWidth, h: template.openHeightMm });
    }
  });
}