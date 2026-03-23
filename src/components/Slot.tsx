"use client";

import { useCatalogStore, Slot as SlotType } from "@/store/useCatalogStore";
import { useBannerStore } from "@/store/useBannerStore";
import { usePizzaStore } from "@/store/usePizzaStore";
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
  // YENİ: selectedTextElement ve setSelectedTextElement eklendi
  const { globalSettings, swapSlotContents, toggleSlotSelection, setSlotProduct, updateSlotProduct, updateSlotCustomSettings, updateSlotImageSettings, selectedSlotIds, disableAllImageEditModes, selectedTextElement, setSelectedTextElement } = useCatalogStore();
  
  const clearBannerSelection = useBannerStore((state) => state.clearBannerSelection);
  const clearPizzaSelection = usePizzaStore((state) => state.clearSelection);

  const [isOver, setIsOver] = useState(false);
  
  // YENİ: Hangi metnin o an düzenleme modunda (yazı yazılabilir) olduğunu tutar
  const [editingText, setEditingText] = useState<'name' | 'price' | 'badge' | null>(null);

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

  const imgSettings = slot.imageSettings || {};
  const isImgEditMode = imgSettings.editMode || false;

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
      updateSlotImageSettings(pageNumber, slot.id, { posX: imgDrag.currentX, posY: imgDrag.currentY });
      setImgDrag(prev => ({ ...prev, isDragging: false }));
    }
    if (badgeDrag.isDragging) {
      e.stopPropagation();
      updateSlotCustomSettings({ badge: { ...finalSettings.badge!, posX: badgeDrag.currentX, posY: badgeDrag.currentY } });
      setBadgeDrag(prev => ({ ...prev, isDragging: false }));
    }
  };

  const handleImgMouseDown = (e: React.MouseEvent) => {
    if (!isImgEditMode) return;
    e.preventDefault(); e.stopPropagation();
    setImgDrag({ isDragging: true, startX: e.clientX, startY: e.clientY, initialPosX: imgSettings.posX || 0, initialPosY: imgSettings.posY || 0, currentX: imgSettings.posX || 0, currentY: imgSettings.posY || 0 });
  };

  const handleBadgeMouseDown = (e: React.MouseEvent) => {
    if (!finalSettings.badge?.isFreePosition) return;
    e.preventDefault(); e.stopPropagation();
    setBadgeDrag({ isDragging: true, startX: e.clientX, startY: e.clientY, initialPosX: finalSettings.badge?.posX || 0, initialPosY: finalSettings.badge?.posY || 0, currentX: finalSettings.badge?.posX || 0, currentY: finalSettings.badge?.posY || 0 });
  };

  const displayX = imgDrag.isDragging ? imgDrag.currentX : (imgSettings.posX || 0);
  const displayY = imgDrag.isDragging ? imgDrag.currentY : (imgSettings.posY || 0);
  const displayScale = (imgSettings.scale || 100) / 100;

  const badgeScale = (finalSettings.badge?.size || 100) / 100;
  const badgeX = badgeDrag.isDragging ? badgeDrag.currentX : (finalSettings.badge?.posX || 0);
  const badgeY = badgeDrag.isDragging ? badgeDrag.currentY : (finalSettings.badge?.posY || 0);

  const bl = finalSettings.radiuses.cell.bl || 0;
  const br = finalSettings.radiuses.cell.br || 0;
  const maxRadiusBottom = Math.max(bl, br) / 5;

  return (
    <div 
      id={`slot-${slot.id}`}
      onClick={(e) => {
        e.stopPropagation(); 
        if (isSelected && (isImgEditMode || finalSettings.badge?.isFreePosition)) return;
        
        clearBannerSelection();
        clearPizzaSelection();
        disableAllImageEditModes();
        
        // YENİ: Hücrenin boşluğuna tıklandığında metin seçimini iptal et
        setSelectedTextElement(null); 
        
        toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
      }} 
      onContextMenu={(e) => onContextMenu(e, slot)} 
      draggable={!!slot.product && !isSelected && !isImgEditMode && !finalSettings.badge?.isFreePosition} 
      onDragStart={(e) => { e.dataTransfer.setData("sourcePage", String(pageNumber)); e.dataTransfer.setData("sourceIndex", String(slotIndex)); }} 
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }} 
      onDragLeave={() => setIsOver(false)} 
      onDrop={handleDrop} 
      className={`product-slot relative overflow-hidden border border-solid transition-all h-full min-w-0 min-h-0 cursor-pointer ${isSelected ? "z-30" : isOver ? "border-blue-500 scale-[0.98] z-20" : "hover:border-blue-300"}`} 
      style={{ 
        gridColumn: gridPosition ? `${gridPosition.colStart} / span ${slot.colSpan}` : `span ${slot.colSpan}`, 
        gridRow: gridPosition ? `${gridPosition.rowStart} / span ${slot.rowSpan}` : `span ${slot.rowSpan}`, 
        borderRadius: getRadiusStyle(finalSettings.radiuses.cell), 
        backgroundColor: hexToRgba(finalSettings.colors.cellBg.c, finalSettings.colors.cellBg.o), 
        borderColor: hexToRgba(finalSettings.colors.cellBorder.c, finalSettings.colors.cellBorder.o), 
        borderWidth: `${finalSettings.borderWidth}px`, 
        boxShadow: isSelected 
          ? `0 0 0 4px #3b82f6, ${getShadowStyle(finalSettings.shadows.cell)}` 
          : getShadowStyle(finalSettings.shadows.cell), 
        padding: getPaddingStyle(finalSettings.spacings.cell) 
      }}
    >
      <div data-hide-on-export="true" className="absolute top-0 left-0 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none z-[50]">{globalNumber}</div>
      
      {slot.product && (
        <div 
          className={`w-full h-full flex flex-col relative min-w-0 min-h-0 ${isSelected ? "opacity-75" : ""}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {hasCost && <div data-hide-on-export="true" className={`absolute right-1 text-[10px] font-black pointer-events-none z-[40] ${isLoss ? "text-red-600" : "text-green-600"}`} style={{ top: "10.5mm" }}>%{profit.toFixed(1)}</div>}

          {/* FİYAT ALANI */}
          <div 
            className={`absolute top-0 z-[30] flex shadow-sm transition-all px-1.5 py-1 pointer-events-auto outline-none ${
              // YENİ: Fiyat seçiliyse mavi ince çerçeve eklenir
              selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'price' ? 'ring-2 ring-blue-500 ring-offset-1 cursor-text' : 'cursor-pointer hover:ring-1 hover:ring-blue-300'
            } ${finalSettings.pricePosition === 'left' ? 'left-0' : finalSettings.pricePosition === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`} 
            style={{ width: `${finalSettings.priceWidth}%`, height: `${finalSettings.priceHeight}mm`, backgroundColor: hexToRgba(finalSettings.colors.priceBg.c, finalSettings.colors.priceBg.o), borderRadius: getRadiusStyle(finalSettings.radiuses.price), ...getFontStyle(finalSettings.fonts.price) }} 
            
            // YENİ: Tek tıkla Seç, Çift Tıkla Düzenle Mantığı
            onClick={(e) => {
              e.stopPropagation();
              if (!selectedSlotIds.includes(slot.id)) toggleSlotSelection(slot.id, false);
              setSelectedTextElement({ slotId: slot.id, elementType: 'price' });
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingText('price');
              const target = e.currentTarget;
              setTimeout(() => target.focus(), 0);
            }}
            contentEditable={editingText === 'price'} 
            suppressContentEditableWarning 
            onBlur={(e) => {
              setEditingText(null);
              updateSlotProduct(pageNumber, slot.id, { price: e.currentTarget.textContent || "0" });
            }}
          >
            <div className="flex items-start pointer-events-none"><span style={{ lineHeight: "0.8" }}>{splitPrice(slot.product.price).main},</span><span style={{ fontSize: `${finalSettings.fonts.price.decimalScale}%`, verticalAlign: "top", lineHeight: "1em", marginLeft: "2px" }}>{splitPrice(slot.product.price).decimal}</span></div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6 pointer-events-auto relative z-[10]" title={slot.product.sku || "SKU Yok"}>
            {slot.product.image ? (
              <img src={slot.product.image} onMouseDown={handleImgMouseDown} draggable={false} className="max-w-full max-h-full object-contain select-none transformOrigin-center" style={{ transform: `translate(${displayX}px, ${displayY}px) scale(${displayScale})`, cursor: isImgEditMode ? (imgDrag.isDragging ? 'grabbing' : 'grab') : 'default', transition: imgDrag.isDragging ? 'none' : 'transform 0.1s ease-out', }} />
            ) : (
              <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>
            )}
          </div>
          
          {/* ÜRÜN İSMİ ALANI */}
          <div className="shrink-0 w-full flex flex-col pointer-events-auto relative z-[20]" style={{ height: "3em", ...getFontStyle(finalSettings.fonts.productName), paddingLeft: `${bl / 5}px`, paddingRight: `${br / 5}px`, marginBottom: `${maxRadiusBottom}px` }}>
            <div 
              className={`line-clamp-2 w-full outline-none focus:bg-white/50 rounded whitespace-pre-wrap transition-all ${
                // YENİ: İsim seçiliyse mavi ince çerçeve eklenir
                selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'name' ? 'ring-2 ring-blue-500 cursor-text' : 'cursor-pointer hover:ring-1 hover:ring-blue-300'
              }`} 
              
              // YENİ: Tek tıkla Seç, Çift Tıkla Düzenle Mantığı
              onClick={(e) => {
                e.stopPropagation();
                if (!selectedSlotIds.includes(slot.id)) toggleSlotSelection(slot.id, false);
                setSelectedTextElement({ slotId: slot.id, elementType: 'name' });
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingText('name');
                const target = e.currentTarget;
                setTimeout(() => target.focus(), 0);
              }}
              contentEditable={editingText === 'name'} 
              suppressContentEditableWarning 
              onBlur={(e) => {
                setEditingText(null);
                updateSlotProduct(pageNumber, slot.id, { name: e.currentTarget.innerText || "" });
              }}
            >
              {slot.product.name}
            </div>
          </div>

          {finalSettings.badge?.active && (() => {
            const bPos = finalSettings.badge?.position || 'top-left';
            const bShape = finalSettings.badge?.shape || 'rectangle';
            const bBg = finalSettings.badge?.bgColor || '#e60000';
            const bBorder = finalSettings.badge?.borderColor || '#ffffff';
            const bBorderW = finalSettings.badge?.borderWidth || 0;
            const bText = finalSettings.badge?.textColor || '#ffffff';
            
            return (
              <div 
                className={`absolute z-[40] pointer-events-auto transition-all flex items-center justify-center text-center leading-tight ${finalSettings.badge?.isFreePosition ? (badgeDrag.isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-text'} ${
                  bPos === 'top-left' ? 'top-2 left-2' :
                  bPos === 'top-right' ? 'top-2 right-2' :
                  bPos === 'bottom-left' ? 'bottom-2 left-2' :
                  'bottom-2 right-2'
                } ${
                  bShape === 'rectangle' ? (
                    bPos.includes('left') ? (bPos.includes('top') ? 'rounded-tl-md rounded-br-md px-3 py-1.5' : 'rounded-bl-md rounded-tr-md px-3 py-1.5') : (bPos.includes('top') ? 'rounded-tr-md rounded-bl-md px-3 py-1.5' : 'rounded-br-md rounded-tl-md px-3 py-1.5')
                  ) : bShape === 'pill' ? 'rounded-full px-4 py-1.5' :
                  bShape === 'circle' ? 'rounded-full w-14 h-14' :
                  bShape === 'banner' ? 'w-12 h-16' : 
                  bShape === 'flama' ? 'w-16 h-16' : 
                  'w-16 h-16' 
                }`}
                style={{ 
                  transform: `translate(${badgeX}px, ${badgeY}px) scale(${badgeScale})`,
                  transformOrigin: bPos.includes('left') ? 'top left' : 'top right',
                  backgroundColor: ['rectangle', 'pill', 'circle'].includes(bShape) ? hexToRgba(bBg, 100) : 'transparent',
                  borderStyle: ['rectangle', 'pill', 'circle'].includes(bShape) ? 'solid' : 'none',
                  borderColor: ['rectangle', 'pill', 'circle'].includes(bShape) ? hexToRgba(bBorder, 100) : 'transparent',
                  borderWidth: ['rectangle', 'pill', 'circle'].includes(bShape) ? `${bBorderW}px` : '0px',
                  ...getFontStyle(finalSettings.badge?.font || { ...finalSettings.fonts.productName, color: bText, fontSize: 10 }),
                  color: bText,
                  boxShadow: getShadowStyle(finalSettings.badge?.shadow || { active: false } as ShadowData),
                }}
                onMouseDown={handleBadgeMouseDown}
                onClick={(e) => e.stopPropagation()}
              >
                {['banner', 'burst', 'flama'].includes(bShape) && (
                  <svg viewBox={['burst', 'flama'].includes(bShape) ? "0 0 200 200" : "0 0 100 100"} preserveAspectRatio="none" className="absolute inset-0 w-full h-full -z-10 overflow-visible">
                    <path 
                      d={
                        bShape === 'banner' ? "M5,0 L95,0 L95,100 L50,75 L5,100 Z" :
                        bShape === 'flama' ? "M103.7,148.02 L153,158.8 L155.21,159.28 L155.21,48.09 L52.18,48.09 L52.18,159.28 L54.39,158.8 Z" :
                        "M177.65,135.05c-14.9-20.88-10.01-27.13,15.13-27.44-27.53-6.19-32.92-17.93-14.27-31.28-28.11,2.93-32.46-9.85-23.23-32.18-17.24,18.31-45.06,21.75-58.39-9.03-15.92,31.37-36.69,21.67-53.16,4.99,12.15,25.35,4.43,32.62-21.57,26.85,17.06,15.23,5.65,23.91-14.93,26.9,23.74,3.02,24.68,15,8.02,27.7,24.67.32,27.82,12.9,13.33,27.74,18.91-12.59,29.93-7.88,26.95,16.31,20.69-16.57,31.07-9.37,31.46,12.73,7.92-20.49,20.53-27.21,35.48-5.56,3.42-25.03,15.9-27.49,34.02-11.46-15.68-25.21-6.41-32.93,21.17-26.27Z"
                      } 
                      fill={hexToRgba(bBg, 100)} 
                      stroke={hexToRgba(bBorder, 100)} 
                      strokeWidth={bBorderW} 
                      vectorEffect="non-scaling-stroke" 
                      strokeLinejoin="round" 
                      fillRule="evenodd" 
                    />
                  </svg>
                )}
                
                {/* ETİKET METNİ */}
                <div 
                  className={`w-full h-full flex items-center justify-center z-10 p-1 whitespace-pre-wrap outline-none transition-all ${
                    // YENİ: Etiket metni seçiliyse
                    selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'badge' ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'
                  }`}
                  style={{ paddingBottom: ['banner'].includes(bShape) ? '15%' : '0' }}
                  
                  // YENİ: Tek tıkla Seç, Çift Tıkla Düzenle Mantığı
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!selectedSlotIds.includes(slot.id)) toggleSlotSelection(slot.id, false);
                    setSelectedTextElement({ slotId: slot.id, elementType: 'badge' });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if(!finalSettings.badge?.isFreePosition) {
                      setEditingText('badge');
                      const target = e.currentTarget;
                      setTimeout(() => target.focus(), 0);
                    }
                  }}
                  contentEditable={editingText === 'badge' && !finalSettings.badge?.isFreePosition}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    setEditingText(null);
                    updateSlotCustomSettings({ badge: { ...finalSettings.badge!, text: e.currentTarget.innerText || "YENİ" } });
                  }}
                >
                  {finalSettings.badge?.text || "YENİ"}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}