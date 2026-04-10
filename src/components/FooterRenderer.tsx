"use client";

import React, { useState, useEffect } from "react";
import { useCatalogStore, FooterCell, FooterSettings } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

export function FooterRenderer({ pageNumber, safeZone }: { pageNumber: number, safeZone: [number, number, number, number] }) {
  const { getActivePages, globalSettings, updatePageFooterCells } = useCatalogStore();
  const { selection, toggleElementSelection } = useUIStore();

  const [editingCellId, setEditingCellId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!editingCellId) return;
      const target = e.target as HTMLElement;
      // Hücrenin kendisine veya araç çubuğuna tıklandıysa çıkma
      if (target.closest(`#footer-${editingCellId}`)) return;
      if (target.closest('#contextual-bar')) return;
      setEditingCellId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingCellId]);

  const [mt, mr, mb, ml] = safeZone;

  const page = getActivePages().find((p) => p.pageNumber === pageNumber);
  if (!page || page.footerMode === 'hidden') return null;

  const isCustom = page.footerMode === 'custom';
  const activeFooter = isCustom ? page.customFooter : globalSettings.footer;

  if (!activeFooter || !activeFooter.cells) return null;

  const cells = activeFooter.cells;
  const visibleCells = cells.filter((c) => !c.hidden);
  const selectedFooterCellIds = selection.type === 'footerCell' && selection.parentId === `page-${pageNumber}` ? selection.ids : [];

  const handleTextChange = (cellId: string, newText: string) => {
    updatePageFooterCells(pageNumber, cellId, { text: newText });
  };

  return (
    <div
      className="absolute flex"
      style={{
        bottom: `5mm`,           // ZORUNLU: Tam mavi çizgiye otursun diye sabitlendi
        left: `${ml}mm`,         // Sol kenarı güvenli alana (mavi) yaslı
        right: `${mr}mm`,        // Sağ kenarı güvenli alana (mavi) yaslı
        height: `${activeFooter.heightMm}mm`,
        boxSizing: "border-box",
        zIndex: 40,
      }}
    >
      <div 
        className="w-full h-full grid relative overflow-hidden box-border bg-white"
        style={{
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gridTemplateRows: "1fr",
        }}
      >
        {visibleCells.map((cell) => {
          const font = cell.font;
          const pad = cell.padding;
          const b = cell.border;
          
          const justify = font.textAlign === "center" ? "center" : font.textAlign === "right" ? "flex-end" : "flex-start";
          const align = font.verticalAlign === "top" ? "flex-start" : font.verticalAlign === "bottom" ? "flex-end" : "center";
          
          const borderColorRgba = b.color.o < 100 ? hexToRgba(b.color.c, b.color.o) : b.color.c;
          
          const isSelected = selectedFooterCellIds.includes(cell.id);
          const isEditing = editingCellId === cell.id;

          return (
            <div
              key={cell.id}
              id={`footer-${cell.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditing) {
                  toggleElementSelection('footerCell', cell.id, e.ctrlKey || e.shiftKey, `page-${pageNumber}`);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingCellId(cell.id);
                if (!isSelected) {
                  toggleElementSelection('footerCell', cell.id, false, `page-${pageNumber}`);
                }
              }}
              className={`flex box-border relative overflow-hidden transition-all ${isSelected && !isEditing ? 'ring-2 ring-inset ring-blue-500 z-10 cursor-pointer' : isEditing ? 'cursor-text z-20' : 'cursor-pointer z-0'}`}
              style={{
                gridColumn: `span ${cell.colSpan}`,
                gridRow: "1",
                backgroundColor: cell.bgColor.o < 100 ? hexToRgba(cell.bgColor.c, cell.bgColor.o) : cell.bgColor.c,
                paddingTop: `${pad.t}px`, paddingRight: `${pad.r}px`, paddingBottom: `${pad.b}px`, paddingLeft: `${pad.l}px`,
                
                borderTop: `${b.t}px ${b.style} ${borderColorRgba}`,
                borderRight: `${b.r}px ${b.style} ${borderColorRgba}`,
                borderBottom: `${b.b}px ${b.style} ${borderColorRgba}`,
                borderLeft: `${b.l}px ${b.style} ${borderColorRgba}`,

                justifyContent: justify,
                alignItems: align,
              }}
            >
              {cell.image ? (
                <img src={cell.image} alt="Footer Logo" className="max-w-full max-h-full object-contain pointer-events-none" />
              ) : (
              <div
                contentEditable={isEditing}
                suppressContentEditableWarning
                ref={(el) => {
                  // Düzenleme moduna girildiğinde otomatik odaklan ve imleci sona al
                  if (isEditing && el && document.activeElement !== el) {
                    el.focus();
                    if (typeof window !== 'undefined' && window.getSelection) {
                      const selection = window.getSelection();
                      const range = document.createRange();
                      range.selectNodeContents(el);
                      range.collapse(false);
                      selection?.removeAllRanges();
                      selection?.addRange(range);
                    }
                  }
                }}
                onBlur={(e) => {
                  if (e.currentTarget.innerHTML !== cell.text) {
                    handleTextChange(cell.id, e.currentTarget.innerHTML);
                  }
                }}
                onKeyDown={(e) => {
                   if (e.key === "Escape") setEditingCellId(null); 
                }}
                className={`w-full outline-none border-none m-0 p-0 ${isEditing ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  style={{
                    fontFamily: font.fontFamily, 
                    fontSize: `${font.fontSize}px`, 
                    fontWeight: font.fontWeight, 
                    lineHeight: font.lineHeight, 
                    letterSpacing: `${font.letterSpacing}px`, 
                    textTransform: font.textTransform as any, 
                    textDecoration: font.textDecoration,
                    color: font.opacity < 100 ? hexToRgba(font.color, font.opacity) : font.color,
                    textAlign: font.textAlign as any,
                    whiteSpace: "pre-wrap", // Satır sonlarını (enter) düzgün göstermek için
                  }}
                  dangerouslySetInnerHTML={{ __html: cell.text || '' }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Sayfa Numarası */}
      <div 
        data-hide-on-export="true" 
        className="absolute text-[10px] font-black text-slate-400 uppercase tracking-tighter pointer-events-none"
        style={{ 
          right: `0mm`,         
          bottom: `-5mm`,     
          height: `5mm`,       
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}
      >
        P.{pageNumber}
      </div>
    </div>
  );
}