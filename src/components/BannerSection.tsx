"use client";

import { useUIStore } from "@/store/useUIStore";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useEffect, useState } from "react";

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

export function BannerSection({ instanceData, slotId, pageNumber }: { instanceData?: any, slotId?: string, pageNumber?: number }) {
  

  const clearCatalogSelection = useUIStore((state) => state.clearSelection);
  const toggleElementSelection = useUIStore((state) => state.toggleElementSelection);
  const selection = useUIStore((state) => state.selection);
  
  const selectedBannerCellIds = selection.type === 'bannerCell' && selection.parentId === slotId ? selection.ids : [];

  const updateSlotModuleData = useCatalogStore((state) => state.updateSlotModuleData);
  const undo = useCatalogStore((state) => state.undo);

  const { cells } = instanceData || { cells: [] };

  const updateBannerCell = (cellId: string, updates: any) => {
    if (!slotId || pageNumber === undefined) return;
    const newCells = cells.map((c: any) => c.id === cellId ? { ...c, ...updates } : c);
    updateSlotModuleData(pageNumber, slotId, { cells: newCells });
  };

  // Çift tıklandığında hangi hücrenin düzenlendiğini tutacağımız yerel state
  const [editingCellId, setEditingCellId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Sadece input veya textarea'da değilken Ctrl+Z çalışsın
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !editingCellId) {
        undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, editingCellId]);

  if (!cells || cells.length === 0) return null;

  const visibleCells = cells.filter((c: any) => !c.hidden);

  return (
    <div 
      className="w-full h-full grid relative overflow-hidden box-border bg-white"
      style={{
        gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
        gridTemplateRows: "repeat(4, minmax(0, 1fr))",
      }}
    >
      {visibleCells.map((cell: any) => {
        const font = cell.font;
        const pad = cell.padding;
        const b = cell.border;
        
        const justify = font.textAlign === "center" ? "center" : font.textAlign === "right" ? "flex-end" : "flex-start";
        const align = font.verticalAlign === "top" ? "flex-start" : font.verticalAlign === "bottom" ? "flex-end" : "center";
        
        const borderColorRgba = b.color.o < 100 ? hexToRgba(b.color.c, b.color.o) : b.color.c;
        
        const isSelected = selectedBannerCellIds.includes(cell.id);
        const isEditing = editingCellId === cell.id;

        return (
          <div
            key={cell.id}
            id={`banner-${cell.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEditing) {
                toggleElementSelection('bannerCell', cell.id, e.ctrlKey || e.shiftKey, slotId);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingCellId(cell.id);
              if (!isSelected) {
                toggleElementSelection('bannerCell', cell.id, false, slotId);
              }
            }}
            className={`flex box-border relative overflow-hidden transition-all ${isSelected && !isEditing ? 'ring-2 ring-inset ring-blue-500 z-10 cursor-pointer' : isEditing ? 'cursor-text z-20' : 'cursor-pointer z-0'}`}
            style={{
              gridColumn: `span ${cell.colSpan}`,
              gridRow: `span ${cell.rowSpan}`,
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
              <img src={cell.image} alt="Banner" className="max-w-full max-h-full object-contain pointer-events-none" />
            ) : (
              <div
                contentEditable={isEditing}
                suppressContentEditableWarning
                ref={(el) => {
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
                  setEditingCellId(null);
                  if (e.currentTarget.innerHTML !== cell.text) {
                    updateBannerCell(cell.id, { text: e.currentTarget.innerHTML });
                  }
                }}
                onKeyDown={(e) => { if (e.key === "Escape") setEditingCellId(null); }}
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
                  whiteSpace: "pre-wrap"
                }}
                dangerouslySetInnerHTML={{ __html: cell.text || '' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}