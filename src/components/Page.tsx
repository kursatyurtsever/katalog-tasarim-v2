"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { Slot } from "./Slot";
import { useRef } from "react";

export function Page({ pageNumber }: { pageNumber: number }) {
  const pages = useCatalogStore((state) => state.pages);
  const template = useCatalogStore((state) => state.activeTemplate);
  const gridGap = useCatalogStore((state) => state.globalSettings?.gridGap ?? 0);
  const updatePageFooter = useCatalogStore((state) => state.updatePageFooter);
  
  const footerLogoInputRef = useRef<HTMLInputElement>(null);

  const currentPage = pages.find((p) => p.pageNumber === pageNumber);
  const pageConfig = template.pages.find((p) => p.pageNumber === pageNumber);

  if (!currentPage || !pageConfig) return null;

  const [mt, mr, mb, ml] = pageConfig.safeZone;
  const totalColumns = 4;
  const totalRows = Math.ceil(currentPage.slots.length / totalColumns);
  const singleRowHeight = `calc((100% - (${totalRows - 1} * ${gridGap}mm)) / ${totalRows})`;

  // --- HÜCRE SAYMA MANTIĞI (BANNERLARI ATLAR) ---
  const getActiveSlotsInPage = (pNum: number, totalSlots: number) => {
    if (pNum === 1) return totalSlots - 4;      // 1. sayfada banner (4 slot) yok sayılır
    if (pNum === 6) return totalSlots - 8;      // 6. sayfada pizza (8 slot) yok sayılır
    return totalSlots;                          // Diğer sayfalar tam sayılır
  };

  // Mevcut sayfadan önceki gerçek ürün slotlarının toplamı
  const previousActiveSlotsCount = pages
    .filter(p => p.pageNumber < pageNumber)
    .reduce((sum, p) => sum + getActiveSlotsInPage(p.pageNumber, p.slots.length), 0);

  return (
    <div className="physical-page relative bg-white shadow-lg shrink-0 overflow-hidden"
      style={{ width: `${pageConfig.widthMm}mm`, height: "297mm", boxSizing: "border-box" }}>
      
      <div className="safe-zone absolute flex flex-col"
        style={{ top: `${mt}mm`, right: `${mr}mm`, bottom: "30mm", left: `${ml}mm` }}>
        
        {pageNumber === 1 ? (
          <div className="flex flex-col h-full" style={{ gap: `${gridGap}mm` }}>
            {/* Banner Alanı (Numarasız) */}
            <div className="w-full border-[3px] border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center shrink-0"
              style={{ height: singleRowHeight }}>
              <div className="text-slate-400 font-bold text-sm uppercase tracking-widest text-center">1. SAYFA BANNER</div>
            </div>
            {/* Ürünler (1'den başlar) */}
            <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)`, gridAutoRows: "1fr", gap: `${gridGap}mm` }}>
              {currentPage.slots.slice(4).map((slot, idx) => (
                <Slot 
                  key={slot.id} 
                  slot={slot} 
                  pageNumber={pageNumber} 
                  slotIndex={idx + 4}
                  globalNumber={previousActiveSlotsCount + idx + 1} 
                />
              ))}
            </div>
          </div>
        ) : pageNumber === 6 ? (
          <div className="flex flex-col h-full" style={{ gap: `${gridGap}mm` }}>
            {/* Pizza Alanı (Numarasız) */}
            <div className="w-full border-[3px] border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center shrink-0"
              style={{ height: `calc((${singleRowHeight} * 2) + ${gridGap}mm)` }}>
              <div className="text-slate-400 font-bold text-sm uppercase tracking-widest text-center">PİZZA KARTONLARI</div>
            </div>
            {/* Ürünler (Ardışık devam eder) */}
            <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)`, gridAutoRows: "1fr", gap: `${gridGap}mm` }}>
              {currentPage.slots.slice(8).map((slot, idx) => (
                <Slot 
                  key={slot.id} 
                  slot={slot} 
                  pageNumber={pageNumber} 
                  slotIndex={idx + 8}
                  globalNumber={previousActiveSlotsCount + idx + 1} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)`, gridAutoRows: "1fr", gap: `${gridGap}mm` }}>
            {currentPage.slots.map((slot, idx) => (
              <Slot 
                key={slot.id} 
                slot={slot} 
                pageNumber={pageNumber} 
                slotIndex={idx}
                globalNumber={previousActiveSlotsCount + idx + 1} 
              />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER ALANI */}
      <div className="absolute w-full flex items-end gap-5 z-50"
        style={{ bottom: "10mm", left: "0", paddingLeft: "10mm", paddingRight: "10mm", height: "12mm" }}>
        <div onClick={() => footerLogoInputRef.current?.click()} className="w-[35mm] h-full flex items-center justify-center border border-dashed border-slate-300 rounded bg-slate-50 cursor-pointer overflow-hidden shadow-inner">
          {currentPage.footerLogo ? <img src={currentPage.footerLogo} className="max-h-full max-w-full object-contain" /> : <span className="text-[7px] text-slate-400 font-bold uppercase text-center">LOGO</span>}
          <input type="file" ref={footerLogoInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) updatePageFooter(pageNumber, { footerLogo: URL.createObjectURL(file) });
          }} />
        </div>
        <div contentEditable suppressContentEditableWarning onBlur={(e) => updatePageFooter(pageNumber, { footerText: e.currentTarget.textContent || "" })} className="flex-1 text-[11px] font-semibold text-slate-700 outline-none border-b border-transparent hover:border-slate-200 pb-1">
          {currentPage.footerText}
        </div>
        <div className="text-[10px] font-black text-slate-300 uppercase pb-1 tracking-tighter">P.{pageNumber}</div>
      </div>
    </div>
  );
}