"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { ModuleRegistry } from "@/lib/moduleRegistry";
import { useState, useEffect, forwardRef } from "react";
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
  totalRows?: number;
  totalColumns?: number;
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
  
  const baseStyle: React.CSSProperties = {
    fontFamily: font.fontFamily,
    fontWeight: font.fontWeight,
    fontSize: `${font.fontSize}px`, 
    lineHeight: font.lineHeight,
    letterSpacing: `${font.letterSpacing}px`,
    textAlign: font.textAlign,
    textTransform: font.textTransform,
    textDecoration: font.textDecoration,
    color: hexToRgba(font.color, font.opacity),
    display: 'flex',
    justifyContent: font.textAlign === "center" ? "center" : font.textAlign === "right" ? "flex-end" : "flex-start",
    alignItems: font.verticalAlign === "top" ? "flex-start" : font.verticalAlign === "bottom" ? "flex-end" : "center",
  };
  return baseStyle;
};

export const Slot = forwardRef<HTMLDivElement, SlotProps>(({ slot, pageNumber, slotIndex, globalNumber, onContextMenu, gridPosition, totalRows, totalColumns }, ref) => {
  const { 
    globalSettings, swapSlotContents, setSlotProduct, setSlotModule,
    updateSlotProduct, updateSlotCustomSettings, updateSlotImageSettings,
    disableAllImageEditModes 
  } = useCatalogStore();

  const { 
    selectedSlotIds, toggleSlotSelection, 
    setSelectedTextElement, selectedTextElement, 
    editingContent, setEditingContent
  } = useUIStore();

  const [isOver, setIsOver] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'price' | null>(null);

  const [imgDrag, setImgDrag] = useState({ isDragging: false, startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, currentX: 0, currentY: 0 });
  const [editingText, setEditingText] = useState<'name' | 'price' | null>(null);

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

  // DÜZELTİLEN BÖLÜM: Küresel ayarların Slot seviyesinde düzgün işlenmesi
  const finalSettings = (slot.isCustom && slot.customSettings) 
    ? deepMerge(JSON.parse(JSON.stringify(globalSettings)), slot.customSettings)
    : globalSettings;

  const imgSettings = slot.imageSettings || {};
  // BURAYI DEĞİŞTİRİYORUZ: Eski global ayarlara düşmesini engelliyoruz
  const isImgEditMode = imgSettings.editMode ?? false;
  const currentPosX = imgSettings.posX ?? 0;
  const currentPosY = imgSettings.posY ?? 0;
  const currentScale = imgSettings.scale ?? 100;

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
  const isEditing = editingContent?.slotId === slot.id;

  let profit = 0, isLoss = false, hasCost = false;
  if (slot.product) {
    const sale = parsePrice(slot.product.price), cost = parsePrice(slot.product.raw?.EK);
    if (cost > 0) { hasCost = true; profit = ((sale - cost) / cost) * 100; isLoss = profit < 0; }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsOver(false);
    
    const newModuleType = e.dataTransfer.getData("newModuleType");
    if (newModuleType) {
      if (slot.role !== 'free') {
        useCatalogStore.getState().toggleSlotRole('free');
      }
      useCatalogStore.getState().setSlotModule(pageNumber, slot.id, newModuleType as any);
      return;
    }

    if (slot.role !== 'free') {
      const sourceTempPoolSku = e.dataTransfer.getData("sourceTempPoolSku");
      if (sourceTempPoolSku) {
        const tempPool = useCatalogStore.getState().tempProductPool;
        const tempProduct = tempPool.find(p => p.sku === sourceTempPoolSku);
        if (tempProduct) {
           if (slot.product) {
             useCatalogStore.getState().addToTempPool(slot.product, pageNumber, slot.id);
           }
           useCatalogStore.getState().setSlotProduct(pageNumber, slot.id, tempProduct);
        }
        return;
      }

      const newProductData = e.dataTransfer.getData("newProductFromSidebar");
      if (newProductData) { setSlotProduct(pageNumber, slot.id, JSON.parse(newProductData)); return; }
      const sPage = parseInt(e.dataTransfer.getData("sourcePage")), sIndex = parseInt(e.dataTransfer.getData("sourceIndex"));
      if (!isNaN(sPage) && (sPage !== pageNumber || sIndex !== slotIndex)) swapSlotContents(sPage, sIndex, pageNumber, slotIndex);
    }
  };

  const handleImgMouseDown = (e: React.MouseEvent) => {
    if (!isImgEditMode) return;
    e.preventDefault(); e.stopPropagation();
    setImgDrag({ isDragging: true, startX: e.clientX, startY: e.clientY, initialPosX: currentPosX, initialPosY: currentPosY, currentX: currentPosX, currentY: currentPosY });
  };

  const displayX = imgDrag.isDragging ? imgDrag.currentX : currentPosX;
  const displayY = imgDrag.isDragging ? imgDrag.currentY : currentPosY;
  const displayScale = currentScale / 100;

  const boxShadow = getShadowStyle(finalSettings.shadows.cell);

  let freeSlotStyles: React.CSSProperties = {};

  const baseCols = 4;
  const baseRows = 4;
  const currentCols = totalColumns || 4;
  const currentRows = totalRows || 4;

  const widthRatio = slot.colSpan / currentCols;
  const heightRatio = slot.rowSpan / currentRows;

  const baseWidthRatio = 1 / baseCols;
  const baseHeightRatio = 1 / baseRows;

  const scaleX = widthRatio / baseWidthRatio;
  const scaleY = heightRatio / baseHeightRatio;

  const trueScale = Math.min(scaleX, scaleY);
  const clampedScale = Math.max(0.4, Math.min(3, trueScale));
  
  if (slot.role === 'free' && gridPosition) {
    const R = totalRows || 4;
    const C = totalColumns || 4;
    
    const r_idx = gridPosition.rowStart - 1;
    const c_idx = gridPosition.colStart - 1;
    const sr = slot.rowSpan;
    const sc = slot.colSpan;

    freeSlotStyles = {
      position: 'absolute',
      gridColumn: '1 / -1',
      gridRow: '1 / -1',
      top: `${(r_idx / R) * 100}%`,
      left: `${(c_idx / C) * 100}%`,
      width: `${(sc / C) * 100}%`,
      height: `${(sr / R) * 100}%`,
      zIndex: 40,
      margin: 0
    };
  }

  return (
    <div
      ref={ref}
      id={`slot-${slot.id}`}
      onClick={(e) => {
        e.stopPropagation();
        if (editingContent?.slotId === slot.id) return;
        if (editingContent) setEditingContent(null);

        disableAllImageEditModes();
        
        toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (slot.role === 'free' && slot.moduleData) {
          setEditingContent({ slotId: slot.id, contentType: slot.moduleData.type });
        } else if (slot.role === 'product') {
          setEditingContent({ slotId: slot.id, contentType: 'product' });
        }
      }}
      onContextMenu={(e) => onContextMenu(e, slot)} 
      draggable={!!slot.product && !isSelected && !isImgEditMode} 
      onDragStart={(e) => {
        e.dataTransfer.setData("sourcePage", String(pageNumber));
        e.dataTransfer.setData("sourceIndex", String(slotIndex));

        if (slot.product) {
          const dragEl = document.createElement("div");
          dragEl.style.width = "100px";
          dragEl.style.height = "120px";
          dragEl.style.backgroundColor = "white";
          dragEl.style.border = "2px solid #cbd5e1";
          dragEl.style.borderRadius = "8px";
          dragEl.style.display = "flex";
          dragEl.style.flexDirection = "column";
          dragEl.style.alignItems = "center";
          dragEl.style.justifyContent = "center";
          dragEl.style.padding = "8px";
          dragEl.style.position = "absolute";
          dragEl.style.top = "-1000px";
          dragEl.style.left = "-1000px";
          dragEl.style.zIndex = "-9999";

          if (slot.product.image) {
            const img = document.createElement("img");
            img.src = slot.product.image;
            img.style.width = "70px";
            img.style.height = "70px";
            img.style.objectFit = "contain";
            img.style.marginBottom = "4px";
            dragEl.appendChild(img);
          }

          const text = document.createElement("div");
          text.textContent = slot.product.name;
          text.style.fontSize = "10px";
          text.style.fontWeight = "bold";
          text.style.color = "#334155";
          text.style.textAlign = "center";
          text.style.width = "100%";
          text.style.overflow = "hidden";
          text.style.whiteSpace = "nowrap";
          text.style.textOverflow = "ellipsis";
          dragEl.appendChild(text);

          document.body.appendChild(dragEl);
          e.dataTransfer.setDragImage(dragEl, 50, 60);

          setTimeout(() => {
            if (document.body.contains(dragEl)) document.body.removeChild(dragEl);
          }, 0);
        }
      }}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }} 
       onDragLeave={() => setIsOver(false)} 
       onDrop={handleDrop} 
       className={`product-slot pointer-events-auto relative overflow-hidden border border-solid transition-all h-full w-full min-w-12.5 min-h-12.5 cursor-pointer ${ isSelected ? "z-50 outline-4 outline-blue-500 outline-offset-2 shadow-2xl" : isOver ? "border-blue-500 scale-[0.98] z-20" : "hover:border-blue-300 z-10"}`}
       style={{ 
         gridColumn: gridPosition ? `${gridPosition.colStart} / span ${slot.colSpan}` : `span ${slot.colSpan}`, 
         gridRow: gridPosition ? `${gridPosition.rowStart} / span ${slot.rowSpan}` : `span ${slot.rowSpan}`, 
         borderRadius: getRadiusStyle(finalSettings.radiuses.cell), 
         backgroundColor: hexToRgba(finalSettings.colors.cellBg.c, finalSettings.colors.cellBg.o), 
         borderColor: hexToRgba(finalSettings.colors.cellBorder.c, finalSettings.colors.cellBorder.o), 
         borderWidth: `${finalSettings.borderWidth}px`, 
         boxShadow: isSelected ? undefined : boxShadow, 
         padding: getPaddingStyle(finalSettings.spacings.cell),
         ...freeSlotStyles
       }}
    >
      <div data-hide-on-export="true" className="absolute top-0 left-0 p-1 text-[11px] font-black text-slate-400/50 pointer-events-none z-50">{globalNumber}</div>

      {slot.role === 'free' && (
        <div className="w-full h-full flex flex-col relative z-20 overflow-hidden pointer-events-auto rounded-[inherit]">
          {!slot.moduleData ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 pointer-events-none">
              <span className="text-slate-400 font-bold text-[14px] uppercase tracking-widest flex flex-col items-center gap-2">
                SERBEST ALAN
              </span>
              <span className="text-[9px] text-slate-400 mt-1">Modül Sürükleyin</span>
            </div>
          ) : (
            <div className={`absolute inset-0 ${editingContent?.slotId === slot.id ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              {slot.moduleData?.type && ModuleRegistry[slot.moduleData.type] ? (
                 (() => {
                   const CanvasComponent = ModuleRegistry[slot.moduleData.type].canvasComponent;
                   return <CanvasComponent instanceData={slot.moduleData} slotId={slot.id} pageNumber={pageNumber} />;
                 })()
              ) : slot.moduleData?.type ? (
                 <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 font-bold border border-red-200">
                    Bilinmeyen Modül: {slot.moduleData.type}
                 </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {slot.role !== 'free' && !slot.product && (
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
           <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Boş Hücre</span>
        </div>
      )}

      {slot.product && (
        <div className={`w-full h-full flex flex-col min-w-0 min-h-0 ${editingContent?.slotId === slot.id ? 'opacity-100' : (isSelected ? 'opacity-75' : '')}`}>
          <div 
            className={`absolute top-0 z-30 flex shadow-sm transition-all px-1.5 py-1 pointer-events-auto outline-none ${
              selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'price' ? 'ring-2 ring-blue-500 ring-offset-1 cursor-text' : 'cursor-pointer hover:ring-1 hover:ring-blue-300'
            } ${finalSettings.pricePosition === 'left' ? 'left-0' : finalSettings.pricePosition === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'}`} 
            style={{
              width: `${finalSettings.priceWidth}%`,
              height: `${finalSettings.priceHeight * clampedScale}mm`,
              backgroundColor: hexToRgba(finalSettings.colors.priceBg?.c || "#e60000", finalSettings.colors.priceBg?.o ?? 100),
              borderRadius: getRadiusStyle(finalSettings.radiuses.price),
              borderStyle: 'solid',
              borderWidth: `${(finalSettings.priceBorderWidth || 0) * clampedScale}px`,
              borderColor: hexToRgba(finalSettings.colors.priceBorder?.c || "#ffffff", finalSettings.colors.priceBorder?.o ?? 100),
              ...getFontStyle({ ...finalSettings.fonts.price, fontSize: finalSettings.fonts.price.fontSize * clampedScale })
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
              setSelectedTextElement({ slotId: slot.id, elementType: 'price' });
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingText('price');
            }}
          >
            {editingText === 'price' ? (
              <div
                contentEditable
                suppressContentEditableWarning
                className="w-full h-full flex items-center justify-center text-center outline-none bg-white/90 text-black rounded"
                style={{ cursor: 'text' }}
                onBlur={(e) => {
                  updateSlotProduct(pageNumber, slot.id, { price: e.currentTarget.innerText });
                  setEditingText(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.currentTarget.blur(); }
                }}
                ref={el => {
                  if (el && document.activeElement !== el) {
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
              >
                {slot.product.price}
              </div>
            ) : (
              <div className="flex items-start pointer-events-none"><span style={{ lineHeight: "0.8" }}>{splitPrice(slot.product.price).main},</span><span style={{ fontSize: `${finalSettings.fonts.price.decimalScale}%`, verticalAlign: "top", lineHeight: "1em", marginLeft: "2px" }}>{splitPrice(slot.product.price).decimal}</span></div>
            )}
          </div>

          <div title={slot.product.sku} className="flex-1 flex items-center justify-center min-h-0 min-w-0 mb-2 mt-6 pointer-events-auto relative z-10 overflow-hidden">
            {slot.product.image ? (
              <img src={slot.product.image} onMouseDown={handleImgMouseDown} draggable={false} className="max-w-full max-h-full object-contain select-none" style={{ transform: `translate(${displayX}px, ${displayY}px) scale(${displayScale})`, cursor: isImgEditMode ? 'grab' : 'default' }} />
            ) : (
              <div className="text-[8px] text-slate-300 italic uppercase">Resim Yok</div>
            )}
          </div>
          
          <div className="shrink-0 w-full flex pointer-events-auto relative z-20" style={{ height: `${3 * (finalSettings.fonts.productName.lineHeight || 1.2)}em`, ...getFontStyle({ ...finalSettings.fonts.productName, fontSize: finalSettings.fonts.productName.fontSize * clampedScale }) }}>
            <div 
              className={`w-full h-full outline-none transition-all ${
                editingText === 'name' ? 'bg-white/90 text-black z-50 ring-2 ring-blue-500 overflow-hidden whitespace-pre-wrap rounded cursor-text' : 'line-clamp-3 whitespace-pre-wrap hover:ring-1 hover:ring-blue-300'
              } ${
                selectedTextElement?.slotId === slot.id && selectedTextElement?.elementType === 'name' && editingText !== 'name' ? 'ring-2 ring-blue-500' : ''
              }`} 
              contentEditable={editingText === 'name'}
              suppressContentEditableWarning
              onClick={(e) => {
                e.stopPropagation();
                if (editingText !== 'name') {
                  toggleSlotSelection(slot.id, e.ctrlKey || e.metaKey);
                  setSelectedTextElement({ slotId: slot.id, elementType: 'name' });
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingText('name');
              }}
              onBlur={(e) => {
                updateSlotProduct(pageNumber, slot.id, { name: e.currentTarget.innerText });
                setEditingText(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { 
                  e.preventDefault(); 
                  e.currentTarget.blur(); 
                } else if (e.key === 'Enter') {
                  // En fazla 3 satıra (2 adet Enter'a) izin ver
                  const text = e.currentTarget.innerText || "";
                  const newlines = (text.match(/\n/g) || []).length;
                  if (newlines >= 2) {
                    e.preventDefault();
                  }
                }
              }}
              ref={el => {
                if (editingText === 'name' && el && document.activeElement !== el) {
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
            >
              {slot.product.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});