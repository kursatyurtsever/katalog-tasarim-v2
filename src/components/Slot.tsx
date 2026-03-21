"use client";

import { useCatalogStore, Slot as SlotType } from "@/store/useCatalogStore";
import { useState } from "react";
import { TypographyData } from "./TypographyPicker";
import { BorderRadiusData } from "./BorderRadiusPicker";
import { SpacingData } from "./SpacingPicker";
import { ShadowData } from "./ShadowPicker";

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

const getRadiusStyle = (r: BorderRadiusData) => `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;
const getPaddingStyle = (s: SpacingData) => `${s.t}px ${s.r}px ${s.b}px ${s.l}px`;
const getShadowStyle = (s: ShadowData) => {
  if (!s.active) return 'none';
  return `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`;
};

const getFontStyle = (font: TypographyData): React.CSSProperties => {
  let justifyContent = "center";
  if (font.textAlign === "left") justifyContent = "flex-start";
  if (font.textAlign === "right") justifyContent = "flex-end";
  let alignItems = "center";
  if (font.verticalAlign === "top") alignItems = "flex-start";
  if (font.verticalAlign === "bottom") alignItems = "flex-end";
  return { fontFamily: font.fontFamily, fontWeight: font.fontWeight, fontSize: `${font.fontSize}px`, lineHeight: font.lineHeight, letterSpacing: `${font.letterSpacing}px`, textAlign: font.textAlign, textTransform: font.textTransform, textDecoration: font.textDecoration, color: hexToRgba(font.color, font.opacity), display: 'flex', justifyContent, alignItems };
};

export function Slot({ slot, pageNumber, slotIndex, globalNumber, onContextMenu, gridPosition }: SlotProps) {
  const { globalSettings, swapSlotContents, toggleSlotSelection, setSlotProduct, updateSlotProduct, updateSlotCustomSettings, selectedSlotIds } = useCatalogStore();
  const [isOver, setIsOver] = useState(false);
  
  // Resim Sürükleme (Pan) Hafızası
  const [imgDrag, setImgDrag] = useState({ isDragging: false, startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, currentX: 0, currentY: 0 });

  const isSelected = selectedSlotIds.includes(slot.id);
  const activeSettings = slot.isCustom && slot.customSettings ? slot.customSettings : globalSettings;
  const finalSettings = { ...globalSettings, ...activeSettings };

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

  // Resim Fare Olayları
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!finalSettings.imageEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setImgDrag({ isDragging: true, startX: e.clientX, startY: e.clientY, initialPosX: finalSettings.imagePosX || 0, initialPosY: finalSettings.imagePosY || 0, currentX: finalSettings.imagePosX || 0, currentY: finalSettings.imagePosY || 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgDrag.isDragging) return;
    e.stopPropagation();
    const dx = e.clientX - imgDrag.startX;
    const dy = e.clientY - imgDrag.startY;
    setImgDrag(prev => ({ ...prev, currentX: prev.initialPosX + dx, currentY: prev.initialPosY + dy }));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!imgDrag.isDragging) return;
    e.stopPropagation();
    updateSlotCustomSettings({ imagePosX: imgDrag.currentX, imagePosY: imgDrag.currentY });
    setImgDrag(prev => ({ ...prev, isDragging: false }));
  };

  const displayX = imgDrag.isDragging ? imgDrag.currentX : (finalSettings.imagePosX || 0);
  const displayY = imgDrag.isDragging ? imgDrag.currentY : (finalSettings.imagePosY || 0);
  const displayScale = (finalSettings.imageScale || 100) / 100;

  // ÇÖZÜM 3: Radius Kaybolma Problemi
  // Alt radius değerlerinden en büyüğünü alıyoruz (tl ve tr değil, bl ve br önemli).
  // Bu değer, ürün ismi alanını dikeyde yukarıya ötelemek için (lift) kullanılacak.
  const bl = finalSettings.radiuses.cell.bl || 0;
  const br = finalSettings.radiuses.cell.br || 0;
  const maxRadiusBottom = Math.max(bl, br) / 5;

  return (
    <div 
      onClick={(e) => {
        if (isSelected && finalSettings.imageEditMode) return;
        toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
      }} 
      onContextMenu={(e) => onContextMenu(e, slot)} 
      draggable={!!slot.product && !isSelected && !finalSettings.imageEditMode} 
      onDragStart={(e) => { e.dataTransfer.setData("sourcePage", String(pageNumber)); e.dataTransfer.setData("sourceIndex", String(slotIndex)); }} 
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }} 
      onDragLeave={() => setIsOver(false)} 
      onDrop={handleDrop} 
      className={`product-slot relative overflow-hidden border border-solid transition-all h-full min-w-0 min-h-0 cursor-pointer ${isSelected ? "ring-4 ring-blue-500 z-30 shadow-lg" : isOver ? "border-blue-500 scale-[0.98] z-20" : "hover:border-blue-300"}`} 
      style={{ gridColumn: gridPosition ? `${gridPosition.colStart} / span ${slot.colSpan}` : `span ${slot.colSpan}`, gridRow: gridPosition ? `${gridPosition.rowStart} / span ${slot.rowSpan}` : `span ${slot.rowSpan}`, borderRadius: getRadiusStyle(finalSettings.radiuses.cell), backgroundColor: hexToRgba(finalSettings.colors.cellBg.c, finalSettings.colors.cellBg.o), borderColor: hexToRgba(finalSettings.colors.cellBorder.c, finalSettings.colors.cellBorder.o), borderWidth: `${finalSettings.borderWidth}px`, boxShadow: getShadowStyle(finalSettings.shadows.cell), padding: getPaddingStyle(finalSettings.spacings.cell) }}
    >
      <div className="absolute top-0 left-0 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none z-[50]">{globalNumber}</div>
      {slot.product && (
        <div className={`w-full h-full flex flex-col relative min-w-0 min-h-0 ${isSelected ? "opacity-75" : ""}`}>
          
          {/* MALIYET GÖSTERGESI (z-40) */}
          {hasCost && <div className={`absolute right-1 text-[10px] font-black pointer-events-none z-[40] ${isLoss ? "text-red-600" : "text-green-600"}`} style={{ top: "10.5mm" }}>%{profit.toFixed(1)}</div>}

          {/* FİYAT KUTUSU (Yüksek Z-Index z-30) */}
          <div className={`absolute top-0 z-[30] flex shadow-sm transition-all px-1.5 py-1 cursor-text pointer-events-auto ${finalSettings.pricePosition === 'left' ? 'left-0' : finalSettings.pricePosition === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`} style={{ width: `${finalSettings.priceWidth}%`, height: `${finalSettings.priceHeight}mm`, backgroundColor: hexToRgba(finalSettings.colors.priceBg.c, finalSettings.colors.priceBg.o), borderRadius: getRadiusStyle(finalSettings.radiuses.price), ...getFontStyle(finalSettings.fonts.price) }} onClick={(e) => e.stopPropagation()} contentEditable suppressContentEditableWarning onBlur={(e) => updateSlotProduct(pageNumber, slot.id, { price: e.currentTarget.textContent || "0" })}>
            <div className="flex items-start pointer-events-none"><span style={{ lineHeight: "0.8" }}>{splitPrice(slot.product.price).main},</span><span style={{ fontSize: `${finalSettings.fonts.price.decimalScale}%`, verticalAlign: "top", lineHeight: "1em", marginLeft: "2px" }}>{splitPrice(slot.product.price).decimal}</span></div>
          </div>

          {/* RESİM ALANI (Düşük Z-Index z-10) */}
          <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6 pointer-events-auto relative z-[10]" title={slot.product.sku || "SKU Yok"} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} >
            {slot.product.image ? (
              <img src={slot.product.image} onMouseDown={handleMouseDown} draggable={false} className="max-w-full max-h-full object-contain select-none transformOrigin-center" style={{ transform: `translate(${displayX}px, ${displayY}px) scale(${displayScale})`, cursor: finalSettings.imageEditMode ? (imgDrag.isDragging ? 'grabbing' : 'grab') : 'default', transition: imgDrag.isDragging ? 'none' : 'transform 0.1s ease-out', }} />
            ) : (
              <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>
            )}
          </div>
          
          {/* ÜRÜN İSMİ (ÇÖZÜM 1 & 3: Layering ve Öteleme) */}
          <div 
            className="shrink-0 w-full flex flex-col cursor-text pointer-events-auto relative z-[20]" // z-20 ile resmin üzerinde (Çözüm 1)
            style={{ 
              height: "3em", 
              ...getFontStyle(finalSettings.fonts.productName), 
              paddingLeft: `${bl / 5}px`,
              paddingRight: `${br / 5}px`,
              marginBottom: `${maxRadiusBottom}px`,
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="line-clamp-2 w-full outline-none focus:bg-white/50 rounded whitespace-pre-wrap" contentEditable suppressContentEditableWarning onBlur={(e) => updateSlotProduct(pageNumber, slot.id, { name: e.currentTarget.innerText || "" })}>{slot.product.name}</div>
          </div>

        </div>
      )}
    </div>
  );
}