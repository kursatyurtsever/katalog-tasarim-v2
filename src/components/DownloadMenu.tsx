"use client";

import { useState } from "react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useBannerStore } from "@/store/useBannerStore"; // YENİ EKLENDİ

export function DownloadMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activeTab = useCatalogStore((state) => state.activeTab);
  const setActiveTab = useCatalogStore((state) => state.setActiveTab);
  
  // YENİ EKLENDİ: Seçimleri temizleme komutları
  const clearSelection = useCatalogStore((state) => state.clearSelection);
  const clearBannerSelection = useBannerStore((state) => state.clearBannerSelection);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const captureCurrentView = async (format: "jpeg" | "png") => {
    const pages = Array.from(document.querySelectorAll('.physical-page')) as HTMLElement[];
    if (pages.length === 0) return null;

    const options = {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      filter: (node: HTMLElement) => {
        if (node.hasAttribute && node.hasAttribute('data-hide-on-export')) return false;
        return true;
      }
    };

    const pageImages = [];
    for (const page of pages) {
      const dataUrl = format === "png" 
        ? await htmlToImage.toPng(page, options) 
        : await htmlToImage.toJpeg(page, options);
        
      pageImages.push({
        dataUrl,
        width: page.offsetWidth,
        height: page.offsetHeight
      });
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scale = 2; 
    const totalWidth = pageImages.reduce((sum, img) => sum + (img.width * scale), 0);
    const maxHeight = Math.max(...pageImages.map(img => img.height * scale));

    canvas.width = totalWidth;
    canvas.height = maxHeight;

    let currentX = 0;
    for (const img of pageImages) {
      const imageEl = new Image();
      imageEl.src = img.dataUrl;
      await new Promise((resolve) => { imageEl.onload = resolve; });
      
      ctx.drawImage(imageEl, currentX, 0, img.width * scale, img.height * scale);
      currentX += img.width * scale;
    }

    return {
      dataUrl: canvas.toDataURL(`image/${format}`, 1.0),
      widthMm: (totalWidth / scale) * 0.264583,
      heightMm: (maxHeight / scale) * 0.264583
    };
  };

  const handleExport = async (format: "pdf" | "jpeg" | "png") => {
    setIsOpen(false);
    setIsExporting(true);

    // YENİ EKLENDİ: Çıktı başlamadan hemen önce tüm mavi seçim çerçevelerini kaldır!
    clearSelection();
    clearBannerSelection();
    await delay(100); // React'in çerçeveleri ekrandan silmesi için 0.1 sn salise bekle

    const originalTab = activeTab;

    try {
      setActiveTab("outer");
      await delay(600); 
      const outerImageFormat = format === "png" ? "png" : "jpeg";
      const outerData = await captureCurrentView(outerImageFormat);

      setActiveTab("inner");
      await delay(600);
      const innerData = await captureCurrentView(outerImageFormat);

      setActiveTab(originalTab);

      if (!outerData || !innerData) {
        throw new Error("Sayfalar yakalanamadı.");
      }

      if (format === "pdf") {
        const pdf = new jsPDF({
          orientation: outerData.widthMm > outerData.heightMm ? "landscape" : "portrait",
          unit: "mm",
          format: [outerData.widthMm, outerData.heightMm]
        });
        pdf.addImage(outerData.dataUrl, "JPEG", 0, 0, outerData.widthMm, outerData.heightMm);
        
        pdf.addPage([innerData.widthMm, innerData.heightMm], innerData.widthMm > innerData.heightMm ? "landscape" : "portrait");
        pdf.addImage(innerData.dataUrl, "JPEG", 0, 0, innerData.widthMm, innerData.heightMm);

        pdf.save(`Katalog-Tam-${Date.now()}.pdf`);
      } else {
        const linkOuter = document.createElement("a");
        linkOuter.download = `Katalog-Dis-Sayfalar-${Date.now()}.${format}`;
        linkOuter.href = outerData.dataUrl;
        linkOuter.click();

        await delay(500);

        const linkInner = document.createElement("a");
        linkInner.download = `Katalog-Ic-Sayfalar-${Date.now()}.${format}`;
        linkInner.href = innerData.dataUrl;
        linkInner.click();
      }

    } catch (error) {
      console.error("Çıktı alınırken hata:", error);
      alert("Çıktı alınırken bir hata oluştu. Lütfen konsolu kontrol edin.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative z-[9999]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded shadow-md transition-colors ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isExporting ? "İndirme hazırlanıyor" : "İndir ▼"}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-slate-200 rounded shadow-lg overflow-hidden flex flex-col">
          <button onClick={() => handleExport("pdf")} className="px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-100">
            PDF
          </button>
          <button onClick={() => handleExport("jpeg")} className="px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-100">
            JPEG
          </button>
          <button onClick={() => handleExport("png")} className="px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            PNG
          </button>
        </div>
      )}
    </div>
  );
}