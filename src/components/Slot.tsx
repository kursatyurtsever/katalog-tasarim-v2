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
  
  const [imgDrag, setImgDrag] = useState({ isDragging: false, startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, currentX: 0, currentY: 0 });
  const [badgeDrag, setBadgeDrag] = useState({ isDragging: false, startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, currentX: 0, currentY: 0 });

  const isSelected = selectedSlotIds.includes(slot.id);
  
  function isObject(item: any) { return (item && typeof item === 'object' && !Array.isArray(item)); }
  function deepMerge(target: any, source: any) {
    if (!target) return source;
    if (!source) return target;
    const output = { ...target };
    Object.keys(source).forEach(key => {
      if (isObject(source[key]) && key in target && isObject(target[key])) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
    return output;
  }

  const finalSettings = (slot.isCustom && slot.customSettings) 
    ? deepMerge(globalSettings, slot.customSettings) as typeof globalSettings
    : globalSettings;

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (imgDrag.isDragging) {
      e.stopPropagation();
      setImgDrag(prev => ({ ...prev, currentX: prev.initialPosX + (e.clientX - prev.startX), currentY: prev.initialPosY + (e.clientY - prev.startY) }));
    } else if (badgeDrag.isDragging) {
      e.stopPropagation();
      setBadgeDrag(prev => ({ ...prev, currentX: prev.initialPosX + (e.clientX - prev.startX), currentY: prev.initialPosY + (e.clientY - prev.startY) }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (imgDrag.isDragging) {
      e.stopPropagation();
      updateSlotCustomSettings({ imagePosX: imgDrag.currentX, imagePosY: imgDrag.currentY });
      setImgDrag(prev => ({ ...prev, isDragging: false }));
    }
    if (badgeDrag.isDragging) {
      e.stopPropagation();
      updateSlotCustomSettings({ badge: { ...finalSettings.badge!, posX: badgeDrag.currentX, posY: badgeDrag.currentY } });
      setBadgeDrag(prev => ({ ...prev, isDragging: false }));
    }
  };

  const handleImgMouseDown = (e: React.MouseEvent) => {
    if (!finalSettings.imageEditMode) return;
    e.preventDefault(); e.stopPropagation();
    setImgDrag({ isDragging: true, startX: e.clientX, startY: e.clientY, initialPosX: finalSettings.imagePosX || 0, initialPosY: finalSettings.imagePosY || 0, currentX: finalSettings.imagePosX || 0, currentY: finalSettings.imagePosY || 0 });
  };

  const handleBadgeMouseDown = (e: React.MouseEvent) => {
    if (!finalSettings.badge?.isFreePosition) return;
    e.preventDefault(); e.stopPropagation();
    setBadgeDrag({ isDragging: true, startX: e.clientX, startY: e.clientY, initialPosX: finalSettings.badge?.posX || 0, initialPosY: finalSettings.badge?.posY || 0, currentX: finalSettings.badge?.posX || 0, currentY: finalSettings.badge?.posY || 0 });
  };

  const displayX = imgDrag.isDragging ? imgDrag.currentX : (finalSettings.imagePosX || 0);
  const displayY = imgDrag.isDragging ? imgDrag.currentY : (finalSettings.imagePosY || 0);
  const displayScale = (finalSettings.imageScale || 100) / 100;

  const badgeScale = (finalSettings.badge?.size || 100) / 100;
  const badgeX = badgeDrag.isDragging ? badgeDrag.currentX : (finalSettings.badge?.posX || 0);
  const badgeY = badgeDrag.isDragging ? badgeDrag.currentY : (finalSettings.badge?.posY || 0);

  const bl = finalSettings.radiuses.cell.bl || 0;
  const br = finalSettings.radiuses.cell.br || 0;
  const maxRadiusBottom = Math.max(bl, br) / 5;

  return (
    <div 
      onClick={(e) => {
        if (isSelected && (finalSettings.imageEditMode || finalSettings.badge?.isFreePosition)) return;
        toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
      }} 
      onContextMenu={(e) => onContextMenu(e, slot)} 
      draggable={!!slot.product && !isSelected && !finalSettings.imageEditMode && !finalSettings.badge?.isFreePosition} 
      onDragStart={(e) => { e.dataTransfer.setData("sourcePage", String(pageNumber)); e.dataTransfer.setData("sourceIndex", String(slotIndex)); }} 
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }} 
      onDragLeave={() => setIsOver(false)} 
      onDrop={handleDrop} 
      className={`product-slot relative overflow-hidden border border-solid transition-all h-full min-w-0 min-h-0 cursor-pointer ${isSelected ? "ring-4 ring-blue-500 z-30 shadow-lg" : isOver ? "border-blue-500 scale-[0.98] z-20" : "hover:border-blue-300"}`} 
      style={{ gridColumn: gridPosition ? `${gridPosition.colStart} / span ${slot.colSpan}` : `span ${slot.colSpan}`, gridRow: gridPosition ? `${gridPosition.rowStart} / span ${slot.rowSpan}` : `span ${slot.rowSpan}`, borderRadius: getRadiusStyle(finalSettings.radiuses.cell), backgroundColor: hexToRgba(finalSettings.colors.cellBg.c, finalSettings.colors.cellBg.o), borderColor: hexToRgba(finalSettings.colors.cellBorder.c, finalSettings.colors.cellBorder.o), borderWidth: `${finalSettings.borderWidth}px`, boxShadow: getShadowStyle(finalSettings.shadows.cell), padding: getPaddingStyle(finalSettings.spacings.cell) }}
    >
      <div className="absolute top-0 left-0 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none z-[50]">{globalNumber}</div>
      {slot.product && (
        <div 
          className={`w-full h-full flex flex-col relative min-w-0 min-h-0 ${isSelected ? "opacity-75" : ""}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          
          {hasCost && <div className={`absolute right-1 text-[10px] font-black pointer-events-none z-[40] ${isLoss ? "text-red-600" : "text-green-600"}`} style={{ top: "10.5mm" }}>%{profit.toFixed(1)}</div>}

          <div className={`absolute top-0 z-[30] flex shadow-sm transition-all px-1.5 py-1 cursor-text pointer-events-auto ${finalSettings.pricePosition === 'left' ? 'left-0' : finalSettings.pricePosition === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`} style={{ width: `${finalSettings.priceWidth}%`, height: `${finalSettings.priceHeight}mm`, backgroundColor: hexToRgba(finalSettings.colors.priceBg.c, finalSettings.colors.priceBg.o), borderRadius: getRadiusStyle(finalSettings.radiuses.price), ...getFontStyle(finalSettings.fonts.price) }} onClick={(e) => e.stopPropagation()} contentEditable suppressContentEditableWarning onBlur={(e) => updateSlotProduct(pageNumber, slot.id, { price: e.currentTarget.textContent || "0" })}>
            <div className="flex items-start pointer-events-none"><span style={{ lineHeight: "0.8" }}>{splitPrice(slot.product.price).main},</span><span style={{ fontSize: `${finalSettings.fonts.price.decimalScale}%`, verticalAlign: "top", lineHeight: "1em", marginLeft: "2px" }}>{splitPrice(slot.product.price).decimal}</span></div>
          </div>

          {/* RESİM ALANI */}
          <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6 pointer-events-auto relative z-[10]" title={slot.product.sku || "SKU Yok"}>
            {slot.product.image ? (
              <img src={slot.product.image} onMouseDown={handleImgMouseDown} draggable={false} className="max-w-full max-h-full object-contain select-none transformOrigin-center" style={{ transform: `translate(${displayX}px, ${displayY}px) scale(${displayScale})`, cursor: finalSettings.imageEditMode ? (imgDrag.isDragging ? 'grabbing' : 'grab') : 'default', transition: imgDrag.isDragging ? 'none' : 'transform 0.1s ease-out', }} />
            ) : (
              <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>
            )}
          </div>
          
          {/* ÜRÜN İSMİ */}
          <div className="shrink-0 w-full flex flex-col cursor-text pointer-events-auto relative z-[20]" style={{ height: "3em", ...getFontStyle(finalSettings.fonts.productName), paddingLeft: `${bl / 5}px`, paddingRight: `${br / 5}px`, marginBottom: `${maxRadiusBottom}px` }} onClick={(e) => e.stopPropagation()}>
            <div className="line-clamp-2 w-full outline-none focus:bg-white/50 rounded whitespace-pre-wrap" contentEditable suppressContentEditableWarning onBlur={(e) => updateSlotProduct(pageNumber, slot.id, { name: e.currentTarget.innerText || "" })}>{slot.product.name}</div>
          </div>

          {/* PROMOSYON ETİKETİ */}
          {finalSettings.badge?.active && (
            <div 
              className={`absolute z-[40] pointer-events-auto transition-all flex items-center justify-center text-center leading-tight ${finalSettings.badge?.isFreePosition ? (badgeDrag.isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-text'} ${
                finalSettings.badge.position === 'top-left' ? 'top-2 left-2' :
                finalSettings.badge.position === 'top-right' ? 'top-2 right-2' :
                finalSettings.badge.position === 'bottom-left' ? 'bottom-2 left-2' :
                'bottom-2 right-2'
              } ${
                finalSettings.badge.shape === 'rectangle' ? (
                  finalSettings.badge.position.includes('left') ? (finalSettings.badge.position.includes('top') ? 'rounded-tl-md rounded-br-md px-3 py-1.5' : 'rounded-bl-md rounded-tr-md px-3 py-1.5') : (finalSettings.badge.position.includes('top') ? 'rounded-tr-md rounded-bl-md px-3 py-1.5' : 'rounded-br-md rounded-tl-md px-3 py-1.5')
                ) : finalSettings.badge.shape === 'pill' ? 'rounded-full px-4 py-1.5' :
                finalSettings.badge.shape === 'circle' ? 'rounded-full w-14 h-14' :
                finalSettings.badge.shape === 'banner' ? 'w-12 h-16' : 
                finalSettings.badge.shape === 'flama' ? 'w-16 h-16' : 
                'w-16 h-16' // Burst
              }`}
              style={{ 
                transform: `translate(${badgeX}px, ${badgeY}px) scale(${badgeScale})`,
                transformOrigin: finalSettings.badge.position.includes('left') ? 'top left' : 'top right',
                backgroundColor: ['rectangle', 'pill', 'circle'].includes(finalSettings.badge.shape) ? hexToRgba(finalSettings.badge.bgColor, 100) : 'transparent',
                borderStyle: ['rectangle', 'pill', 'circle'].includes(finalSettings.badge.shape) ? 'solid' : 'none',
                borderColor: ['rectangle', 'pill', 'circle'].includes(finalSettings.badge.shape) ? hexToRgba(finalSettings.badge.borderColor, 100) : 'transparent',
                borderWidth: ['rectangle', 'pill', 'circle'].includes(finalSettings.badge.shape) ? `${finalSettings.badge.borderWidth}px` : '0px',
                ...getFontStyle(finalSettings.badge.font || { ...finalSettings.fonts.productName, color: finalSettings.badge.textColor, fontSize: 10 }),
                color: finalSettings.badge.textColor,
                boxShadow: getShadowStyle(finalSettings.badge.shadow || { active: false } as ShadowData),
              }}
              onMouseDown={handleBadgeMouseDown}
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* SVG ARKA PLANLAR */}
              {['banner', 'burst', 'flama'].includes(finalSettings.badge.shape) && (
                <svg viewBox={['burst', 'flama'].includes(finalSettings.badge.shape) ? "0 0 200 200" : "0 0 100 100"} preserveAspectRatio="none" className="absolute inset-0 w-full h-full -z-10 overflow-visible">
                  <path 
                    d={
                      finalSettings.badge.shape === 'banner' ? "M5,0 L95,0 L95,100 L50,75 L5,100 Z" :
                      finalSettings.badge.shape === 'flama' ? "M103.7,148.02 L153,158.8 L155.21,159.28 L155.21,48.09 L52.18,48.09 L52.18,159.28 L54.39,158.8 Z" :
                      "M177.65,135.05c-14.9-20.88-10.01-27.13,15.13-27.44-27.53-6.19-32.92-17.93-14.27-31.28-28.11,2.93-32.46-9.85-23.23-32.18-17.24,18.31-45.06,21.75-58.39-9.03-15.92,31.37-36.69,21.67-53.16,4.99,12.15,25.35,4.43,32.62-21.57,26.85,17.06,15.23,5.65,23.91-14.93,26.9,23.74,3.02,24.68,15,8.02,27.7,24.67.32,27.82,12.9,13.33,27.74,18.91-12.59,29.93-7.88,26.95,16.31,20.69-16.57,31.07-9.37,31.46,12.73,7.92-20.49,20.53-27.21,35.48-5.56,3.42-25.03,15.9-27.49,34.02-11.46-15.68-25.21-6.41-32.93,21.17-26.27Z"
                    } 
                    fill={hexToRgba(finalSettings.badge.bgColor, 100)} 
                    stroke={hexToRgba(finalSettings.badge.borderColor, 100)} 
                    strokeWidth={finalSettings.badge.borderWidth} 
                    vectorEffect="non-scaling-stroke" 
                    strokeLinejoin="round" 
                    fillRule="evenodd" 
                  />
                </svg>
              )}

              {/* YAZI ALANI */}
              <div 
                className="w-full h-full flex items-center justify-center z-10 p-1"
                style={{ paddingBottom: ['banner'].includes(finalSettings.badge.shape) ? '15%' : '0' }}
                contentEditable={!finalSettings.badge?.isFreePosition}
                suppressContentEditableWarning
                onBlur={(e) => updateSlotCustomSettings({ badge: { ...finalSettings.badge!, text: e.currentTarget.textContent || "YENİ" } })}
              >
                {finalSettings.badge.text}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}