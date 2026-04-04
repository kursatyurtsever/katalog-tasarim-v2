"use client";

import { useBannerStore } from "@/store/useBannerStore";
import { useUIStore } from "@/store/useUIStore";
import { usePizzaStore } from "@/store/usePizzaStore";
import { useEffect, useState } from "react";

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

export function BannerSection() {
  const { 
    bannerSettings, undo, 
    selectedBannerCellIds, toggleBannerCellSelection, updateBannerCell 
  } = useBannerStore();

  const clearCatalogSelection = useUIStore((state) => state.clearSelection);
  const clearPizzaSelection = usePizzaStore((state) => state.clearSelection);
  
  const { cells } = bannerSettings;

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

  const visibleCells = cells.filter(c => !c.hidden);

  return (
    <div 
      className="w-full h-full grid relative overflow-hidden box-border bg-white"
      style={{
        gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
        gridTemplateRows: "repeat(4, minmax(0, 1fr))",
      }}
    >
      {visibleCells.map(cell => {
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
                clearCatalogSelection();
                clearPizzaSelection();
                toggleBannerCellSelection(cell.id, e.ctrlKey || e.shiftKey);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              clearCatalogSelection();
              setEditingCellId(cell.id);
              if (!isSelected) {
                toggleBannerCellSelection(cell.id, false); // Çift tıklanınca otomatik seçili hale de gelsin
              }
            }}
            className={`flex box-border relative overflow-hidden cursor-pointer transition-all ${isSelected && !isEditing ? 'ring-2 ring-inset ring-blue-500 z-10' : 'z-0'}`}
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
            ) : isEditing ? (
              <textarea
                autoFocus
                value={cell.text}
                onChange={(e) => updateBannerCell(cell.id, { text: e.target.value })}
                onBlur={() => setEditingCellId(null)}
                onKeyDown={(e) => { if (e.key === "Escape") setEditingCellId(null); }}
                className="w-full h-full bg-transparent outline-none resize-none m-0 p-0 border-none"
                style={{
                  fontFamily: font.fontFamily, fontSize: `${font.fontSize}px`, fontWeight: font.fontWeight, lineHeight: font.lineHeight, letterSpacing: `${font.letterSpacing}px`, textTransform: font.textTransform as any, textDecoration: font.textDecoration,
                  color: font.opacity < 100 ? hexToRgba(font.color, font.opacity) : font.color,
                  textAlign: font.textAlign as any,
                }}
              />
            ) : (
              <span
                className="pointer-events-none"
                style={{
                  fontFamily: font.fontFamily, fontSize: `${font.fontSize}px`, fontWeight: font.fontWeight, lineHeight: font.lineHeight, letterSpacing: `${font.letterSpacing}px`, textTransform: font.textTransform as any, textDecoration: font.textDecoration,
                  color: font.opacity < 100 ? hexToRgba(font.color, font.opacity) : font.color,
                  whiteSpace: "pre-wrap", textAlign: font.textAlign as any, width: "100%"
                }}
              >
                {cell.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}