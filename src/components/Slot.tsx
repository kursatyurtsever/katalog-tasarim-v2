"use client";

import { useCatalogStore, Slot as SlotType } from "@/store/useCatalogStore";
import { useState } from "react";

interface SlotProps { slot: SlotType; pageNumber: number; slotIndex: number; globalNumber: number; onContextMenu: (e: React.MouseEvent, slot: SlotType) => void; gridPosition?: { colStart: number; rowStart: number }; }

const splitPrice = (price: any) => {
  if (!price) return { main: "0", decimal: "00" };
  const str = String(price).replace(".", ",");
  const parts = str.split(",");
  return { main: parts[0] || "0", decimal: parts[1] ? (parts[1].padEnd(2, "0").slice(0, 2)) : "00" };
};

const parsePrice = (price: any) => { if (!price) return 0; return parseFloat(String(price).replace(",", ".")); };

const hexToRgba = (hex: string, opacity: number) => {
  if (!hex || hex.length < 7) return "rgba(255,255,255,1)";
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

export function Slot({ slot, pageNumber, slotIndex, globalNumber, onContextMenu, gridPosition }: SlotProps) {
  const { globalSettings, swapSlotContents, toggleSlotSelection, setSlotProduct, updateSlotProduct, selectedSlotIds } = useCatalogStore();
  const [isOver, setIsOver] = useState(false);

  const isSelected = selectedSlotIds.includes(slot.id);
  const activeSettings = slot.isCustom && slot.customSettings ? slot.customSettings : globalSettings;

  let profit = 0, isLoss = false, hasCost = false;
  if (slot.product) {
    const sale = parsePrice(slot.product.price), cost = parsePrice(slot.product.raw?.EK);
    if (cost > 0) { hasCost = true; profit = ((sale - cost) / cost) * 100; isLoss = profit < 0; }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsOver(false);
    const newProductData = e.dataTransfer.getData("newProductFromSidebar");
    if (newProductData) { setSlotProduct(pageNumber, slot.id, JSON.parse(newProductData)); return; }
    const sPage = parseInt(e.dataTransfer.getData("sourcePage")), sIndex = parseInt(e.dataTransfer.getData("sourceIndex"));
    if (!isNaN(sPage) && (sPage !== pageNumber || sIndex !== slotIndex)) swapSlotContents(sPage, sIndex, pageNumber, slotIndex);
  };

  return (
    <div onClick={(e) => toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey)} onContextMenu={(e) => onContextMenu(e, slot)} draggable={!!slot.product && !isSelected} onDragStart={(e) => { e.dataTransfer.setData("sourcePage", String(pageNumber)); e.dataTransfer.setData("sourceIndex", String(slotIndex)); }} onDragOver={(e) => { e.preventDefault(); setIsOver(true); }} onDragLeave={() => setIsOver(false)} onDrop={handleDrop} className={`product-slot relative border transition-all h-full min-w-0 min-h-0 cursor-pointer ${isSelected ? "ring-4 ring-blue-500 z-30 shadow-lg" : isOver ? "border-blue-500 scale-[0.98] z-20" : "hover:border-blue-300"}`} style={{ gridColumn: gridPosition ? `${gridPosition.colStart} / span ${slot.colSpan}` : `span ${slot.colSpan}`, gridRow: gridPosition ? `${gridPosition.rowStart} / span ${slot.rowSpan}` : `span ${slot.rowSpan}`, borderRadius: `${activeSettings?.radiusTL}px ${activeSettings?.radiusTR}px ${activeSettings?.radiusBR}px ${activeSettings?.radiusBL}px`, backgroundColor: hexToRgba(activeSettings?.bgColor, activeSettings?.bgOpacity), borderColor: hexToRgba(activeSettings?.borderColor, activeSettings?.borderOpacity), borderWidth: `${activeSettings?.borderWidth}px` }}>
      <div className="absolute top-0 left-0 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none">{globalNumber}</div>
      {slot.product && (
        <div className={`w-full h-full flex flex-col p-2 relative min-w-0 min-h-0 ${isSelected ? "opacity-75" : ""}`}>
          <div className="absolute top-0 right-0 z-10 flex shadow-sm transition-all px-1.5 py-1 cursor-text pointer-events-auto" style={{ width: "50%", height: "10mm", backgroundColor: activeSettings?.priceBgColor, color: activeSettings?.priceFontColor, borderRadius: `${activeSettings?.priceRadiusTL}px ${activeSettings?.priceRadiusTR}px ${activeSettings?.priceRadiusBR}px ${activeSettings?.priceRadiusBL}px`, alignItems: activeSettings?.priceTextVerticalAlign === "top" ? "flex-start" : "center", justifyContent: activeSettings?.priceTextAlign === "left" ? "flex-start" : "center" }} onClick={(e) => e.stopPropagation()} contentEditable suppressContentEditableWarning onBlur={(e) => updateSlotProduct(pageNumber, slot.id, { price: e.currentTarget.textContent || "0" })}>
            <div className="flex items-start pointer-events-none" style={{ fontFamily: activeSettings?.priceFontFamily, fontWeight: activeSettings?.priceFontWeight }}>
              <span style={{ fontSize: `${activeSettings?.priceFontSize}px`, lineHeight: "0.8" }}>{splitPrice(slot.product.price).main},</span>
              <span style={{ fontSize: `${activeSettings?.priceDecimalSize}px`, lineHeight: "0.8", marginLeft: "2px" }}>{splitPrice(slot.product.price).decimal}</span>
            </div>
          </div>
          {hasCost && <div className={`absolute right-1 text-[10px] font-black pointer-events-none z-20 ${isLoss ? "text-red-600" : "text-green-600"}`} style={{ top: "10.5mm" }}>%{profit.toFixed(1)}</div>}
          <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6 pointer-events-auto" title={slot.product.sku || "SKU Yok"}>{slot.product.image ? <img src={slot.product.image} className="w-full h-full object-contain" /> : <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>}</div>
          <div className="shrink-0 w-full flex flex-col cursor-text pointer-events-auto" style={{ height: "3em", justifyContent: activeSettings?.textVerticalAlign === "top" ? "flex-start" : "center" }} onClick={(e) => e.stopPropagation()}><div className="line-clamp-2 w-full outline-none focus:bg-white/50 rounded" style={{ fontFamily: activeSettings?.fontFamily, fontWeight: activeSettings?.fontWeight, fontSize: `${activeSettings?.fontSize}px`, color: activeSettings?.fontColor, textAlign: (activeSettings?.textAlign as any) }} contentEditable suppressContentEditableWarning onBlur={(e) => updateSlotProduct(pageNumber, slot.id, { name: e.currentTarget.textContent || "" })}>{slot.product.name}</div></div>
        </div>
      )}
    </div>
  );
}