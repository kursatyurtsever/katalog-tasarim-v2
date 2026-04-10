
"use client";

import React from "react";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { BorderRadiusPicker } from "../BorderRadiusPicker";
import { SpacingPicker } from "../SpacingPicker";
import { ShadowPicker } from "../ShadowPicker";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function PizzaSettingsPanel() {
  const { selectedSlotIds } = useUIStore();
  const { getActivePages, updateSlotModuleData } = useCatalogStore();

  const slotId = selectedSlotIds[0];
  let instanceData: any = null;
  let pageNumber: number | null = null;

  if (slotId) {
    const pages = getActivePages();
    for (const page of pages) {
      const slot = page.slots.find((s) => s.id === slotId);
      if (slot && slot.role === 'free' && slot.moduleData?.type === 'pizza') {
        instanceData = slot.moduleData;
        pageNumber = page.pageNumber;
        break;
      }
    }
  }

  if (!instanceData) return <div className="p-4 text-xs text-slate-500">Lütfen bir pizza modülü seçin.</div>;

  const { colors, fonts, radiuses, spacings, shadows, tableLineWidth } = instanceData;

  const updateColor = (key: string, c: string, o: number) => {
    if (pageNumber && slotId) {
      updateSlotModuleData(pageNumber, slotId, { colors: { [key]: { c, o } } });
    }
  };

  const updateFont = (key: string, val: any) => {
    if (pageNumber && slotId) {
      updateSlotModuleData(pageNumber, slotId, { fonts: { [key]: val } });
    }
  };

  const updateRadius = (key: string, val: any) => {
    if (pageNumber && slotId) {
      updateSlotModuleData(pageNumber, slotId, { radiuses: { [key]: val } });
    }
  };

  const updateSpacing = (key: string, val: any) => {
    if (pageNumber && slotId) {
      updateSlotModuleData(pageNumber, slotId, { spacings: { [key]: val } });
    }
  };

  const updateShadow = (key: string, val: any) => {
    if (pageNumber && slotId) {
      updateSlotModuleData(pageNumber, slotId, { shadows: { [key]: val } });
    }
  };

  const updateTableLineWidth = (val: number) => {
    if (pageNumber && slotId) {
      updateSlotModuleData(pageNumber, slotId, { tableLineWidth: val });
    }
  };

  return (
    <Accordion className="w-full">
      <AccordionItem value="zemin">
        <AccordionTrigger>Zemin Ayarları (Genel)</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tablo">
        <AccordionTrigger>Tablo Ayarları</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="resim">
        <AccordionTrigger>Resim Alanı Ayarları</AccordionTrigger>
        <AccordionContent>
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
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="font">
        <AccordionTrigger>Font Ayarları</AccordionTrigger>
        <AccordionContent>
          <div className="p-2 border-t border-slate-200 bg-slate-50 relative">
            <TypographyPicker title="Ana Başlık" value={fonts.title} onChange={(val) => updateFont("title", val)} />
            <TypographyPicker title="Tablo Başlığı" value={fonts.tableTitle} onChange={(val) => updateFont("tableTitle", val)} />
            <TypographyPicker title="Ölçüler" value={fonts.sizes} onChange={(val) => updateFont("sizes", val)} />
            <TypographyPicker title="Fiyatlar" value={fonts.prices} onChange={(val) => updateFont("prices", val)} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
