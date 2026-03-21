"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { BorderRadiusPicker } from "../BorderRadiusPicker";

interface Props { isOpen: boolean; onToggle: () => void; }

export function GlobalPriceSettings({ isOpen, onToggle }: Props) {
  const { globalSettings, setGlobalSettings } = useCatalogStore();

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-sm mb-4 relative z-40">
      <button onClick={onToggle} className={`w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors ${isOpen ? "rounded-t-md" : "rounded-md"}`}>
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Global Fiyat Ayarları</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
          
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm relative z-[40]">
            <span className="text-[10px] font-bold text-slate-500 block mb-2">Fiyat Kutusu Konumu</span>
            <div className="flex bg-slate-50 rounded p-1 gap-1 border border-slate-100">
              {['left', 'center', 'right'].map((pos) => (
                <button 
                  key={pos} 
                  onClick={() => setGlobalSettings({ pricePosition: pos as any })} 
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${globalSettings.pricePosition === pos ? 'bg-white shadow border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {pos === 'left' ? 'Sol' : pos === 'center' ? 'Orta' : 'Sağ'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm relative z-[35]">
            <h4 className="text-[10px] font-black text-slate-500 border-b border-slate-100 pb-1 mb-2">Boyut Ayarları</h4>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-medium text-slate-500 w-16">Genişlik</span>
              <input type="range" min="10" max="100" value={globalSettings.priceWidth} onChange={(e) => setGlobalSettings({ priceWidth: parseInt(e.target.value) })} className="flex-1 accent-blue-600" />
              <span className="text-[9px] font-bold text-slate-600 w-8 text-right">%{globalSettings.priceWidth}</span>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[9px] font-medium text-slate-500 w-16">Yükseklik</span>
              <input type="range" min="5" max="30" value={globalSettings.priceHeight} onChange={(e) => setGlobalSettings({ priceHeight: parseInt(e.target.value) })} className="flex-1 accent-blue-600" />
              <span className="text-[9px] font-bold text-slate-600 w-8 text-right">{globalSettings.priceHeight}mm</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm relative z-[30]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600">Fiyat Kutusu Zemin Rengi</span>
              <ColorOpacityPicker color={globalSettings.colors.priceBg.c} opacity={globalSettings.colors.priceBg.o} onChange={(c, o) => setGlobalSettings({ colors: { ...globalSettings.colors, priceBg: { c, o } } })} />
            </div>
          </div>
          
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm relative z-[20]">
            <BorderRadiusPicker title="Fiyat Kutusu Ovalliği" value={globalSettings.radiuses.price} onChange={(val) => setGlobalSettings({ radiuses: { ...globalSettings.radiuses, price: val } })} />
          </div>
          
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm relative z-[10]">
            <TypographyPicker title="Fiyat Yazı Fontu" value={globalSettings.fonts.price} onChange={(val) => setGlobalSettings({ fonts: { ...globalSettings.fonts, price: val } })} />
          </div>

        </div>
      )}
    </div>
  );
}