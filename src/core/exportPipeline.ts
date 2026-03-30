import { Forma, CatalogSettings } from "@/store/useCatalogStore";
import { Layer } from "@/types/document";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useLayerStore } from "@/store/useLayerStore";
import { useBannerStore } from "@/store/useBannerStore";

export interface ExportData {
  projectName: string;
  exportDate: string;
  template: {
    id: string;
    openWidthMm: number;
    openHeightMm: number;
    bleedMm: number;
  };
  globalSettings: CatalogSettings;
  formas: Forma[];
  layers: Layer[];
  banners: any[];
  metadata: {
    version: string;
    renderer: string;
    targetDPI: number;
  };
}

/**
 * Tüm store'lardan veriyi toplayıp tek bir JSON (Source of Truth) oluşturur.
 */
export const collectExportData = (): ExportData => {
  const catalogState = useCatalogStore.getState();
  const layerState = useLayerStore.getState();
  const bannerState = useBannerStore.getState();

  const exportData: ExportData = {
    projectName: `Katalog_Export_${new Date().toISOString().split('T')[0]}`,
    exportDate: new Date().toISOString(),
    template: {
      id: catalogState.activeTemplate.id,
      openWidthMm: catalogState.activeTemplate.openWidthMm,
      openHeightMm: catalogState.activeTemplate.openHeightMm,
      bleedMm: catalogState.activeTemplate.bleedMm,
    },
    globalSettings: catalogState.globalSettings,
    formas: catalogState.formas,
    layers: layerState.layers,
    banners: (bannerState as any).banners || [],
    metadata: {
      version: "2.0.0-LMS",
      renderer: "AG-Export-Pipeline-v1",
      targetDPI: 300,
    }
  };

  return exportData;
};

/**
 * Toplanan veriyi backend'e (Puppeteer Worker) göndermek üzere hazırlar.
 */
export const triggerBackendExport = async (data: ExportData) => {
  console.log("🚀 [ExportPipeline] Backend Export Tetiklendi!", data);
  
  // İlerideki API çağrısı simülasyonu
  /*
  try {
    const response = await fetch('/api/export/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error("Export Error:", error);
  }
  */

  return { success: true, message: "Export data captured and queued." };
};
