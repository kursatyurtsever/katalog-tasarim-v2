"use client";

import { useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { useBannerStore } from "@/store/useBannerStore";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { CaretDown, DownloadSimple, FilePdf, Image as ImageIcon } from "@phosphor-icons/react";

export function DownloadMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activeTab = useCatalogStore((state) => state.activeTab);
  const setActiveTab = useCatalogStore((state) => state.setActiveTab);
  const clearSelection = useUIStore((state) => state.clearSelection);
  const clearBannerSelection = useBannerStore((state) => state.clearBannerSelection);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const captureCurrentView = async (format: "jpeg" | "png") => {
    const pages = Array.from(document.querySelectorAll('.physical-page')) as HTMLElement[];
    if (pages.length === 0) return null;

    const options = { quality: 1.0, pixelRatio: 2, backgroundColor: "#ffffff", filter: (node: HTMLElement) => { if (node?.hasAttribute && node.hasAttribute('data-hide-on-export')) return false; return true; } };

    const pageImages = [];
    for (const page of pages) {
      const dataUrl = format === "jpeg" ? await toJpeg(page, options) : await toPng(page, options);
      pageImages.push({ dataUrl, width: page.offsetWidth, height: page.offsetHeight });
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scale = 2; 
    const totalWidth = pageImages.reduce((sum, img) => sum + (img.width * scale), 0);
    const maxHeight = Math.max(...pageImages.map(img => img.height * scale));

    canvas.width = totalWidth; canvas.height = maxHeight;
    let currentX = 0;
    for (const img of pageImages) {
      const imageEl = new Image();
      imageEl.src = img.dataUrl;
      await new Promise((resolve) => { imageEl.onload = resolve; });
      ctx.drawImage(imageEl, currentX, 0, img.width * scale, img.height * scale);
      currentX += img.width * scale;
    }

    return { dataUrl: canvas.toDataURL(`image/${format}`, 1.0), widthMm: (totalWidth / scale) * 0.264583, heightMm: (maxHeight / scale) * 0.264583 };
  };

  const handleExport = async (format: "pdf" | "jpeg" | "png") => {
    setIsOpen(false); setIsExporting(true);
    clearSelection(); if (clearBannerSelection) clearBannerSelection();
    await delay(300); 

    const originalTab = activeTab;
    try {
      setActiveTab("outer"); await delay(1000); 
      const outerData = await captureCurrentView(format === "png" ? "png" : "jpeg");
      setActiveTab("inner"); await delay(1000);
      const innerData = await captureCurrentView(format === "png" ? "png" : "jpeg");
      setActiveTab(originalTab);

      if (!outerData || !innerData) throw new Error("Sayfalar yakalanamadı.");

      if (format === "pdf") {
        const pdf = new jsPDF({ orientation: outerData.widthMm > outerData.heightMm ? "landscape" : "portrait", unit: "mm", format: [outerData.widthMm, outerData.heightMm] });
        pdf.addImage(outerData.dataUrl, "JPEG", 0, 0, outerData.widthMm, outerData.heightMm);
        pdf.addPage([innerData.widthMm, innerData.heightMm], innerData.widthMm > innerData.heightMm ? "landscape" : "portrait");
        pdf.addImage(innerData.dataUrl, "JPEG", 0, 0, innerData.widthMm, innerData.heightMm);
        pdf.save(`Katalog-Projesi-${Date.now()}.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `Katalog-Dis-${Date.now()}.${format}`; link.href = outerData.dataUrl; link.click();
        await delay(500);
        const link2 = document.createElement("a");
        link2.download = `Katalog-Ic-${Date.now()}.${format}`; link2.href = innerData.dataUrl; link2.click();
      }
    } catch (error) {
      console.error("Export Error:", error); alert("İndirme işlemi sırasında bir hata oluştu.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      <DropdownMenu open={isOpen} onOpenChange={(open: boolean) => setIsOpen(open)}>
        <DropdownMenuTrigger
          disabled={isExporting}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary hover:bg-(--primary-hover) text-white text-[12px] font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 outline-none"
        >
          {isExporting ? (
            <span className="flex items-center gap-2 animate-pulse"><DownloadSimple size={18} weight="bold" /> HAZIRLANIYOR...</span>
          ) : (
            <>
              <DownloadSimple size={18} weight="bold" />
              İNDİR (EXPORT)
              <CaretDown size={14} weight="bold" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="center" side="top" sideOffset={12} className="w-56 bg-(--bg-panel) z-99999 shadow-2xl border-(--border-color) p-1.5 rounded-xl">
            <DropdownMenuItem onClick={() => handleExport("pdf")} className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-(--primary-light) focus:bg-(--primary-light) transition-colors group">
              <div className="w-8 h-8 bg-red-50 text-red-500 rounded-md flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors"><FilePdf size={18} weight="fill" /></div>
              <div className="flex flex-col"><span className="ui-text">PDF Belgesi</span><span className="ui-text-small text-[9px]">Yüksek Kalite Baskı</span></div>
            </DropdownMenuItem>
            <div className="h-px bg-(--border-color) my-1 opacity-50" />
            <DropdownMenuItem onClick={() => handleExport("jpeg")} className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-(--primary-light) focus:bg-(--primary-light) transition-colors group">
              <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors"><ImageIcon size={18} weight="fill" /></div>
              <div className="flex flex-col"><span className="ui-text">JPEG Resim</span><span className="ui-text-small text-[9px]">Dijital Paylaşım</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("png")} className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-(--primary-light) focus:bg-(--primary-light) transition-colors group">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-md flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors"><ImageIcon size={18} weight="fill" /></div>
              <div className="flex flex-col"><span className="ui-text">PNG Resim</span><span className="ui-text-small text-[9px]">Kayıpsız / Şeffaf</span></div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}
