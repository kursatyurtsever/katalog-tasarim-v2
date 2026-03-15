"use client";

import { useCatalogStore, Slot as SlotType } from "@/store/useCatalogStore";
import { useState } from "react";

interface SlotProps {
  slot: SlotType;
  pageNumber: number;
  slotIndex: number;
  globalNumber: number;
  onContextMenu: (e: React.MouseEvent, slot: SlotType) => void;
  gridPosition?: { colStart: number; rowStart: number };
}

const splitPrice = (price: any) => {
  if (!price) return { main: "0", decimal: "00" };
  const str = String(price).replace(".", ",");
  const parts = str.split(",");
  return { main: parts[0] || "0", decimal: parts[1] ? (parts[1].padEnd(2, "0").slice(0, 2)) : "00" };
};

export function Slot({ slot, pageNumber, slotIndex, globalNumber, onContextMenu, gridPosition }: SlotProps) {
  const swapSlotContents = useCatalogStore((state) => state.swapSlotContents);
  const selectedSlotIds = useCatalogStore((state) => state.selectedSlotIds);
  const toggleSlotSelection = useCatalogStore((state) => state.toggleSlotSelection);
  const [isOver, setIsOver] = useState(false);

  const isSelected = selectedSlotIds.includes(slot.id);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("sourcePage", String(pageNumber));
    e.dataTransfer.setData("sourceIndex", String(slotIndex));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsOver(true); };
  const handleDragLeave = () => setIsOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsOver(false);
    const sPage = parseInt(e.dataTransfer.getData("sourcePage"));
    const sIndex = parseInt(e.dataTransfer.getData("sourceIndex"));
    if (sPage !== pageNumber || sIndex !== slotIndex) swapSlotContents(sPage, sIndex, pageNumber, slotIndex);
  };

  return (
    <div
      onClick={(e) => toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey)}
      onContextMenu={(e) => onContextMenu(e, slot)}
      draggable={!!slot.product && !isSelected}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`product-slot relative border transition-all overflow-hidden h-full min-w-0 min-h-0 cursor-pointer ${
        isSelected ? "ring-4 ring-blue-500 z-30 bg-blue-50/20" : isOver ? "border-blue-500 bg-blue-50/30 scale-[0.98] z-20" : "border-slate-200 bg-white hover:border-blue-300"
      }`}
      style={{
        // Hücreyi mutlak koordinatlara çiviler, taşmayı ve kaymayı imkansız kılar
        gridColumn: gridPosition ? `${gridPosition.colStart} / span ${slot.colSpan}` : `span ${slot.colSpan}`,
        gridRow: gridPosition ? `${gridPosition.rowStart} / span ${slot.rowSpan}` : `span ${slot.rowSpan}`
      }}
    >
      <div className="absolute top-0 left-0 z-20 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none">
        {globalNumber}
      </div>

      {slot.product ? (
        <div className={`w-full h-full flex flex-col p-2 relative pointer-events-none min-w-0 min-h-0 ${isSelected ? "opacity-75" : "opacity-100"}`}>
          <div className="absolute top-0 right-0 z-10 flex items-center justify-center bg-[#e60000] text-white shadow-sm"
            style={{ width: "50%", height: "10mm", borderBottomLeftRadius: "4px" }}>
            <div className="flex items-start font-black">
              <span className="text-[20px] leading-[0.8] tracking-tighter">{splitPrice(slot.product.price).main}<span className="scale-110">,</span></span>
              <span className="text-[11px] leading-[0.8] ml-0.5">{splitPrice(slot.product.price).decimal}</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6">
            {slot.product.image ? <img src={slot.product.image} className="max-h-full max-w-full object-contain" /> : <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>}
          </div>
          <div className="text-[10px] font-bold text-slate-800 leading-tight line-clamp-2 text-center shrink-0">
            {slot.product.name}
          </div>
        </div>
      ) : null}
    </div>
  );
}