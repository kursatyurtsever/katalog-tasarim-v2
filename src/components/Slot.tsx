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

const hexToRgba = (hex: string, opacity: number) => {
  if (!hex) return "rgba(0,0,0,0)";
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) { r = parseInt(hex[1]+hex[1], 16); g = parseInt(hex[2]+hex[2], 16); b = parseInt(hex[3]+hex[3], 16); }
  else if (hex.length === 7) { r = parseInt(hex.slice(1, 3), 16); g = parseInt(hex.slice(3, 5), 16); b = parseInt(hex.slice(5, 7), 16); }
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

export function Slot({ slot, pageNumber, slotIndex, globalNumber, onContextMenu, gridPosition }: SlotProps) {
  const globalSettings = useCatalogStore((state) => state.globalSettings);
  const swapSlotContents = useCatalogStore((state) => state.swapSlotContents);
  const selectedSlotIds = useCatalogStore((state) => state.selectedSlotIds);
  const toggleSlotSelection = useCatalogStore((state) => state.toggleSlotSelection);
  
  // Sürüklenen ürünü hücreye eklemek için
  const setSlotProduct = useCatalogStore((state) => state.setSlotProduct);
  
  const [isOver, setIsOver] = useState(false);

  const isSelected = selectedSlotIds.includes(slot.id);
  const activeSettings = slot.isCustom && slot.customSettings ? slot.customSettings : globalSettings;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("sourcePage", String(pageNumber));
    e.dataTransfer.setData("sourceIndex", String(slotIndex));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsOver(true); };
  const handleDragLeave = () => setIsOver(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    setIsOver(false);

    // 1. Durum: Eğer sürüklenen veri yan paneldeki ürün listesinden (havuzdan) geliyorsa
    const newProductData = e.dataTransfer.getData("newProductFromSidebar");
    if (newProductData) {
      const product = JSON.parse(newProductData);
      setSlotProduct(pageNumber, slot.id, product);
      return;
    }

    // 2. Durum: Eğer sürüklenen veri katalog içindeki başka bir hücreden geliyorsa (yer değiştirme)
    const sPageStr = e.dataTransfer.getData("sourcePage");
    const sIndexStr = e.dataTransfer.getData("sourceIndex");
    
    if (sPageStr && sIndexStr) {
      const sPage = parseInt(sPageStr);
      const sIndex = parseInt(sIndexStr);
      if (sPage !== pageNumber || sIndex !== slotIndex) {
        swapSlotContents(sPage, sIndex, pageNumber, slotIndex);
      }
    }
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
        isSelected ? "ring-4 ring-blue-500 z-30 shadow-lg" : isOver ? "border-blue-500 scale-[0.98] z-20" : "hover:border-blue-300"
      }`}
      style={{
        gridColumn: gridPosition ? `${gridPosition.colStart} / span ${slot.colSpan}` : `span ${slot.colSpan}`,
        gridRow: gridPosition ? `${gridPosition.rowStart} / span ${slot.rowSpan}` : `span ${slot.rowSpan}`,
        borderRadius: `${activeSettings?.radiusTL ?? 0}px ${activeSettings?.radiusTR ?? 0}px ${activeSettings?.radiusBR ?? 0}px ${activeSettings?.radiusBL ?? 0}px`,
        backgroundColor: hexToRgba(activeSettings?.bgColor ?? "#ffffff", activeSettings?.bgOpacity ?? 100),
        borderColor: hexToRgba(activeSettings?.borderColor ?? "#e2e8f0", activeSettings?.borderOpacity ?? 100),
        borderWidth: `${activeSettings?.borderWidth ?? 1}px`,
      }}
    >
      <div className="absolute top-0 left-0 z-20 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none">
        {globalNumber}
      </div>

      {slot.product ? (
        <div className={`w-full h-full flex flex-col p-2 relative pointer-events-none min-w-0 min-h-0 ${isSelected ? "opacity-75" : "opacity-100"}`}>
          <div className="absolute top-0 right-0 z-10 flex shadow-sm transition-all px-1.5 py-1"
            style={{ 
              width: "50%", height: "10mm", 
              backgroundColor: activeSettings?.priceBgColor ?? "#e60000",
              color: activeSettings?.priceFontColor ?? "#ffffff",
              borderRadius: `${activeSettings?.priceRadiusTL ?? 0}px ${activeSettings?.priceRadiusTR ?? 0}px ${activeSettings?.priceRadiusBR ?? 0}px ${activeSettings?.priceRadiusBL ?? 4}px`,
              alignItems: activeSettings?.priceTextVerticalAlign === "top" ? "flex-start" : activeSettings?.priceTextVerticalAlign === "bottom" ? "flex-end" : "center",
              justifyContent: activeSettings?.priceTextAlign === "left" ? "flex-start" : activeSettings?.priceTextAlign === "right" ? "flex-end" : "center"
            }}>
            <div className="flex items-start" style={{ 
              fontFamily: activeSettings?.priceFontFamily ?? "inherit",
              fontWeight: activeSettings?.priceFontWeight ?? "900" 
            }}>
              <span style={{ fontSize: `${activeSettings?.priceFontSize ?? 20}px`, lineHeight: "0.8", letterSpacing: `${activeSettings?.priceLetterSpacing ?? -1}px` }}>
                {splitPrice(slot.product.price).main}
                <span className="scale-110">,</span>
              </span>
              <span style={{ fontSize: `${activeSettings?.priceDecimalSize ?? 11}px`, lineHeight: "0.8", marginLeft: "2px" }}>
                {splitPrice(slot.product.price).decimal}
              </span>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6">
            {slot.product.image ? <img src={slot.product.image} className="max-h-full max-w-full object-contain" /> : <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>}
          </div>
          
          <div className="shrink-0 w-full flex flex-col" style={{ 
            height: "3em", 
            justifyContent: activeSettings?.textVerticalAlign === "top" ? "flex-start" : activeSettings?.textVerticalAlign === "middle" ? "center" : "flex-end"
          }}>
            <div className="line-clamp-2 w-full" style={{ 
              fontFamily: activeSettings?.fontFamily ?? "inherit",
              fontWeight: activeSettings?.fontWeight ?? "700",
              fontStyle: activeSettings?.fontStyle ?? "normal",
              fontSize: `${activeSettings?.fontSize ?? 10}px`, 
              lineHeight: activeSettings?.lineHeight ?? 1.2,
              letterSpacing: `${activeSettings?.letterSpacing ?? 0}px`,
              color: activeSettings?.fontColor ?? "#1e293b", 
              textAlign: (activeSettings?.textAlign as any) ?? "center" 
            }}>
              {slot.product.name}
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}