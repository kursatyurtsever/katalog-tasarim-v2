export interface PageTemplateConfig {
  pageNumber: number;
  widthMm: number;
  safeZone: [number, number, number, number]; // [top, right, bottom, left] mm
}

export interface BrochureTemplate {
  id: string;
  name: string;
  pageCount: number;
  foldCount: number;
  foldType: "roll-fold" | "z-fold" | "half-fold" | "none";
  openWidthMm: number;
  openHeightMm: number;
  bleedMm: number;
  pages: PageTemplateConfig[];
}

export const Template1: BrochureTemplate = {
  id: "template-6-page-roll",
  name: "A4 6 Sayfa İçe Kırımlı Broşür",
  pageCount: 6,
  foldCount: 2,
  foldType: "roll-fold",
  openWidthMm: 627, // INDESIGN'DAN ALINDI (Önceki 631'di)
  openHeightMm: 297, // INDESIGN'DAN ALINDI
  bleedMm: 2, // INDESIGN'DAN ALINDI (Taşma payı)
  pages: [
    { pageNumber: 5, widthMm: 207, safeZone: [5, 5, 5, 5] },
    { pageNumber: 6, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 1, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 2, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 3, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 4, widthMm: 207, safeZone: [5, 5, 5, 5] },
  ],
};

export const Template2: BrochureTemplate = {
  id: "template-4-page-half",
  name: "A4 4 Sayfa Ortadan Kırımlı",
  pageCount: 4,
  foldCount: 1,
  foldType: "half-fold",
  openWidthMm: 420,
  openHeightMm: 297,
  bleedMm: 2,
  pages: [
    { pageNumber: 4, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 1, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 2, widthMm: 210, safeZone: [5, 5, 5, 5] },
    { pageNumber: 3, widthMm: 210, safeZone: [5, 5, 5, 5] },
  ],
};

export const availableTemplates: BrochureTemplate[] = [Template1, Template2];

export function getSlotCountForPage(pageNumber: number): number {
  // Varsayılan olarak her sayfa 4x4 = 16 grid içerir.
  return 16; 
}