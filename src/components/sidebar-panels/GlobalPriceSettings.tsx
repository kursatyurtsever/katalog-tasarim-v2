
"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { BorderRadiusPicker } from "../BorderRadiusPicker";

export function GlobalPriceSettings() {
  const { globalSettings, setGlobalSettings } = useCatalogStore();

  return (
    <div className="space-y-4">
      
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm relative z-[40]">
        <span className="text-[10px] font-bold text-slate-500 block mb-2">Fiyat Kutusu Konumu</span>
        <div className="flex bg-slate-50 rounded p-1 gap-1 border border-slate-100">
          {["left", "center", "right"].map((pos) => (
            <button 
              key={pos} 
              onClick={() => setGlobalSettings({ pricePosition: pos as any })} 
              className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${globalSettings.pricePosition === pos ? "bg-white shadow border border-slate-200 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              {pos === "left" ? "Sol" : pos === "center" ? "Orta" : "Sağ"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm relative z-[35]">
        <h4 className="text-[10px] font-black text-slate-500 border-b border-slate-100 pb-1 mb-2">Boyut Ayarları</h4>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-medium text-slate-500 w-16">Genişlik</span>
          <input type="range" min="10" max="100" value={globalSettings.priceWidth} onChange={(e) => setGlobalSettings({ priceWidth: parseInt(e.target.value) })} className="flex-1 accent-blue-600" />
          <div className="flex items-center gap-1">
            <input type="number" value={globalSettings.priceWidth} onChange={(e) => setGlobalSettings({ priceWidth: parseInt(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
            <span className="text-[9px] text-slate-400">%</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[9px] font-medium text-slate-500 w-16">Yükseklik</span>
          <input type="range" min="5" max="30" value={globalSettings.priceHeight} onChange={(e) => setGlobalSettings({ priceHeight: parseInt(e.target.value) })} className="flex-1 accent-blue-600" />
          <div className="flex items-center gap-1">
            <input type="number" value={globalSettings.priceHeight} onChange={(e) => setGlobalSettings({ priceHeight: parseInt(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
            <span className="text-[9px] text-slate-400">mm</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm relative z-[30]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600">Fiyat Kutusu Zemin Rengi</span>
          <ColorOpacityPicker color={globalSettings.colors.priceBg.c} opacity={globalSettings.colors.priceBg.o} onChange={(c, o) => setGlobalSettings({ colors: { ...globalSettings.colors, priceBg: { c, o } } })} />
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm relative z-[28] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600">Fiyat Zemin Konturu (Kenarlık)</span>
          <ColorOpacityPicker 
            type="border"
            color={globalSettings.colors.priceBorder?.c || "#ffffff"} 
            opacity={globalSettings.colors.priceBorder?.o ?? 100} 
            thickness={globalSettings.priceBorderWidth ?? 0}
            onChange={(c, o) => setGlobalSettings({ colors: { ...globalSettings.colors, priceBorder: { c, o } } })} 
            onThicknessChange={(thickness) => setGlobalSettings({ priceBorderWidth: thickness })}
          />
        </div>
      </div>
      
      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm relative z-[20]">
        <BorderRadiusPicker title="Fiyat Kutusu Ovalliği" value={globalSettings.radiuses.price} onChange={(val) => setGlobalSettings({ radiuses: { ...globalSettings.radiuses, price: val } })} />
      </div>
      
      <div className="bg-white p-2 rounded border border-slate-200 shadow-sm relative z-[10]">
        <TypographyPicker title="Fiyat Yazı Fontu" value={globalSettings.fonts.price} onChange={(val) => setGlobalSettings({ fonts: { ...globalSettings.fonts, price: val } })} />
      </div>

    </div>
  );
}
