"use client";

import { useState } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { useLayerStore } from "@/store/useLayerStore";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { CaretDown, DownloadSimple, FilePdf, Image as ImageIcon } from "@phosphor-icons/react";

export function DownloadMenu() {
  const [isExporting, setIsExporting] = useState(false);

  const clearSelection = useUIStore((state) => state.clearSelection);

  const handleExport = async (format: "pdf" | "png" | "jpeg") => {
    setIsExporting(true);
    
    clearSelection(); 

    const catalogStore = useCatalogStore.getState();
    const layerStore = useLayerStore.getState();
    const formaIds = catalogStore.formas.map(f => f.id);

    if (formaIds.length === 0) {
      alert("İndirilecek sayfa bulunamadı.");
      setIsExporting(false);
      return;
    }

    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          formaIds,
          format,
          catalogState: catalogStore,
          layerState: layerStore
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Sunucu hatası.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Katalog-Projesi-${Date.now()}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Error:", error); 
      alert("İndirme işlemi sırasında bir hata oluştu: " + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isExporting}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary hover:bg-(--primary-hover) text-white text-[12px] font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 outline-none [&[data-state=open]>svg:last-child]:rotate-180"
        >
          {isExporting ? (
            <span className="flex items-center gap-2 animate-pulse"><DownloadSimple size={18} weight="bold" /> HAZIRLANIYOR...</span>
          ) : (
            <>
              <DownloadSimple size={18} weight="bold" />
              İNDİR (EXPORT)
              <CaretDown size={14} weight="bold" className="transition-transform duration-200" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="center" side="top" sideOffset={12} className="w-56 bg-(--bg-panel) z-99999 shadow-2xl border-(--border-color) p-1.5 rounded-xl">
            <DropdownMenuItem onClick={() => handleExport("pdf")} className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-(--primary-light) focus:bg-(--primary-light) transition-colors group">
              <div className="w-8 h-8 bg-red-50 text-red-500 rounded-md flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors"><FilePdf size={18} weight="fill" /></div>
              <div className="flex flex-col"><span className="ui-text">PDF Belgesi</span><span className="ui-text-small text-[9px]">Yüksek Kalite Baskı</span></div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleExport("png")} className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-(--primary-light) focus:bg-(--primary-light) transition-colors group mt-1">
              <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors"><ImageIcon size={18} weight="fill" /></div>
              <div className="flex flex-col"><span className="ui-text">PNG Görseli</span><span className="ui-text-small text-[9px]">Şeffaf Arkaplan</span></div>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleExport("jpeg")} className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-(--primary-light) focus:bg-(--primary-light) transition-colors group mt-1">
              <div className="w-8 h-8 bg-green-50 text-green-500 rounded-md flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors"><ImageIcon size={18} weight="fill" /></div>
              <div className="flex flex-col"><span className="ui-text">JPEG Görseli</span><span className="ui-text-small text-[9px]">Yüksek Kalite</span></div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}