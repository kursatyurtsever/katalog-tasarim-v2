export interface Document {
  id: string;
  type: string;
  spreads: Spread[];
  layers: Layer[];
  meta: any; // Consider defining a more specific interface for meta if needed
}

export interface Spread {
  id: string;
  pages: Page[];
  bleed: number; // Bleed (taşma payı) will be a number
}

export interface Page {
  id: string;
  width: number;
  height: number;
  side: 'left' | 'right' | 'single'; // e.g., for spreads, pages can be left or right
}

export interface Layer {
  id: string;
  type: 'image' | 'solid' | 'text' | 'shape'; // Added 'text' and 'shape' for common layer types
  bounds: { x: number; y: number; w: number; h: number };
  transform: { rotation: number; scale: number; flipX: boolean; flipY: boolean; offsetX: number; offsetY: number };
  mask?: { type: 'page' | 'spread' | 'document'; targetIds: string[] }; // 'page' | 'spread' | 'document' for mask type, targetIds are page or spread IDs
  zIndex: number;
  properties: any; // Specific properties based on layer type (e.g., imageUrl for image, color for solid)
}
