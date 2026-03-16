"use client";

import { useCatalogStore } from "@/store/useCatalogStore";

interface Props { isOpen: boolean; onToggle: () => void; }

export function CustomCellSettings({ isOpen, onToggle }: Props) {
  const pages = useCatalogStore((state) => state.pages);
  const globalSettings = useCatalogStore((state) => state.globalSettings);
  const selectedSlotIds = useCatalogStore((state) => state.selectedSlotIds);
  const toggleSlotCustomSettings = useCatalogStore((state) => state.toggleSlotCustomSettings);
  const updateSlotCustomSettings = useCatalogStore((state) => state.updateSlotCustomSettings);

  let globalNumberCounter = 0;
  let selectedGlobalNumber: number | null = null;
  let selectedSlot: any = null;
  pages.forEach(p => {
    let startIdx = 0;
    if (p.pageNumber === 1) startIdx = 4;
    if (p.pageNumber === 6) startIdx = 8;
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
    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden mb-20">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 bg-purple-700 hover:bg-purple-600 transition-colors">
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Özel Hücre Ayarları</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-purple-50 border-t border-purple-200 space-y-4">
          {selectedSlotIds.length !== 1 ? (
            <div className="text-[10px] text-center text-slate-500 font-bold p-4 bg-white rounded border border-slate-200">Lütfen sadece BİR adet hücre seçin.</div>
          ) : (
            <>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-600">Seçili Hücre: #{selectedGlobalNumber}</span>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-purple-300 shadow-sm">
                <span className="text-[10px] font-black text-purple-700">Ayarları Özelleştir</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isCustomActive} onChange={(e) => toggleSlotCustomSettings(e.target.checked)} />
                  <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
                </label>
              </div>

              <div className={`space-y-6 transition-all duration-300 ${isCustomActive ? "opacity-100" : "opacity-30 pointer-events-none blur-[1px]"}`}>
                <div className="space-y-3 bg-white p-3 rounded border border-purple-200">
                  <h4 className="text-[10px] font-black text-purple-600 border-b border-purple-100 pb-1">Kenar</h4>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={customSettings.linkRadius} onChange={(e) => updateSlotCustomSettings({ linkRadius: e.target.checked })} className="accent-purple-600" /> Köşeleri Birleştir
                  </label>
                  {customSettings.linkRadius ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-slate-500 w-16">Yarıçap</span>
                      <input type="range" min="0" max="50" value={customSettings.radiusTL} onChange={(e) => { const v = parseInt(e.target.value); updateSlotCustomSettings({ radiusTL: v, radiusTR: v, radiusBR: v, radiusBL: v }); }} className="flex-1" />
                      <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{customSettings.radiusTL}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {['TL', 'TR', 'BL', 'BR'].map((pos) => (
                        <div key={pos} className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-medium text-slate-400 w-4">{pos}</span>
                          <input type="range" min="0" max="50" value={(customSettings as any)[`radius${pos}`]} onChange={(e) => updateSlotCustomSettings({ [`radius${pos}`]: parseInt(e.target.value) })} className="flex-1" />
                          <span className="text-[9px] font-bold text-slate-600 w-5 text-right">{Math.floor((customSettings as any)[`radius${pos}`])}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 bg-white p-3 rounded border border-purple-200">
                  <h4 className="text-[10px] font-black text-purple-600 border-b border-purple-100 pb-1">Tipografi</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-slate-500">Font</span>
                      <select value={customSettings.fontFamily} onChange={(e) => updateSlotCustomSettings({ fontFamily: e.target.value })} className="text-[10px] p-1.5 border border-purple-200 rounded bg-purple-50"><option value="Inter, sans-serif">Inter</option><option value="Roboto, sans-serif">Roboto</option><option value="Arial, sans-serif">Arial</option></select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-slate-500">Kalınlık</span>
                      <select value={customSettings.fontWeight} onChange={(e) => updateSlotCustomSettings({ fontWeight: e.target.value })} className="text-[10px] p-1.5 border border-purple-200 rounded bg-purple-50"><option value="400">Normal</option><option value="700">Bold</option><option value="900">Black</option></select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-slate-500 w-20">Punto</span>
                    <input type="range" min="8" max="32" value={customSettings.fontSize} onChange={(e) => updateSlotCustomSettings({ fontSize: parseInt(e.target.value) })} className="flex-1" />
                    <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{customSettings.fontSize}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-slate-500 w-20">Harf Aralığı</span>
                    <input type="range" min="-5" max="10" step="0.5" value={customSettings.letterSpacing} onChange={(e) => updateSlotCustomSettings({ letterSpacing: parseFloat(e.target.value) })} className="flex-1" />
                    <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{customSettings.letterSpacing}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-slate-500 w-20">Satır Aralığı</span>
                    <input type="range" min="0.8" max="2.0" step="0.1" value={customSettings.lineHeight} onChange={(e) => updateSlotCustomSettings({ lineHeight: parseFloat(e.target.value) })} className="flex-1" />
                    <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{customSettings.lineHeight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">Yazı Rengi</span>
                    <input type="color" value={customSettings.fontColor} onChange={(e) => updateSlotCustomSettings({ fontColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-500">Yatay</span>
                      <select value={customSettings.textAlign} onChange={(e) => updateSlotCustomSettings({ textAlign: e.target.value as any })} className="text-[9px] p-1 border border-purple-200 rounded"><option value="left">Sol</option><option value="center">Orta</option><option value="right">Sağ</option></select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-500">Dikey</span>
                      <select value={customSettings.textVerticalAlign} onChange={(e) => updateSlotCustomSettings({ textVerticalAlign: e.target.value as any })} className="text-[9px] p-1 border border-purple-200 rounded"><option value="top">Üst</option><option value="middle">Orta</option><option value="bottom">Alt</option></select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-white p-3 rounded border border-purple-200">
                  <h4 className="text-[10px] font-black text-purple-600 border-b border-purple-100 pb-1">Görünüm</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">Dolgu (Zemin)</span>
                    <input type="color" value={customSettings.bgColor} onChange={(e) => updateSlotCustomSettings({ bgColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-medium text-slate-400 w-16">Saydamlık</span>
                    <input type="range" min="0" max="100" value={customSettings.bgOpacity} onChange={(e) => updateSlotCustomSettings({ bgOpacity: parseInt(e.target.value) })} className="flex-1" />
                    <span className="text-[9px] font-bold text-slate-600 w-8 text-right">%{customSettings.bgOpacity}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-purple-50 pt-2">
                    <span className="text-[10px] font-bold text-slate-600">Kontur Rengi</span>
                    <input type="color" value={customSettings.borderColor} onChange={(e) => updateSlotCustomSettings({ borderColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-medium text-slate-400 w-16">Kalınlık</span>
                    <input type="range" min="0" max="10" step="0.5" value={customSettings.borderWidth} onChange={(e) => updateSlotCustomSettings({ borderWidth: parseFloat(e.target.value) })} className="flex-1" />
                    <span className="text-[9px] font-bold text-slate-600 w-8 text-right">{customSettings.borderWidth}px</span>
                  </div>
                </div>

                <div className="space-y-3 bg-white p-3 rounded border border-purple-200">
                  <h4 className="text-[10px] font-black text-purple-600 border-b border-purple-100 pb-1">Fiyat Kutusu</h4>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={customSettings.linkPriceRadius} onChange={(e) => updateSlotCustomSettings({ linkPriceRadius: e.target.checked })} className="accent-purple-600" /> Köşeleri Birleştir
                  </label>
                  {customSettings.linkPriceRadius ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-slate-500 w-16">Yarıçap</span>
                      <input type="range" min="0" max="30" value={customSettings.priceRadiusTL} onChange={(e) => { const v = parseInt(e.target.value); updateSlotCustomSettings({ priceRadiusTL: v, priceRadiusTR: v, priceRadiusBR: v, priceRadiusBL: v }); }} className="flex-1" />
                      <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{customSettings.priceRadiusTL}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {['TL', 'TR', 'BL', 'BR'].map((pos) => (
                        <div key={pos} className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-medium text-slate-400 w-4">{pos}</span>
                          <input type="range" min="0" max="30" value={(customSettings as any)[`priceRadius${pos}`]} onChange={(e) => updateSlotCustomSettings({ [`priceRadius${pos}`]: parseInt(e.target.value) })} className="flex-1" />
                          <span className="text-[9px] font-bold text-slate-600 w-5 text-right">{Math.floor((customSettings as any)[`priceRadius${pos}`])}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 border-t border-purple-50 pt-2">
                    <span className="text-[10px] font-bold text-slate-700 w-24">Ana Fiyat</span>
                    <input type="range" min="10" max="40" value={customSettings.priceFontSize} onChange={(e) => updateSlotCustomSettings({ priceFontSize: parseInt(e.target.value) })} className="flex-1" />
                    <span className="text-[10px] font-black text-purple-600 w-6 text-right">{customSettings.priceFontSize}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex flex-col items-center gap-1 border border-slate-100 p-1 rounded">
                      <span className="text-[9px] font-bold text-slate-500">Zemin</span>
                      <input type="color" value={customSettings.priceBgColor} onChange={(e) => updateSlotCustomSettings({ priceBgColor: e.target.value })} className="w-full h-6 rounded border-0 p-0" />
                    </div>
                    <div className="flex flex-col items-center gap-1 border border-slate-100 p-1 rounded">
                      <span className="text-[9px] font-bold text-slate-500">Yazı</span>
                      <input type="color" value={customSettings.priceFontColor} onChange={(e) => updateSlotCustomSettings({ priceFontColor: e.target.value })} className="w-full h-6 rounded border-0 p-0" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}