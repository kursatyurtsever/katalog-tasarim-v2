"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { BorderRadiusPicker } from "../BorderRadiusPicker";
import { SpacingPicker } from "../SpacingPicker";
import { ShadowPicker } from "../ShadowPicker";

interface Props { isOpen: boolean; onToggle: () => void; }

export function CustomCellSettings({ isOpen, onToggle }: Props) {
  const { pages, globalSettings, selectedSlotIds, toggleSlotCustomSettings, updateSlotCustomSettings } = useCatalogStore();

  let globalNumberCounter = 0;
  let selectedGlobalNumber: number | null = null;
  let selectedSlot: any = null;
  
  pages.forEach(p => {
    let startIdx = p.pageNumber === 1 ? 4 : p.pageNumber === 6 ? 8 : 0;
    p.slots.forEach((s, idx) => {
      if (idx >= startIdx && !s.hidden) {
        globalNumberCounter++;
        if (selectedSlotIds.length === 1 && s.id === selectedSlotIds[0]) {
          selectedGlobalNumber = globalNumberCounter;
          selectedSlot = s;
        }
      }
    });
  });

  const isCustomActive = selectedSlot?.isCustom || false;
  const customSettings = selectedSlot?.customSettings || globalSettings;

  return (
    <div className="bg-white rounded-md border border-purple-200 shadow-sm mb-20 relative z-30">
      <button onClick={onToggle} className={`w-full flex items-center justify-between p-3 bg-purple-700 hover:bg-purple-600 transition-colors ${isOpen ? "rounded-t-md" : "rounded-md"}`}>
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Özel Hücre Ayarları</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-purple-50 border-t border-purple-200 space-y-4">
          {selectedSlotIds.length !== 1 ? (
            <div className="text-[10px] text-center text-slate-500 font-bold p-4 bg-white rounded border border-slate-200 shadow-sm">
              Lütfen tablodan sadece BİR adet hücre seçin.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-600">Seçili Hücre: #{selectedGlobalNumber}</span>
              </div>
              <div className="flex items-center justify-between bg-white p-2.5 rounded border border-purple-300 shadow-sm">
                <span className="text-[10px] font-black text-purple-700">Bu Hücreyi Özelleştir</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isCustomActive} onChange={(e) => toggleSlotCustomSettings(e.target.checked)} />
                  <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
                </label>
              </div>

              <div className={`space-y-4 transition-all duration-300 ${isCustomActive ? "opacity-100" : "opacity-30 pointer-events-none blur-[1px]"}`}>
                
                <div className="bg-white p-3 rounded border border-purple-200 shadow-sm space-y-3 relative z-[60]">
                  <h4 className="text-[10px] font-black text-purple-600 border-b border-purple-100 pb-1">Zemin & Kenarlık</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
                    <ColorOpacityPicker color={customSettings.colors?.cellBg?.c || "#fff"} opacity={customSettings.colors?.cellBg?.o || 100} onChange={(c, o) => updateSlotCustomSettings({ colors: { cellBg: { c, o } } })} />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-purple-50">
                    <span className="text-[10px] font-bold text-slate-600">Kenarlık Rengi</span>
                    <ColorOpacityPicker color={customSettings.colors?.cellBorder?.c || "#000"} opacity={customSettings.colors?.cellBorder?.o || 100} onChange={(c, o) => updateSlotCustomSettings({ colors: { cellBorder: { c, o } } })} />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-50">
                    <span className="text-[9px] font-medium text-slate-500 w-16">Kalınlık</span>
                    <input type="range" min="0" max="10" step="0.5" value={customSettings.borderWidth || 0} onChange={(e) => updateSlotCustomSettings({ borderWidth: parseFloat(e.target.value) })} className="flex-1 accent-purple-600" />
                    <span className="text-[9px] font-bold text-slate-600 w-8 text-right">{customSettings.borderWidth}px</span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-purple-200 shadow-sm relative z-[50]">
                  <BorderRadiusPicker title="Hücre Köşe Ovalliği" value={customSettings.radiuses?.cell!} onChange={(val) => updateSlotCustomSettings({ radiuses: { cell: val } })} />
                </div>
                
                <div className="bg-white p-2 rounded border border-purple-200 shadow-sm relative z-[40]">
                  <SpacingPicker title="Hücre İç Boşluğu" value={customSettings.spacings?.cell!} onChange={(val) => updateSlotCustomSettings({ spacings: { cell: val } })} />
                </div>
                
                <div className="bg-white p-2 rounded border border-purple-200 shadow-sm relative z-[30]">
                  <ShadowPicker title="Hücre Gölgesi" value={customSettings.shadows?.cell!} onChange={(val) => updateSlotCustomSettings({ shadows: { cell: val } })} />
                </div>
                
                <div className="bg-white p-2 rounded border border-purple-200 shadow-sm relative z-[20]">
                  <TypographyPicker title="Ürün İsmi Fontu" value={customSettings.fonts?.productName!} onChange={(val) => updateSlotCustomSettings({ fonts: { productName: val } })} />
                </div>

                <div className="bg-white p-3 rounded border border-orange-200 shadow-sm space-y-3 mt-4 relative z-[15]">
                  <h4 className="text-[10px] font-black text-orange-600 border-b border-orange-100 pb-1">Fiyat Kutusu (Özel)</h4>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 block">Fiyat Kutusu Konumu</span>
                    <div className="flex bg-slate-50 rounded p-1 gap-1 border border-slate-100">
                      {['left', 'center', 'right'].map((pos) => (
                        <button 
                          key={pos} 
                          onClick={() => updateSlotCustomSettings({ pricePosition: pos as any })} 
                          className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${customSettings.pricePosition === pos ? 'bg-white shadow border border-slate-200 text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {pos === 'left' ? 'Sol' : pos === 'center' ? 'Orta' : 'Sağ'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-orange-50">
                    <span className="text-[9px] font-medium text-slate-500 w-16">Genişlik</span>
                    <input type="range" min="10" max="100" value={customSettings.priceWidth || 50} onChange={(e) => updateSlotCustomSettings({ priceWidth: parseInt(e.target.value) })} className="flex-1 accent-orange-600" />
                    <span className="text-[9px] font-bold text-slate-600 w-8 text-right">%{customSettings.priceWidth || 50}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[9px] font-medium text-slate-500 w-16">Yükseklik</span>
                    <input type="range" min="5" max="30" value={customSettings.priceHeight || 10} onChange={(e) => updateSlotCustomSettings({ priceHeight: parseInt(e.target.value) })} className="flex-1 accent-orange-600" />
                    <span className="text-[9px] font-bold text-slate-600 w-8 text-right">{customSettings.priceHeight || 10}mm</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-orange-50">
                    <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
                    <ColorOpacityPicker color={customSettings.colors?.priceBg?.c || "#e60000"} opacity={customSettings.colors?.priceBg?.o || 100} onChange={(c, o) => updateSlotCustomSettings({ colors: { priceBg: { c, o } } })} />
                  </div>
                </div>

                <div className="bg-white p-3 rounded border border-blue-200 shadow-sm space-y-3 mt-4 relative z-[12]">
                  <h4 className="text-[10px] font-black text-blue-600 border-b border-blue-100 pb-1">Resim Ayarları</h4>

                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 shadow-inner">
                    <span className="text-[10px] font-bold text-slate-700">Serbest Konum</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={customSettings.imageEditMode || false} onChange={(e) => updateSlotCustomSettings({ imageEditMode: e.target.checked })} />
                      <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    </label>
                  </div>

                  <div className={`space-y-3 transition-all duration-300 ${customSettings.imageEditMode ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-medium text-slate-500 w-16">Büyütme</span>
                      <input type="range" min="50" max="300" value={customSettings.imageScale || 100} onChange={(e) => updateSlotCustomSettings({ imageScale: parseInt(e.target.value) })} className="flex-1 accent-blue-600" />
                      <span className="text-[9px] font-bold text-blue-600 w-8 text-right">%{customSettings.imageScale || 100}</span>
                    </div>

                    <button onClick={() => updateSlotCustomSettings({ imageScale: 100, imagePosX: 0, imagePosY: 0 })} className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold rounded border border-slate-200 transition-colors">
                      Konumu ve Boyutu Sıfırla
                    </button>
                    <p className="text-[8px] text-slate-400 text-center leading-tight">Serbest Konum açıkken hücredeki resmi farenizle sürükleyerek kaydırabilirsiniz.</p>
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-orange-200 shadow-sm relative z-[10]">
                  <BorderRadiusPicker title="Fiyat Kutusu Ovalliği" value={customSettings.radiuses?.price!} onChange={(val) => updateSlotCustomSettings({ radiuses: { price: val } })} />
                </div>

                <div className="bg-white p-2 rounded border border-orange-200 shadow-sm relative z-[5]">
                  <TypographyPicker title="Fiyat Fontu" value={customSettings.fonts?.price!} onChange={(val) => updateSlotCustomSettings({ fonts: { price: val } })} />
                </div>

              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}