"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { BorderRadiusPicker } from "../BorderRadiusPicker";
import { SpacingPicker } from "../SpacingPicker";
import { ShadowPicker } from "../ShadowPicker";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export function GlobalCellSettings({ isOpen, onToggle }: Props) {
  const { globalSettings, setGlobalSettings } = useCatalogStore();

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-sm mb-4 relative z-50">
      <button onClick={onToggle} className={`w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors ${isOpen ? "rounded-t-md" : "rounded-md"}`}>
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Global Hücre Ayarları</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
          
          <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded border border-slate-200 shadow-sm relative z-[60]">
            <span className="text-[10px] font-bold text-slate-600 w-24">Hücreler Arası Boşluk</span>
            <input type="range" min="0" max="10" step="0.5" value={globalSettings.gridGap} onChange={(e) => setGlobalSettings({ gridGap: parseFloat(e.target.value) })} className="flex-1 accent-blue-600" />
            <div className="flex items-center gap-1">
              <input type="number" value={globalSettings.gridGap} onChange={(e) => setGlobalSettings({ gridGap: parseFloat(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
              <span className="text-[9px] text-slate-400">mm</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-3 relative z-[50]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600">Hücre Zemin Rengi</span>
              <ColorOpacityPicker color={globalSettings.colors.cellBg.c} opacity={globalSettings.colors.cellBg.o} onChange={(c, o) => setGlobalSettings({ colors: { ...globalSettings.colors, cellBg: { c, o } } })} />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-600">Kenarlık Rengi</span>
              <ColorOpacityPicker color={globalSettings.colors.cellBorder.c} opacity={globalSettings.colors.cellBorder.o} onChange={(c, o) => setGlobalSettings({ colors: { ...globalSettings.colors, cellBorder: { c, o } } })} />
            </div>
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <span className="text-[9px] font-medium text-slate-500 w-16">Kenarlık Kalınlığı</span>
              <input type="range" min="0" max="10" step="0.5" value={globalSettings.borderWidth} onChange={(e) => setGlobalSettings({ borderWidth: parseFloat(e.target.value) })} className="flex-1 accent-blue-600" />
              <div className="flex items-center gap-1">
                <input type="number" value={globalSettings.borderWidth} onChange={(e) => setGlobalSettings({ borderWidth: parseFloat(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
                <span className="text-[9px] text-slate-400">px</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm relative z-[40]">
                <BorderRadiusPicker title="Hücre Köşe Ovalliği" value={globalSettings.radiuses.cell} onChange={(val) => setGlobalSettings({ radiuses: { ...globalSettings.radiuses, cell: val } })} />
          </div>

          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-3 relative z-[35]">
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 shadow-inner">
              <span className="text-[10px] font-bold text-slate-700">Ürün Görseli: Serbest Konum</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={globalSettings.imageEditMode || false} onChange={(e) => setGlobalSettings({ imageEditMode: e.target.checked })} />
                <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
              </label>
            </div>

            <div className={`space-y-3 transition-all duration-300 ${globalSettings.imageEditMode ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-medium text-slate-500 w-16">Büyütme</span>
                <input type="range" min="50" max="300" value={globalSettings.imageScale || 100} onChange={(e) => setGlobalSettings({ imageScale: parseInt(e.target.value) })} className="flex-1 accent-blue-600" />
                <div className="flex items-center gap-1">
                  <input type="number" value={globalSettings.imageScale || 100} onChange={(e) => setGlobalSettings({ imageScale: parseInt(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
                  <span className="text-[9px] text-slate-400">%</span>
                </div>
              </div>

              <button onClick={() => setGlobalSettings({ imageScale: 100, imagePosX: 0, imagePosY: 0 })} className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold rounded border border-slate-200 transition-colors">
                Konumu ve Boyutu Sıfırla
              </button>
            </div>
          </div>

          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm relative z-[30]">
            <SpacingPicker title="Hücre İç Boşluğu" value={globalSettings.spacings.cell} onChange={(val) => setGlobalSettings({ spacings: { ...globalSettings.spacings, cell: val } })} />
          </div>

          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm relative z-[20]">
            <ShadowPicker title="Hücre Gölgesi" value={globalSettings.shadows.cell} onChange={(val) => setGlobalSettings({ shadows: { ...globalSettings.shadows, cell: val } })} />
          </div>

          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm relative z-[10]">
            <TypographyPicker title="Ürün İsmi Fontu" value={globalSettings.fonts.productName} onChange={(val) => setGlobalSettings({ fonts: { ...globalSettings.fonts, productName: val } })} />
          </div>

        </div>
      )}
    </div>
  );
}