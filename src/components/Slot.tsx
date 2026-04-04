"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { useBannerStore } from "@/store/useBannerStore";
import { usePizzaStore } from "@/store/usePizzaStore";
import { useState, useEffect } from "react";
import { TypographyData } from "./TypographyPicker";
import { BorderRadiusData } from "./BorderRadiusPicker";
import { SpacingData } from "./SpacingPicker";
import { ShadowPicker, ShadowData } from "./ShadowPicker";

interface SlotProps { 
  slot: any; 
  pageNumber: number; 
  slotIndex: number; 
  globalNumber: number; 
  onContextMenu: (e: React.MouseEvent, slot: any) => void; 
  gridPosition?: { colStart: number; rowStart: number }; 
}

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

const getRadiusStyle = (r: BorderRadiusData) => r ? `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px` : "0px";
const getPaddingStyle = (s: SpacingData) => s ? `${s.t}px ${s.r}px ${s.b}px ${s.l}px` : "0px";
const getShadowStyle = (s: ShadowData) => {
  if (!s || !s.active) return 'none';
  return `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`;
};

const getFontStyle = (font: TypographyData): React.CSSProperties => {
  if (!font) return {};
  let justifyContent = "center";
  if (font.textAlign === "left") justifyContent = "flex-start";
  if (font.textAlign === "right") justifyContent = "flex-end";
  let alignItems = "center";
  if (font.verticalAlign === "top") alignItems = "flex-start";
  if (font.verticalAlign === "bottom") alignItems = "flex-end";
  return { fontFamily: font.fontFamily, fontWeight: font.fontWeight, fontSize: `${font.fontSize}px`, lineHeight: font.lineHeight, letterSpacing: `${font.letterSpacing}px`, textAlign: font.textAlign, textTransform: font.textTransform, textDecoration: font.textDecoration, color: hexToRgba(font.color, font.opacity), display: 'flex', justifyContent, alignItems };
};

