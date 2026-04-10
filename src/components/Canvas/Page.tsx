"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { useLayerStore } from "@/store/useLayerStore";
import { Slot } from "../Slot";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Slot as SlotType } from "@/store/useCatalogStore";

export function Page({ pageNumber }: { pageNumber: number }) {
  const formas = useCatalogStore((state) => state.formas);
  const activeFormaId = useCatalogStore((state) => state.activeFormaId);
  const template = useCatalogStore((state) => state.activeTemplate);
  const gridGap = useCatalogStore((state) => state.globalSettings?.gridGap ?? 0);
  const defaultGrid = useCatalogStore((state) => state.globalSettings?.defaultGrid);
  const updatePageFooter = useCatalogStore((state) => state.updatePageFooter);
  const mergeSelected = useCatalogStore((state) => state.mergeSelected);
  const unmergeSlot = useCatalogStore((state) => state.unmergeSlot);
  const clearSlot = useCatalogStore((state) => state.clearSlot);
  const selectPages = useLayerStore((state) => state.selectPages);
  const selectedPageIds = useLayerStore((state) => state.selectedPageIds);
  const setEditingContent = useUIStore((state) => state.setEditingContent);


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
    const selected = useUIStore.getState().selectedSlotIds;
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

  const pageStyle = {
    width: `${pageConfig.widthMm}mm`,
    height: `${template.openHeightMm}mm`,
    boxSizing: "border-box" as const,
    backgroundColor: "transparent", // Sayfalar artık şeffaf
  };

  const isSelected = selectedPageIds.includes(currentPage.id);



const [mt, mr, mb, ml] = pageConfig.safeZone;
  
  const totalColumns = currentPage.gridSettings?.cols || defaultGrid?.cols || 4;
  const configuredRows = currentPage.gridSettings?.rows || defaultGrid?.rows || 4;
  
  const totalRows = Math.max(configuredRows, Math.ceil(currentPage.slots.length / totalColumns));

  const renderSlots = () => {
    return currentPage.slots.map((slot, idx) => {
      if (slot.hidden) return null;
      
      const gridPosition = slot.gridPosition || { colStart: 1, rowStart: 1 };
      const globalNumber = slot.globalNumber || 0;
      
      return (
        <Slot 
          key={slot.id} 
          slot={slot} 
          pageNumber={pageNumber} 
          slotIndex={idx} 
          globalNumber={globalNumber} 
          onContextMenu={handleContextMenu} 
          gridPosition={gridPosition} 
          totalRows={totalRows} 
          totalColumns={totalColumns} 
        />
      );
    });
  };

  return (
    <>
{contextMenu && createPortal(
        <div className="fixed z-9999 bg-white border border-slate-300 shadow-2xl rounded-md py-1 min-w-37.5" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
          {contextMenu.canMerge && <button className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50" onClick={() => { mergeSelected(pageNumber, contextMenu.slot.id); setContextMenu(null); }}>Hücreleri Birleştir</button>}
          {contextMenu.canUnmerge && <button className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-red-50" onClick={() => { unmergeSlot(pageNumber, contextMenu.slot.id); setContextMenu(null); }}>Hücreyi Dağıt</button>}
          {contextMenu.hasProduct && <button className="w-full text-left px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50" onClick={() => { clearSlot(pageNumber, contextMenu.slot.id); setContextMenu(null); }}>Temizle</button>}
        </div>, document.body
      )}
      <div
        id={`page-${currentPage.id}`}
        className={`physical-page relative shrink-0 overflow-hidden shadow-lg ${isSelected ? "ring-2 ring-blue-500" : ""}`}
        style={pageStyle}
        onClick={(e) => {
          setEditingContent(null);
          if (e.target === e.currentTarget) {
            if (e.ctrlKey || e.metaKey) {
              // CTRL Basılı: Toggle (Çoklu Seçim)
              if (selectedPageIds.includes(currentPage.id)) {
                selectPages(selectedPageIds.filter((id) => id !== currentPage.id));
              } else {
                selectPages([...selectedPageIds, currentPage.id]);
              }
            } else {
              // CTRL Basılı Değil: Tekli Seçim
              selectPages([currentPage.id]);
            }
          }
        }}
      >
        <div className="safe-zone absolute z-10 flex flex-col pointer-events-none" style={{ top: `${mt}mm`, right: `${mr}mm`, bottom: "30mm", left: `${ml}mm` }}>
            <div className="grid flex-1 min-h-0 min-w-0 w-full h-full relative z-0" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`, gap: `${gridGap}mm` }}>{renderSlots()}</div>
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
        {/* INDESIGN GÜVENLİ ALAN (SAFE ZONE / MARGIN) ÇİZGİSİ */}
        <div
          data-hide-on-export="true"
          className="pointer-events-none absolute print:hidden z-50"
          style={{
            top: `${mt}mm`,
            bottom: `${mb}mm`,
            left: `${ml}mm`,
            right: `${mr}mm`,
            border: "1px solid magenta",
            boxSizing: "border-box",
          }}
        />
      </div>
    </>
  );
}
