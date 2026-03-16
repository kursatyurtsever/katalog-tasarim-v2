"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { Slot } from "./Slot";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Slot as SlotType, CatalogPage } from "@/store/useCatalogStore";

export function Page({ pageNumber }: { pageNumber: number }) {
  const pages = useCatalogStore((state) => state.pages);
  const template = useCatalogStore((state) => state.activeTemplate);
  const gridGap = useCatalogStore((state) => state.globalSettings?.gridGap ?? 0);
  const updatePageFooter = useCatalogStore((state) => state.updatePageFooter);
  
  const mergeSelected = useCatalogStore((state) => state.mergeSelected);
  const unmergeSlot = useCatalogStore((state) => state.unmergeSlot);

  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slot: SlotType; canMerge: boolean; canUnmerge: boolean } | null>(null);

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

    if (canMerge || canUnmerge) {
      setContextMenu({ x: e.clientX, y: e.clientY, slot, canMerge, canUnmerge });
    }
  };

  const currentPage = pages.find((p) => p.pageNumber === pageNumber);
  const pageConfig = template.pages.find((p) => p.pageNumber === pageNumber);

  if (!currentPage || !pageConfig) return null;

  const [mt, mr, mb, ml] = pageConfig.safeZone;
  
  const totalColumns = 4;
  const totalSlots = currentPage.slots.length; 
  const totalRows = Math.ceil(totalSlots / totalColumns);

  const getVisibleSlotsInPage = (p: CatalogPage) => {
    return p.slots.filter((s, idx) => {
      if (p.pageNumber === 1 && idx < 4) return false;
      if (p.pageNumber === 6 && idx < 8) return false;
      if (s.hidden) return false;
      return true;
    }).length;
  };

  const previousVisibleSlotsCount = pages
    .filter(p => p.pageNumber < pageNumber)
    .reduce((sum, p) => sum + getVisibleSlotsInPage(p), 0);

  let visibleCounter = 0;
  
  const renderSlots = (startIndex: number) => {
    const grid: boolean[][] = [];
    let r = Math.floor(startIndex / totalColumns);
    let c = startIndex % totalColumns;

    return currentPage.slots.map((slot, idx) => {
      if (idx < startIndex) return null;
      if (slot.hidden) return null;

      let placed = false;
      let startR = r, startC = c;

      while (!placed) {
        if (!grid[r]) grid[r] = [];
        if (!grid[r][c]) {
          let canFit = true;
          if (c + slot.colSpan > totalColumns) canFit = false;
          else {
            for (let ir = 0; ir < slot.rowSpan; ir++) {
              if (!grid[r + ir]) grid[r + ir] = [];
              for (let ic = 0; ic < slot.colSpan; ic++) {
                if (grid[r + ir][c + ic]) { canFit = false; break; }
              }
              if (!canFit) break;
            }
          }

          if (canFit) {
            for (let ir = 0; ir < slot.rowSpan; ir++) {
              for (let ic = 0; ic < slot.colSpan; ic++) {
                grid[r + ir][c + ic] = true;
              }
            }
            startR = r;
            startC = c;
            placed = true;
          }
        }

        if (!placed) {
          c++;
          if (c >= totalColumns) { c = 0; r++; }
        }
      }

      visibleCounter++;
      const globalNumber = previousVisibleSlotsCount + visibleCounter;
      
      return (
        <Slot 
          key={slot.id} 
          slot={slot} 
          pageNumber={pageNumber} 
          slotIndex={idx} 
          globalNumber={globalNumber} 
          onContextMenu={handleContextMenu} 
          gridPosition={{ colStart: startC + 1, rowStart: startR + 1 }}
        />
      );
    });
  };

  return (
    <>
      {contextMenu && createPortal(
        <div className="fixed z-[9999] bg-white border border-slate-300 shadow-2xl rounded-md py-1 min-w-[150px]" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
          {contextMenu.canMerge && (
            <button className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50" onClick={() => { const res = mergeSelected(pageNumber); if (!res.success) alert(res.error); setContextMenu(null); }}>
              Hücreleri Birleştir
            </button>
          )}
          {contextMenu.canUnmerge && (
            <button className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-red-50" onClick={() => { unmergeSlot(pageNumber, contextMenu.slot.id); setContextMenu(null); }}>
              Hücreyi Dağıt
            </button>
          )}
        </div>,
        document.body
      )}

      <div className="physical-page relative bg-white shadow-lg shrink-0 overflow-hidden"
        style={{ width: `${pageConfig.widthMm}mm`, height: "297mm", boxSizing: "border-box" }}>
        
        <div className="safe-zone absolute flex flex-col"
          style={{ top: `${mt}mm`, right: `${mr}mm`, bottom: "30mm", left: `${ml}mm` }}>
          
          {/* 1. SAYFA BANNER - STATİK BOYUT (ASLA UZAMAZ) */}
          {pageNumber === 1 && (
            <div className="absolute top-0 left-0 w-full border-[3px] border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center z-10"
                 style={{ height: `calc((100% / ${totalRows}) - 5mm)` }}>
               <div className="text-slate-400 font-bold text-sm uppercase tracking-widest text-center">1. SAYFA BANNER</div>
            </div>
          )}

          {/* 6. SAYFA PIZZA - STATİK BOYUT (ASLA UZAMAZ) */}
          {pageNumber === 6 && (
            <div className="absolute top-0 left-0 w-full border-[3px] border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center z-10"
                 style={{ height: `calc(((100% / ${totalRows}) * 2) - 5mm)` }}>
               <div className="text-slate-400 font-bold text-sm uppercase tracking-widest text-center">PİZZA KARTONLARI</div>
            </div>
          )}

          {/* TÜM SAYFALAR İÇİN ORTAK SABİT GRID */}
          <div className="grid flex-1 min-h-0 min-w-0 w-full h-full relative z-0" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`, gap: `${gridGap}mm` }}>
            {renderSlots(pageNumber === 1 ? 4 : pageNumber === 6 ? 8 : 0)}
          </div>

        </div>

        {/* Footer */}
        <div className="absolute w-full flex items-end gap-5 z-50" style={{ bottom: "10mm", left: "0", paddingLeft: "10mm", paddingRight: "10mm", height: "12mm" }}>
          <div onClick={() => footerLogoInputRef.current?.click()} className="w-[35mm] h-full flex items-center justify-center border border-dashed border-slate-300 rounded bg-slate-50 cursor-pointer overflow-hidden shadow-inner">
            {currentPage.footerLogo ? <img src={currentPage.footerLogo} className="max-h-full max-w-full object-contain" /> : <span className="text-[7px] text-slate-400 font-bold uppercase text-center">LOGO</span>}
            <input type="file" ref={footerLogoInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) updatePageFooter(pageNumber, { footerLogo: URL.createObjectURL(file) }); }} />
          </div>
          <div contentEditable suppressContentEditableWarning onBlur={(e) => updatePageFooter(pageNumber, { footerText: e.currentTarget.textContent || "" })} className="flex-1 text-[11px] font-semibold text-slate-700 outline-none border-b border-transparent hover:border-slate-200 pb-1">
            {currentPage.footerText}
          </div>
          <div className="text-[10px] font-black text-slate-300 uppercase pb-1 tracking-tighter">P.{pageNumber}</div>
        </div>
      </div>
    </>
  );
}