export function Slot({ slot, pageNumber, slotIndex, globalNumber, onContextMenu, gridPosition }: SlotProps) {
  // useCatalogStore içindekiler
  const { 
    globalSettings, swapSlotContents, setSlotProduct, 
    updateSlotProduct, updateSlotCustomSettings, updateSlotImageSettings,
    disableAllImageEditModes // <--- Buraya taşındı
  } = useCatalogStore();

  // useUIStore içindekiler
  const { 
    selectedSlotIds, toggleSlotSelection, 
    setSelectedTextElement, selectedTextElement 
    // disableAllImageEditModes buradan silindi
  } = useUIStore();
  
  const clearBannerSelection = useBannerStore((state) => state.clearBannerSelection);
  const clearPizzaSelection = usePizzaStore((state) => state.clearSelection);

  const [isOver, setIsOver] = useState(false);
  const [editingText, setEditingText] = useState<'name' | 'price' | 'badge' | null>(null);

  const [imgDrag, setImgDrag] = useState({ isDragging: false, startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, currentX: 0, currentY: 0 });
  const [badgeDrag, setBadgeDrag] = useState({ isDragging: false, startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, currentX: 0, currentY: 0 });

  useEffect(() => {
    if (!imgDrag.isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - imgDrag.startX;
      const dy = e.clientY - imgDrag.startY;
      setImgDrag(prev => ({ ...prev, currentX: prev.initialPosX + dx, currentY: prev.initialPosY + dy }));
    };
    const handleMouseUp = () => {
      updateSlotImageSettings(pageNumber, slot.id, { posX: imgDrag.currentX, posY: imgDrag.currentY });
      setImgDrag(prev => ({ ...prev, isDragging: false }));
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [imgDrag.isDragging, imgDrag.startX, imgDrag.startY, imgDrag.initialPosX, imgDrag.initialPosY, imgDrag.currentX, imgDrag.currentY, pageNumber, slot.id, updateSlotImageSettings]);

  const isSelected = selectedSlotIds.includes(slot.id);
  
  function deepMerge(target: any, source: any) {
    if (!target || !source) return target || source;
    const output = { ...target };
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && key in target) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
    return output;
  }

  const finalSettings = (slot.isCustom && slot.customSettings) 
    ? deepMerge(JSON.parse(JSON.stringify(globalSettings)), slot.customSettings)
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

  const handleImgMouseDown = (e: React.MouseEvent) => {
    if (!isImgEditMode) return;
    e.preventDefault(); e.stopPropagation();
    setImgDrag({ isDragging: true, startX: e.clientX, startY: e.clientY, initialPosX: imgSettings.posX || 0, initialPosY: imgSettings.posY || 0, currentX: imgSettings.posX || 0, currentY: imgSettings.posY || 0 });
  };

  const displayX = imgDrag.isDragging ? imgDrag.currentX : (imgSettings.posX || 0);
  const displayY = imgDrag.isDragging ? imgDrag.currentY : (imgSettings.posY || 0);
  const displayScale = (imgSettings.scale || 100) / 100;

  const cellShadow = getShadowStyle(finalSettings.shadows.cell);
  const boxShadow = isSelected 
    ? `inset 0 0 0 3px #3b82f6${cellShadow !== 'none' ? `, ${cellShadow}` : ''}` 
    : cellShadow;

  return (
    <div 
      id={`slot-${slot.id}`}
      onClick={(e) => {
        e.stopPropagation();
        // Eğer resim düzenleme veya serbest konum modu aktifse tıklamayı engelleme, 
        // ama diğer her durumda (hücre boş olsa bile) SEÇİM YAP.
        if (isSelected && (isImgEditMode || finalSettings.badge?.isFreePosition)) return;
        
        clearBannerSelection();
        clearPizzaSelection();
        disableAllImageEditModes();
        setSelectedTextElement(null); 
        
        toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
      }} 
      onContextMenu={(e) => onContextMenu(e, slot)} 
      draggable={!!slot.product && !isSelected && !isImgEditMode} 
      onDragStart={(e) => { e.dataTransfer.setData("sourcePage", String(pageNumber)); e.dataTransfer.setData("sourceIndex", String(slotIndex)); }} 
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }} 
      onDragLeave={() => setIsOver(false)} 
      onDrop={handleDrop} 
      className={`product-slot relative border border-solid transition-all h-full w-full min-w-[50px] min-h-[50px] cursor-pointer pointer-events-auto ${isSelected ? "z-30" : isOver ? "border-blue-500 scale-[0.98] z-20" : "hover:border-blue-300"}`} 
      style={{ 
        gridColumn: gridPosition ? `${gridPosition.colStart} / span ${slot.colSpan}` : `span ${slot.colSpan}`, 
        gridRow: gridPosition ? `${gridPosition.rowStart} / span ${slot.rowSpan}` : `span ${slot.rowSpan}`, 
        borderRadius: getRadiusStyle(finalSettings.radiuses.cell), 
        backgroundColor: hexToRgba(finalSettings.colors.cellBg.c, finalSettings.colors.cellBg.o), 
        borderColor: hexToRgba(finalSettings.colors.cellBorder.c, finalSettings.colors.cellBorder.o), 
        borderWidth: `${finalSettings.borderWidth}px`, 
        boxShadow: boxShadow,
        padding: getPaddingStyle(finalSettings.spacings.cell) 
      }}
    >
      {/* GLOBAL SIRA NUMARASI - HER ZAMAN GÖRÜNÜR */}
      <div className="absolute top-0 left-0 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none z-[50]">{globalNumber}</div>
      
      {!slot.product && (
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
           <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Boş Hücre</span>
        </div>
      )}

      {slot.product && (
        <div 
          className={`w-full h-full flex flex-col relative min-w-0 min-h-0 ${isSelected ? "opacity-75" : ""}`}
        >
          {/* FİYAT ALANI */}
          <div 
            className={`absolute top-0 z-[30] flex shadow-sm transition-all px-1.5 py-1 pointer-events-auto outline-none ${
              selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'price' ? 'ring-2 ring-blue-500 ring-offset-1 cursor-text' : 'cursor-pointer hover:ring-1 hover:ring-blue-300'
            } ${finalSettings.pricePosition === 'left' ? 'left-0' : finalSettings.pricePosition === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`} 
            style={{
              width: `${finalSettings.priceWidth}%`,
              height: `${finalSettings.priceHeight}mm`,
              backgroundColor: hexToRgba(finalSettings.colors.priceBg?.c || "#e60000", finalSettings.colors.priceBg?.o ?? 100),
              borderRadius: getRadiusStyle(finalSettings.radiuses.price),
              borderStyle: 'solid',
              borderWidth: `${finalSettings.priceBorderWidth || 0}px`,
              borderColor: hexToRgba(finalSettings.colors.priceBorder?.c || "#ffffff", finalSettings.colors.priceBorder?.o ?? 100),
              ...getFontStyle(finalSettings.fonts.price)
            }} 
            onClick={(e) => {
              e.stopPropagation();
              toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
              setSelectedTextElement({ slotId: slot.id, elementType: 'price' });
            }}
          >
            <div className="flex items-start pointer-events-none"><span style={{ lineHeight: "0.8" }}>{splitPrice(slot.product.price).main},</span><span style={{ fontSize: `${finalSettings.fonts.price.decimalScale}%`, verticalAlign: "top", lineHeight: "1em", marginLeft: "2px" }}>{splitPrice(slot.product.price).decimal}</span></div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6 pointer-events-auto relative z-[10] overflow-hidden">
            {slot.product.image ? (
              <img src={slot.product.image} onMouseDown={handleImgMouseDown} draggable={false} className="max-w-full max-h-full object-contain select-none" style={{ transform: `translate(${displayX}px, ${displayY}px) scale(${displayScale})`, cursor: isImgEditMode ? 'grab' : 'default' }} />
            ) : (
              <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>
            )}
          </div>
          
          <div className="shrink-0 w-full flex pointer-events-auto relative z-[20]" style={{ height: "3em", ...getFontStyle(finalSettings.fonts.productName) }}>
            <div 
              className={`line-clamp-2 w-full outline-none transition-all ${
                selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'name' ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'
              }`} 
              onClick={(e) => {
                e.stopPropagation();
                toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
                setSelectedTextElement({ slotId: slot.id, elementType: 'name' });
              }}
            >
              {slot.product.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}