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
  name?: string;
  type: 'image' | 'solid' | 'text' | 'shape'; // Added 'text' and 'shape' for common layer types
  bounds: { x: number; y: number; w: number; h: number };
  transform: { rotation: number; scale: number; flipX: boolean; flipY: boolean; offsetX: number; offsetY: number };
  mask?: { 
    type: 'page' | 'spread' | 'document'; 
    targetIds: string[]; 
    excludeGaps?: boolean; // YENİ: Sayfa arası boşlukları (gap) çıkarıp çıkarmayacağı
  }; 
  zIndex: number;
  visible?: boolean;
  locked?: boolean; // YENİ: Katman kilitleme desteği
  properties: {
    opacity?: number;
    blendMode?: string;
    fitMode?: 'cover' | 'contain' | 'repeat' | 'stretch' | 'fit-width' | 'fit-height';
    [key: string]: any;
  }; // Specific properties based on layer type
}
