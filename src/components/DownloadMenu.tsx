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

  const { setActiveFormaId } = useCatalogStore();
  const clearSelection = useUIStore((state) => state.clearSelection);
  const clearBannerSelection = useBannerStore((state) => state.clearBannerSelection);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const captureCurrentView = async (format: "jpeg" | "png") => {
    const canvasEl = document.getElementById("canvas");
    if (!canvasEl) return null;

    // html-to-image kütüphanesinin çökmesini engellemek için Canvas'ı anlık olarak
    // geçiş efektlerinden (transition) ve ölçeklendirmeden arındırıyoruz.
    const originalTransform = canvasEl.style.transform;
    const originalTransition = canvasEl.style.transition;
    const originalOutline = canvasEl.style.outline;

    try {
      // Çekim sırasında Canvas'ı tam orijinal boyutuna al ve çizgileri kaldır
      canvasEl.style.transition = "none";
      canvasEl.style.outline = "none";
      
      // UI "Ekrana Sığdır" veya "Orijinal" modunda olmasına bağlı olarak doğru transformu uygula
      if (useUIStore.getState().isZoomed) {
        canvasEl.style.transform = "scale(1)";
      } else {
        canvasEl.style.transform = "translate(-50%, -50%) scale(1)";
      }

      // Tarayıcının DOM'u (yeniden boyutlanmış haliyle) çizmesi için 150ms bekle
      await delay(150);

      const options = {
        quality: 1.0,
        pixelRatio: 2, // Yüksek kalite için
        backgroundColor: "#ffffff",
        cacheBust: true,
        imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Hatalı resimleri pas geçmek için
        filter: (node: HTMLElement) => {
          // Çıktıda görünmemesi gereken UI çizgilerini gizle
          if (node?.hasAttribute && node.hasAttribute("data-hide-on-export")) return false;
          return true;
        }
      };

      // html-to-image (Tailwind v4 oklab desteği için zorunlu)
      const dataUrl = format === "jpeg" 
        ? await toJpeg(canvasEl, options) 
        : await toPng(canvasEl, options);

      // Gerçek MM ölçülerini Store'dan hesapla
      const catalogStore = useCatalogStore.getState();
      const template = catalogStore.activeTemplate;
      const activeForma = catalogStore.formas.find(f => f.id === catalogStore.activeFormaId);

      let totalWidthMm = 210;
      if (activeForma) {
         totalWidthMm = activeForma.pages.reduce((sum, p) => {
           const pConf = template.pages.find(tp => tp.pageNumber === p.pageNumber);
           return sum + (pConf ? pConf.widthMm : 210);
         }, 0) + (template.bleedMm * 2);
      }
      const heightMm = template.openHeightMm + (template.bleedMm * 2);

      return { dataUrl, widthMm: totalWidthMm, heightMm };
    } catch (err) {
      console.error("Capture Error Detailed:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      throw err;
    } finally {
      // Çekim biter bitmez kullanıcı arayüzünü (UI) eski haline geri döndür
      canvasEl.style.transform = originalTransform;
      canvasEl.style.transition = originalTransition;
      canvasEl.style.outline = originalOutline;
    }
  };

  const handleExport = async (format: "pdf" | "jpeg" | "png") => {
    setIsOpen(false); 
    setIsExporting(true);
    
    // Mavi seçim çerçevelerinin çıktıda görünmemesi için seçimleri temizle
    clearSelection(); 
    if (clearBannerSelection) clearBannerSelection();

    const uiStore = useUIStore.getState();
    const catalogStore = useCatalogStore.getState();

    const originalFormaId = catalogStore.activeFormaId;
    const wasZoomed = uiStore.isZoomed;

    try {
      // Çıktının yüksek kalitede olabilmesi için container'ın scroll edilebilir orijinal formata geçmesi gerek
      if (!wasZoomed) {
        uiStore.toggleZoom();
        await delay(800); // UI animasyonunun bitmesini bekle
      }

      const capturedData = [];
      const formasToExport = catalogStore.formas;

      // Her bir formayı sırayla DOM'a yükle, bekle ve resmini çek
      for (const forma of formasToExport) {
        setActiveFormaId(forma.id);
        await delay(1500); // Sayfa içeriğinin ve resimlerin DOM'a tam yerleşmesini bekle

        const data = await captureCurrentView(format === "png" ? "png" : "jpeg");
        if (!data) throw new Error(`${forma.name} yakalanamadı.`);

        capturedData.push({ 
          ...data, 
          formaName: forma.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() 
        });
      }

      if (capturedData.length === 0) throw new Error("İndirilecek sayfa bulunamadı.");

      // Dosyaları oluştur ve İndir
      if (format === "pdf") {
        const first = capturedData[0];
        const pdf = new jsPDF({ 
          orientation: first.widthMm > first.heightMm ? "landscape" : "portrait", 
          unit: "mm", 
          format: [first.widthMm, first.heightMm] 
        });

        pdf.addImage(first.dataUrl, "JPEG", 0, 0, first.widthMm, first.heightMm);

        for (let i = 1; i < capturedData.length; i++) {
          const current = capturedData[i];
          pdf.addPage(
            [current.widthMm, current.heightMm], 
            current.widthMm > current.heightMm ? "landscape" : "portrait"
          );
          pdf.addImage(current.dataUrl, "JPEG", 0, 0, current.widthMm, current.heightMm);
        }
        
        pdf.save(`Katalog-Projesi-${Date.now()}.pdf`);
      } else {
        // Resim formatı ise her formayı ayrı bir dosya olarak indir
        for (let i = 0; i < capturedData.length; i++) {
          const link = document.createElement("a");
          link.download = `Katalog-${capturedData[i].formaName}-${Date.now()}.${format}`; 
          link.href = capturedData[i].dataUrl; 
          link.click();
          await delay(500); // Tarayıcı çoklu indirmeyi bloklamasın diye yarım saniye es ver
        }
      }
    } catch (error) {
      console.error("Export Error:", error); 
      alert("İndirme işlemi sırasında bir hata oluştu. Detaylar için konsola bakabilirsiniz.");
    } finally {
      // Çıktı işlemi bitince kullanıcının ekranını ilk haline (aktif forma ve zoom durumuna) geri getir
      setActiveFormaId(originalFormaId);
      if (!wasZoomed && useUIStore.getState().isZoomed) {
        useUIStore.getState().toggleZoom();
      }
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