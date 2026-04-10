"use client";

import React, { useRef, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { TypographyData } from './TypographyPicker';
import { BorderRadiusData } from './BorderRadiusPicker';
import { SpacingData } from './SpacingPicker';
import { ShadowData } from './ShadowPicker';

export function PizzaSection({ instanceData, slotId, pageNumber }: { instanceData?: any, slotId?: string, pageNumber?: number }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const { title, colors, fonts, tableLineWidth, radiuses, spacings, shadows } = instanceData;
  const updateSlotModuleData = useCatalogStore((state) => state.updateSlotModuleData);

  const selection = useUIStore((state) => state.selection);
  const isSelected = selection.type === 'slot' && selection.ids.includes(slotId || "");

  const toggleSlotSelection = useUIStore((state) => state.toggleSlotSelection);
  const clearCatalogSelection = useUIStore((state) => state.clearSelection);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && slotId && pageNumber) {
      updateSlotModuleData(pageNumber, slotId, { imageUrl: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
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

    return {
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
      justifyContent,
      alignItems,
    };
  };

  const renderFormattedText = (text: string, font: TypographyData) => {
    if (!font.decimalScale || font.decimalScale === 100) return text;
    
    // /s bayrağını kaldırdık, yerine her karakteri ve alt satırı kapsayan [\s\S] kullandık
    const match = text.match(/^([\s\S]*?\d)([,.])(\d+)([\s\S]*)$/);
    if (match) {
      return (
        <span style={{ display: 'inline-block' }}>
          {match[1]}
          {match[2]}
          <span style={{ fontSize: `${font.decimalScale}%`, display: 'inline-block', verticalAlign: 'top', lineHeight: '1em' }}>
            {match[3]}
          </span>
          {match[4]}
        </span>
      );
    }
    return text;
  };

  // YENİ: Çift Tıklayarak Düzenleme Sağlayan Akıllı Bileşen
  const EditableText = ({ initialValue, font, className, style }: { initialValue: string, font: TypographyData, className?: string, style?: React.CSSProperties }) => {
    const [val, setVal] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
      return (
        <div
          className={`outline-none bg-white/90 ring-1 ring-inset ring-blue-500 z-50 shadow-sm ${className || ''}`}
          style={{ ...style, ...getFontStyle(font) }}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            setVal(e.currentTarget.innerText);
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsEditing(false);
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          ref={(el) => {
            // Açılır açılmaz imleci hücrenin en sonuna odakla
            if (el && document.activeElement !== el && window.getSelection) {
              el.focus();
              if (typeof window !== 'undefined') {
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
          {val}
        </div>
      );
    }

    return (
      <div
        className={`cursor-text ${className || ''}`}
        style={{ ...style, ...getFontStyle(font) }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        title="Düzenlemek için çift tıklayın"
      >
        {renderFormattedText(val, font)}
      </div>
    );
  };

  const Cell = ({ size, price, isLast = false }: { size: string, price: string, isLast?: boolean }) => (
    <div className="flex flex-col h-full border-solid transition-shadow duration-200" style={{ borderRightWidth: isLast ? 0 : `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o), boxShadow: getShadowStyle(shadows.cell) }}>
      <EditableText
        initialValue={size}
        font={fonts.sizes}
        className="flex-1 min-h-5.5 w-full border-solid"
        style={{ padding: getPaddingStyle(spacings.cell), borderBottomWidth: `${tableLineWidth}px`, backgroundColor: hexToRgba(colors.cellBg.c, colors.cellBg.o), borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o) }}
      />
      <EditableText
        initialValue={price}
        font={fonts.prices}
        className="flex-1 min-h-5.5 w-full"
        style={{ padding: getPaddingStyle(spacings.cell), backgroundColor: hexToRgba(colors.cellPriceBg.c, colors.cellPriceBg.o) }}
      />
    </div>
  );

  const SpecialCell = ({ title, price, isLast = false }: { title: string, price: string, isLast?: boolean }) => (
    <div className="flex flex-col h-full border-solid transition-shadow duration-200" style={{ borderRightWidth: isLast ? 0 : `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o), boxShadow: getShadowStyle(shadows.cell) }}>
      <EditableText
        initialValue={title}
        font={fonts.sizes}
        className="flex-1 whitespace-pre-wrap min-h-7.5 w-full border-solid"
        style={{ padding: getPaddingStyle(spacings.cell), borderBottomWidth: `${tableLineWidth}px`, backgroundColor: hexToRgba(colors.cellBg.c, colors.cellBg.o), borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o) }}
      />
      <EditableText
        initialValue={price}
        font={fonts.prices}
        className="flex-1 min-h-5.5 w-full"
        style={{ padding: getPaddingStyle(spacings.cell), backgroundColor: hexToRgba(colors.cellPriceBg.c, colors.cellPriceBg.o) }}
      />
    </div>
  );

  return (
      <div 
        id="pizza-section"
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected && slotId) {
            clearCatalogSelection();
            toggleSlotSelection(slotId, e.ctrlKey || e.shiftKey);
          }
        }}
        className={`w-full h-full flex flex-col transition-all duration-200 cursor-pointer border-2 ${isSelected ? 'z-30' : 'hover:border-blue-300'}`} 
        style={{ padding: getPaddingStyle(spacings.container), backgroundColor: hexToRgba(colors.bg.c, colors.bg.o), borderColor: isSelected ? 'transparent' : hexToRgba(colors.border.c, colors.border.o), borderRadius: getRadiusStyle(radiuses.container), boxShadow: isSelected ? `0 0 0 4px #3b82f6, ${getShadowStyle(shadows.container)}` : getShadowStyle(shadows.container) }}
      >
      
      <div className="w-full shrink-0 border-b-2 pb-2 flex" style={{ borderColor: hexToRgba(colors.border.c, colors.border.o) }}>
        <EditableText
          initialValue={title || "PIZZA-MENÜ"}
          font={fonts.title}
          className="w-full"
        />
      </div>

      <div className="flex flex-row gap-[5mm] flex-1 min-h-0 mt-[10mm]">
        
        {/* SOL KOLON */}
        <div className="flex flex-col gap-[6mm] flex-3 h-full">
          {/* TABLO 1 */}
          <div className="flex flex-col overflow-hidden flex-1 border-solid" style={{ borderWidth: `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o), backgroundColor: hexToRgba(colors.tableBg.c, colors.tableBg.o), borderRadius: getRadiusStyle(radiuses.table), boxShadow: getShadowStyle(shadows.table) }}>
            <EditableText
              initialValue="New York Kraft Braun 100 Stk."
              font={fonts.tableTitle}
              className="w-full"
              style={{ padding: getPaddingStyle(spacings.tableTitle), backgroundColor: hexToRgba(colors.tableTitleBg.c, colors.tableTitleBg.o) }}
            />
            <div className="flex flex-col flex-1 gap-[3mm]">
              <div className="grid grid-cols-4 flex-1 border-solid" style={{ borderBottomWidth: `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o) }}>
                <Cell size="20x20" price="7,99" />
                <Cell size="22x22" price="9,49" />
                <Cell size="24x24" price="10,49" />
                <Cell size="26x26" price="11,49" isLast />
              </div>
              <div className="grid grid-cols-4 flex-1 border-solid" style={{ borderTopWidth: `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o) }}>
                <Cell size="28x28" price="12,49" />
                <Cell size="29x29" price="12,99" />
                <Cell size="30x30" price="13,49" />
                <Cell size="32x32" price="14,49" isLast />
              </div>
            </div>
          </div>

          {/* TABLO 2 */}
          <div className="flex flex-col overflow-hidden flex-1 border-solid" style={{ borderWidth: `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o), backgroundColor: hexToRgba(colors.tableBg.c, colors.tableBg.o), borderRadius: getRadiusStyle(radiuses.table), boxShadow: getShadowStyle(shadows.table) }}>
            <EditableText
              initialValue="New York Kraft Weiss 100 Stk."
              font={fonts.tableTitle}
              className="w-full border-solid"
              style={{ padding: getPaddingStyle(spacings.tableTitle), borderBottomWidth: `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o), backgroundColor: hexToRgba(colors.tableTitleBg.c, colors.tableTitleBg.o) }}
            />
            <div className="flex flex-col flex-1 gap-[3mm]">
              <div className="grid grid-cols-4 flex-1 border-solid" style={{ borderBottomWidth: `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o) }}>
                <Cell size="20x20" price="7,99" />
                <Cell size="22x22" price="9,49" />
                <Cell size="24x24" price="10,49" />
                <Cell size="26x26" price="11,49" isLast />
              </div>
              <div className="grid grid-cols-4 flex-1 border-solid" style={{ borderTopWidth: `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o) }}>
                <Cell size="28x28" price="12,49" />
                <Cell size="29x29" price="12,99" />
                <Cell size="30x30" price="13,49" />
                <Cell size="32x32" price="14,49" isLast />
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ KOLON */}
        <div className="flex flex-col gap-[4mm] flex-5 h-full">
          {/* TABLO 3 */}
          <div className="flex flex-col overflow-hidden shrink-0 border-solid" style={{ borderWidth: `${tableLineWidth}px`, borderColor: hexToRgba(colors.tableLine.c, colors.tableLine.o), backgroundColor: hexToRgba(colors.tableBg.c, colors.tableBg.o), borderRadius: getRadiusStyle(radiuses.table), boxShadow: getShadowStyle(shadows.table) }}>
            <div className="grid grid-cols-3">
              <SpecialCell title={"Rollo\n(200 Stk.)"} price="7,99" />
              <SpecialCell title={"Calzone\n(100 Stk.)"} price="9,49" />
              <SpecialCell title={"Familie 40x60\n(50 Stk.)"} price="10,49" isLast />
            </div>
          </div>

          {/* RESİM ALANI */}
          <div 
            data-hide-on-export={!instanceData.imageUrl ? "true" : undefined}
            className="flex-1 border-2 border-dashed flex items-center justify-center relative group cursor-pointer overflow-hidden min-h-0"
            style={{ borderColor: hexToRgba(colors.imgBorder.c, colors.imgBorder.o), backgroundColor: hexToRgba(colors.imgBg.c, colors.imgBg.o), borderRadius: getRadiusStyle(radiuses.image), boxShadow: getShadowStyle(shadows.image) }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {instanceData.imageUrl ? (
              <img src={instanceData.imageUrl} alt="Pizza Kartonu" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="text-slate-400 font-bold text-[14px] flex flex-col items-center">
                <span className="text-3xl mb-1">+</span>
                <span>RESİM EKLE</span>
              </div>
            )}
          </div>
        </div>
        
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  );
}