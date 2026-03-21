"use client";

import React from "react";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { BorderRadiusPicker } from "../BorderRadiusPicker";
import { SpacingPicker } from "../SpacingPicker";
import { ShadowPicker } from "../ShadowPicker";
import { usePizzaStore } from "../../store/usePizzaStore";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export function PizzaSettingsPanel({ isOpen, onToggle }: Props) {
  const { colors, fonts, radiuses, spacings, shadows, tableLineWidth, updateColor, updateFont, updateRadius, updateSpacing, updateShadow, updateTableLineWidth } = usePizzaStore();

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-sm mb-4 relative z-10">
      <button onClick={onToggle} className={`w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors ${isOpen ? "rounded-t-md" : "rounded-md"}`}>
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Pizza Bölümü Ayarları</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-3">
          
          {/* 1. ZEMİN AYARLARI */}
          <details className="group bg-white border border-slate-200 rounded shadow-sm relative">
            <summary className="text-[10px] font-black text-slate-600 uppercase tracking-widest p-2.5 cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors list-none flex justify-between items-center">
              Zemin Ayarları (Genel)
              <span className="group-open:rotate-180 transition-transform text-[8px]">▼</span>
            </summary>
            <div className="p-3 space-y-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600">Arka Plan Rengi</span>
                <ColorOpacityPicker color={colors.bg.c} opacity={colors.bg.o} onChange={(c, o) => updateColor("bg", c, o)} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-600">Kenarlık Rengi</span>
                <ColorOpacityPicker color={colors.border.c} opacity={colors.border.o} onChange={(c, o) => updateColor("border", c, o)} />
              </div>
              <BorderRadiusPicker title="Dış Çerçeve Ovalliği" value={radiuses.container} onChange={(val) => updateRadius("container", val)} />
              <SpacingPicker title="Dış Çerçeve İç Boşluğu" value={spacings.container} onChange={(val) => updateSpacing("container", val)} />
              <ShadowPicker title="Dış Çerçeve Gölgesi" value={shadows.container} onChange={(val) => updateShadow("container", val)} />
            </div>
          </details>

          {/* 2. TABLO AYARLARI */}
          <details className="group bg-white border border-slate-200 rounded shadow-sm relative">
            <summary className="text-[10px] font-black text-slate-600 uppercase tracking-widest p-2.5 cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors list-none flex justify-between items-center">
              Tablo Ayarları
              <span className="group-open:rotate-180 transition-transform text-[8px]">▼</span>
            </summary>
            <div className="p-3 space-y-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600">Tablo Zemin Rengi</span>
                <ColorOpacityPicker color={colors.tableBg.c} opacity={colors.tableBg.o} onChange={(c, o) => updateColor("tableBg", c, o)} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-600">Tablo Başlık Zemin Rengi</span>
                <ColorOpacityPicker color={colors.tableTitleBg.c} opacity={colors.tableTitleBg.o} onChange={(c, o) => updateColor("tableTitleBg", c, o)} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-600">Hücre Zemin (Ölçü)</span>
                <ColorOpacityPicker color={colors.cellBg.c} opacity={colors.cellBg.o} onChange={(c, o) => updateColor("cellBg", c, o)} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-600">Hücre Zemin (Fiyat)</span>
                <ColorOpacityPicker color={colors.cellPriceBg.c} opacity={colors.cellPriceBg.o} onChange={(c, o) => updateColor("cellPriceBg", c, o)} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-600">Çizgi Rengi</span>
                <ColorOpacityPicker color={colors.tableLine.c} opacity={colors.tableLine.o} onChange={(c, o) => updateColor("tableLine", c, o)} />
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <span className="text-[9px] font-medium text-slate-500 w-24">Tablo Çizgi Kalınlığı</span>
                <input type="range" min="0" max="10" value={tableLineWidth} onChange={(e) => updateTableLineWidth(Number(e.target.value))} className="flex-1 accent-blue-600" />
                <span className="text-[9px] font-bold text-slate-500 w-8 text-right">{tableLineWidth}px</span>
              </div>
              <BorderRadiusPicker title="Tablo Köşe Ovalliği" value={radiuses.table} onChange={(val) => updateRadius("table", val)} />
              <SpacingPicker title="Tablo Başlığı İç Boşluğu" value={spacings.tableTitle} onChange={(val) => updateSpacing("tableTitle", val)} />
              <SpacingPicker title="Hücre İç Boşluğu" value={spacings.cell} onChange={(val) => updateSpacing("cell", val)} />
              <ShadowPicker title="Tablo Gölgesi" value={shadows.table} onChange={(val) => updateShadow("table", val)} />
              <ShadowPicker title="Hücre Gölgesi" value={shadows.cell} onChange={(val) => updateShadow("cell", val)} />
            </div>
          </details>

          {/* 3. RESİM ALANI AYARLARI */}
          <details className="group bg-white border border-slate-200 rounded shadow-sm relative">
            <summary className="text-[10px] font-black text-slate-600 uppercase tracking-widest p-2.5 cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors list-none flex justify-between items-center">
              Resim Alanı Ayarları
              <span className="group-open:rotate-180 transition-transform text-[8px]">▼</span>
            </summary>
            <div className="p-3 space-y-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600">Arka Plan Rengi</span>
                <ColorOpacityPicker color={colors.imgBg.c} opacity={colors.imgBg.o} onChange={(c, o) => updateColor("imgBg", c, o)} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-600">Kenarlık Rengi</span>
                <ColorOpacityPicker color={colors.imgBorder.c} opacity={colors.imgBorder.o} onChange={(c, o) => updateColor("imgBorder", c, o)} />
              </div>
              <BorderRadiusPicker title="Resim Çerçevesi Ovalliği" value={radiuses.image} onChange={(val) => updateRadius("image", val)} />
              <ShadowPicker title="Resim Gölgesi" value={shadows.image} onChange={(val) => updateShadow("image", val)} />
            </div>
          </details>

          {/* 4. FONT AYARLARI */}
          <details className="group bg-white border border-slate-200 rounded shadow-sm relative">
            <summary className="text-[10px] font-black text-slate-600 uppercase tracking-widest p-2.5 cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors list-none flex justify-between items-center">
              Font Ayarları
              <span className="group-open:rotate-180 transition-transform text-[8px]">▼</span>
            </summary>
            <div className="p-2 border-t border-slate-200 bg-slate-50 relative">
              <TypographyPicker title="Ana Başlık" value={fonts.title} onChange={(val) => updateFont("title", val)} />
              <TypographyPicker title="Tablo Başlığı" value={fonts.tableTitle} onChange={(val) => updateFont("tableTitle", val)} />
              <TypographyPicker title="Ölçüler" value={fonts.sizes} onChange={(val) => updateFont("sizes", val)} />
              <TypographyPicker title="Fiyatlar" value={fonts.prices} onChange={(val) => updateFont("prices", val)} />
            </div>
          </details>

        </div>
      )}
    </div>
  );
}