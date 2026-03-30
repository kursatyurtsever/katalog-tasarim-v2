import { create } from 'zustand';
import { Layer } from '../types/document';

interface LayerState {
  layers: Layer[];
  selectedLayerIds: string[];
  selectedPageIds: string[];
}

interface LayerActions {
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  updateLayerBounds: (layerId: string, bounds: { x?: number; y?: number; w?: number; h?: number }) => void;
  updateLayerTransform: (layerId: string, transform: Partial<Layer['transform']>) => void;
  updateLayerProperties: (layerId: string, properties: any) => void;
  setTargetPagesForMask: (layerId: string, pageIds: string[]) => void;
  selectPages: (pageIds: string[]) => void;
  selectLayers: (layerIds: string[]) => void;
}

export const useLayerStore = create<LayerState & LayerActions>((set) => ({
  layers: [],
  selectedLayerIds: [],
  selectedPageIds: [],

  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),

  removeLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== layerId),
    })),

  updateLayerBounds: (layerId, newBounds) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, bounds: { ...layer.bounds, ...newBounds } }
          : layer
      ),
    })),

  updateLayerTransform: (layerId: string, newTransform: Partial<Layer['transform']>) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, transform: { ...layer.transform, ...newTransform } }
          : layer
      ),
    })),

  updateLayerProperties: (layerId: string, newProperties: any) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, properties: { ...layer.properties, ...newProperties } }
          : layer
      ),
    })),

  setTargetPagesForMask: (layerId, pageIds) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, mask: { type: 'page', targetIds: pageIds } } // Assuming mask type 'page' for simplicity, could be dynamic
          : layer
      ),
    })),

  selectPages: (pageIds) => set(() => ({ selectedPageIds: pageIds })),

  selectLayers: (layerIds) => set(() => ({ selectedLayerIds: layerIds })),
}));
