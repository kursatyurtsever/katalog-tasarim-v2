"use client";

import { defaultBackground, useCatalogStore } from "@/store/useCatalogStore";
import { Slot } from "./Slot";
import { PizzaSection } from "./PizzaSection";
import { BannerSection } from "./BannerSection"; // YENİ EKLENDİ
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Slot as SlotType } from "@/store/useCatalogStore";

export function Page({ pageNumber }: { pageNumber: number }) {
  const formas = useCatalogStore((state) => state.formas);
  const activeFormaId = useCatalogStore((state) => state.activeFormaId);
  const globalBackground = useCatalogStore((state) => state.globalBackground);
  const isGlobalActive = useCatalogStore((state) => state.isGlobalActive);
  const template = useCatalogStore((state) => state.activeTemplate);
  const gridGap = useCatalogStore((state) => state.globalSettings?.gridGap ?? 0);
  const updatePageFooter = useCatalogStore((state) => state.updatePageFooter);
  const mergeSelected = useCatalogStore((state) => state.mergeSelected);
  const unmergeSlot = useCatalogStore((state) => state.unmergeSlot);
  const clearSlot = useCatalogStore((state) => state.clearSlot);

  const activeForma = formas.find((f) => f.id === activeFormaId);
  const pages = activeForma?.pages || [];

  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slot: SlotType; canMerge: boolean; canUnmerge: boolean; hasProduct: boolean } | null>(null);

  useEffect(() => {
    const handleWindowClick = () => setContextMenu(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, slot: SlotType) => {
    e.preventDefault();
    const selected = useCatalogStore.getState().selectedSlotIds;
    const canMerge = selected.length > 1 && selected.includes(slot.id);
    const canUnmerge = slot.colSpan > 1 || slot.rowSpan > 1;
    const hasProduct = !!slot.product;

    if (canMerge || canUnmerge || hasProduct) {
      setContextMenu({ x: e.clientX, y: e.clientY, slot, canMerge, canUnmerge, hasProduct });
    }
  };

  const currentPage = pages.find((p) => p.pageNumber === pageNumber);
  const pageConfig = template.pages.find((p) => p.pageNumber === pageNumber);

  if (!currentPage || !pageConfig) return null;

  // Zemin Hiyerarşisi (Fallback) Hesaplama
  // 1. Broşür Global (isGlobalActive)
  // 2. Sayfa Özel (currentPage.background)
  // 3. Forma Özel (activeForma.globalBackground)
  
  let bg = defaultBackground;
  let isUsingGlobal = false;

  if (isGlobalActive) {
    bg = { ...defaultBackground, ...globalBackground };
    isUsingGlobal = true;
  } else {
    // Sayfa zemininde veri var mı kontrol et (default değilse)
    const pageBg = currentPage.background;
    const hasPageBg = !!(pageBg?.imageUrl || (pageBg?.color && pageBg.color.toLowerCase() !== "#ffffff" && pageBg.color !== "transparent"));

    if (hasPageBg && pageBg) {
      bg = { ...defaultBackground, ...pageBg };
    } else {
      // Sayfa boşsa formaya bak
      const formaBg = activeForma?.globalBackground;
      if (formaBg && (formaBg.imageUrl || (formaBg.color && formaBg.color.toLowerCase() !== "#ffffff" && formaBg.color !== "transparent"))) {
        bg = { ...defaultBackground, ...formaBg };
      } else {
        // Hepsi boşsa varsayılan beyaz
        bg = { ...defaultBackground, color: "#ffffff", opacity: 100 };
      }
    }
  }

  const hexToRgba = (hex: string, opacity: number) => {
    if (hex === "transparent") return "transparent";
    let r = 0, g = 0, b = 0;
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const pageStyle = {
    width: `${pageConfig.widthMm}mm`,
    height: "297mm",
    boxSizing: "border-box" as const,
    backgroundColor: "transparent",
  };

  // Spread (Yayılma) hesaplaması
  const isSpread = bg.isSpread && bg.type === "image" && bg.imageUrl;
  
  // Forma içindeki sayfaların sırasını bulalım (Sol/Sağ ayrımı için)
  const pageIndexInForma = pages.findIndex(p => p.pageNumber === pageNumber);
  const isLeftPage = pageIndexInForma % 2 === 0; // 0, 2, 4... sol sayfa (forma bazında)

  const pageBackgroundColorStyle = {
    backgroundColor: hexToRgba(bg.color, bg.opacity),
    // Eğer global aktifse ve Canvas zaten bu zemini basıyorsa, Page'de tekrar basmaya gerek yok.
    display: isUsingGlobal ? "none" : "block"
  };

  // Yayılmış modda ölçek ve pan hesaplamalarını düzelt
  // background-size: Genişlik, iki sayfanın toplam genişliğinin ölçeklenmiş halidir.
  // background-position:
  // - X: Ölçeği hesaba katmalı ve sayfa konumuna (sol/sağ) göre ayarlanmalıdır.
  // - Y: Direkt offsetY olarak kullanılır.
  const spreadScale = bg.scale / 100;
  const spreadWidth = 200 * spreadScale;
  const spreadHeight = 100 * spreadScale;
  
  // Pan X'i ölçeğe göre ayarla. Ölçek büyüdükçe, Pan X'in etkisi azalmalı.
  // İki sayfa olduğu için pozisyonu 0-100 aralığında düşünelim.
  // Sol sayfa: 0 ila 50, Sağ sayfa: 50 ila 100.
  // OffsetX, bu 200% genişliğindeki alan içindeki kaydırmayı temsil eder.
  const panXForSpread = bg.offsetX;
  const panYForSpread = bg.offsetY;

  // Yeni özellikler için CSS property'lerini hazırla
  const backgroundSize = {
    cover: 'cover',
    contain: 'contain',
    repeat: 'auto', // background-repeat 'repeat' olacak
    stretch: '100% 100%',
  }[bg.fitMode];

  const backgroundRepeat = bg.fitMode === 'repeat' ? 'repeat' : 'no-repeat';

  // flipX ve flipY için transform scale değerleri
  const scaleX = bg.flipX ? -1 : 1;
  const scaleY = bg.flipY ? -1 : 1;

  // Tüm transform'ları birleştir
  const transform = `rotate(${bg.rotation}deg) scale(${scaleX}, ${scaleY})`;

  const pageBackgroundImageStyle = {
    backgroundImage: bg.type === "image" && bg.imageUrl ? `url(${bg.imageUrl})` : undefined,
    backgroundRepeat: backgroundRepeat,
    opacity: bg.imageOpacity / 100,
    transform: transform,
    transformOrigin: "center",
    mixBlendMode: bg.blendMode as any, // type assertion

    ...(isSpread
      ? {
          backgroundSize: '200% 100%', // İki sayfayı kaplayacak şekilde
          backgroundPosition: `${isLeftPage ? '0%' : '100%'} 50%`,
        }
      : {
          backgroundSize: backgroundSize,
          backgroundPosition: `${bg.offsetX}px ${bg.offsetY}px`,
        }),
  };

  const [mt, mr, , ml] = pageConfig.safeZone;
  const totalColumns = 4;
  const totalRows = Math.ceil(currentPage.slots.length / totalColumns);

  const previousVisibleCount = pages
    .filter(p => p.pageNumber < pageNumber)
    .reduce((sum, p) => sum + p.slots.filter((s, idx) => !s.hidden && !(p.pageNumber === 1 && idx < 4) && !(p.pageNumber === 6 && idx < 8)).length, 0);

  let visibleCounter = 0;
  const renderSlots = (startIndex: number) => {
    const grid: boolean[][] = [];
    let r = Math.floor(startIndex / totalColumns), c = startIndex % totalColumns;

    return currentPage.slots.map((slot, idx) => {
      if (idx < startIndex || slot.hidden) return null;
      let placed = false, startR = r, startC = c;
      while (!placed) {
        if (!grid[r]) grid[r] = [];
        if (!grid[r][c]) {
          let canFit = (c + slot.colSpan <= totalColumns);
          if (canFit) {
            for (let ir = 0; ir < slot.rowSpan; ir++) {
              if (!grid[r + ir]) grid[r + ir] = [];
              for (let ic = 0; ic < slot.colSpan; ic++) { if (grid[r + ir][c + ic]) { canFit = false; break; } }
              if (!canFit) break;
            }
          }
          if (canFit) {
            for (let ir = 0; ir < slot.rowSpan; ir++) { for (let ic = 0; ic < slot.colSpan; ic++) grid[r + ir][c + ic] = true; }
            startR = r; startC = c; placed = true;
          }
        }
        if (!placed) { c++; if (c >= totalColumns) { c = 0; r++; } }
      }
      visibleCounter++;
      return <Slot key={slot.id} slot={slot} pageNumber={pageNumber} slotIndex={idx} globalNumber={previousVisibleCount + visibleCounter} onContextMenu={handleContextMenu} gridPosition={{ colStart: startC + 1, rowStart: startR + 1 }} />;
    });
  };

  return (
    <>
      {contextMenu && createPortal(
        <div className="fixed z-[9999] bg-white border border-slate-300 shadow-2xl rounded-md py-1 min-w-[150px]" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
          {contextMenu.canMerge && <button className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50" onClick={() => { mergeSelected(pageNumber, contextMenu.slot.id); setContextMenu(null); }}>Hücreleri Birleştir</button>}
          {contextMenu.canUnmerge && <button className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-red-50" onClick={() => { unmergeSlot(pageNumber, contextMenu.slot.id); setContextMenu(null); }}>Hücreyi Dağıt</button>}
          {contextMenu.hasProduct && <button className="w-full text-left px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50" onClick={() => { clearSlot(pageNumber, contextMenu.slot.id); setContextMenu(null); }}>Temizle</button>}
        </div>, document.body
      )}
      <div
        id={`page-${pageNumber}`}
        className="physical-page relative shrink-0 overflow-hidden shadow-lg"
        style={pageStyle}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            useCatalogStore.getState().clearSelectionAndSelectPage(currentPage.pageNumber);
          }
        }}
      >
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={pageBackgroundColorStyle}
        >
          {bg.type === 'image' && bg.imageUrl && (
            <div 
              className="absolute inset-0" 
              style={pageBackgroundImageStyle} 
            />
          )}
        </div>
        <div className="safe-zone absolute z-10 flex flex-col" style={{ top: `${mt}mm`, right: `${mr}mm`, bottom: "30mm", left: `${ml}mm` }}>
          
          {/* BANNER ALANI GÜNCELLENDİ */}
          {pageNumber === 1 && (
            <div className="absolute top-0 left-0 w-full z-10" style={{ height: `calc((100% / ${totalRows}) - 5mm)` }}>
              <BannerSection />
            </div>
          )}
          
          {pageNumber === 6 && <div className="absolute top-0 left-0 w-full z-10" style={{ height: `calc(((100% / ${totalRows}) * 2) - 5mm)` }}><PizzaSection /></div>}
          <div className="grid flex-1 min-h-0 min-w-0 w-full h-full relative z-0" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`, gap: `${gridGap}mm` }}>{renderSlots(pageNumber === 1 ? 4 : pageNumber === 6 ? 8 : 0)}</div>
        </div>
        <div className="absolute w-full flex items-end gap-5 z-50" style={{ bottom: "10mm", left: "0", paddingLeft: "10mm", paddingRight: "10mm", height: "12mm" }}>
          
          {/* LOGO ALANI: Eğer logo yoksa çıktıda tamamen gizlenecek */}
          <div 
            data-hide-on-export={!currentPage.footerLogo ? "true" : undefined}
            onClick={() => footerLogoInputRef.current?.click()} 
            className={`w-[35mm] h-full flex items-center justify-center border border-dashed rounded cursor-pointer overflow-hidden ${currentPage.footerLogo ? 'border-transparent' : 'border-slate-300 bg-slate-50 shadow-inner'}`}
          >
            {currentPage.footerLogo ? (
              <img src={currentPage.footerLogo} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-[7px] text-slate-400 font-bold uppercase text-center">LOGO</span>
            )}
            <input type="file" ref={footerLogoInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) updatePageFooter(pageNumber, { footerLogo: URL.createObjectURL(file) }); }} />
          </div>
          
          {/* METİN ALANI: Placeholder mantığıyla çalışır, tıklayınca silinir, boşsa silik görünür */}
          <div 
            data-hide-on-export={!currentPage.footerText || currentPage.footerText.trim() === "" || currentPage.footerText === "Sayfa altı notu..." ? "true" : undefined}
            contentEditable 
            suppressContentEditableWarning 
            onFocus={(e) => {
              // Tıklanınca eğer içindeki yazı varsayılan metinse, içini tamamen boşalt
              if (e.currentTarget.textContent === "Sayfa altı notu...") {
                e.currentTarget.textContent = "";
              }
            }}
            onBlur={(e) => {
              // Dışarı tıklanınca eğer boş bırakılmışsa varsayılan metni geri getir, doluysa yazılanı kaydet
              const val = e.currentTarget.textContent?.trim() || "";
              updatePageFooter(pageNumber, { footerText: val === "" ? "Sayfa altı notu..." : val });
            }} 
            className={`flex-1 text-[11px] font-semibold outline-none border-b border-transparent hover:border-slate-200 pb-1 transition-colors ${
              currentPage.footerText === "Sayfa altı notu..." ? "text-slate-300 italic font-normal" : "text-slate-700"
            }`}
          >
            {currentPage.footerText}
          </div>
          
          {/* SAYFA NUMARASI: Her zaman gizlenecek */}
          <div 
            data-hide-on-export="true" 
            className="text-[10px] font-black text-slate-300 uppercase pb-1 tracking-tighter"
          >
            P.{pageNumber}
          </div>

        </div>
      </div>
    </>
  );
}
