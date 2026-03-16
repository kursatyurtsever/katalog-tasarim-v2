"use client";

import { useCatalogStore } from "@/store/useCatalogStore";

interface Props { isOpen: boolean; onToggle: () => void; }

export function GlobalPriceSettings({ isOpen, onToggle }: Props) {
  const globalSettings = useCatalogStore((state) => state.globalSettings);
  const setGlobalSettings = useCatalogStore((state) => state.setGlobalSettings);

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden mb-4">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors">
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Global Fiyat Ayarları</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Kutu Kenarları (Radius)</h4>
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer bg-white p-2 rounded border border-slate-200">
              <input type="checkbox" checked={globalSettings.linkPriceRadius} onChange={(e) => setGlobalSettings({ linkPriceRadius: e.target.checked })} className="accent-blue-600" />
              Köşeleri Birlikte Değiştir
            </label>
            {globalSettings.linkPriceRadius ? (
              <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] font-medium text-slate-500 w-16">Yarıçap</span>
                <input type="range" min="0" max="30" value={globalSettings.priceRadiusTL} onChange={(e) => { const v = parseInt(e.target.value); setGlobalSettings({ priceRadiusTL: v, priceRadiusTR: v, priceRadiusBR: v, priceRadiusBL: v }); }} className="flex-1" />
                <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.priceRadiusTL}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 bg-white p-2 rounded border border-slate-200">
                {['TL', 'TR', 'BL', 'BR'].map((pos) => (
                  <div key={pos} className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-medium text-slate-400 w-4">{pos}</span>
                    <input type="range" min="0" max="30" value={(globalSettings as any)[`priceRadius${pos}`]} onChange={(e) => setGlobalSettings({ [`priceRadius${pos}`]: parseInt(e.target.value) })} className="flex-1" />
                    <span className="text-[9px] font-bold text-slate-600 w-5 text-right">{Math.floor((globalSettings as any)[`priceRadius${pos}`])}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Tipografi ve Boyut</h4>
            <div className="grid grid-cols-2 gap-3 bg-white p-2 rounded border border-slate-200">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Font</span>
                <select value={globalSettings.priceFontFamily} onChange={(e) => setGlobalSettings({ priceFontFamily: e.target.value })} className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none focus:border-blue-500">
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Kalınlık</span>
                <select value={globalSettings.priceFontWeight} onChange={(e) => setGlobalSettings({ priceFontWeight: e.target.value })} className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none focus:border-blue-500">
                  <option value="400">Normal</option><option value="700">Bold</option><option value="900">Black</option>
                </select>
              </div>
            </div>
            <div className="space-y-3 bg-white p-2 rounded border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-700 w-24">Ana Fiyat Boyutu</span>
                <input type="range" min="10" max="40" value={globalSettings.priceFontSize} onChange={(e) => setGlobalSettings({ priceFontSize: parseInt(e.target.value) })} className="flex-1" />
                <span className="text-[10px] font-black text-blue-600 w-6 text-right">{globalSettings.priceFontSize}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-700 w-24">Küsurat Boyutu</span>
                <input type="range" min="8" max="30" value={globalSettings.priceDecimalSize} onChange={(e) => setGlobalSettings({ priceDecimalSize: parseInt(e.target.value) })} className="flex-1" />
                <span className="text-[10px] font-black text-orange-500 w-6 text-right">{globalSettings.priceDecimalSize}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-slate-500 w-20">Harf Aralığı</span>
                <input type="range" min="-5" max="10" step="0.5" value={globalSettings.priceLetterSpacing} onChange={(e) => setGlobalSettings({ priceLetterSpacing: parseFloat(e.target.value) })} className="flex-1" />
                <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.priceLetterSpacing}</span>
              </div>
            </div>
          </div>
          {/* ... Diğer hizalama ve renk ayarları aynı şekilde devam ediyor ... */}
          <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border border-slate-200 space-y-2 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-slate-500 block">Yatay Hizalama</span>
                <div className="flex flex-col bg-slate-50 rounded p-1 gap-1 border border-slate-100 flex-1">
                  {['left', 'center', 'right', 'justify'].map((align) => (
                    <button key={align} onClick={() => setGlobalSettings({ priceTextAlign: align as any })} className={`w-full py-1 text-[9px] font-bold rounded transition-all ${globalSettings.priceTextAlign === align ? 'bg-white shadow border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{align === 'left' ? 'Sol' : align === 'center' ? 'Orta' : align === 'right' ? 'Sağ' : 'Yasla'}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 space-y-2 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-slate-500 block">Dikey Hizalama</span>
                <div className="flex flex-col bg-slate-50 rounded p-1 gap-1 border border-slate-100 flex-1">
                  {['top', 'middle', 'bottom'].map((val) => (
                    <button key={val} onClick={() => setGlobalSettings({ priceTextVerticalAlign: val as any })} className={`w-full py-1 text-[9px] font-bold rounded transition-all ${globalSettings.priceTextVerticalAlign === val ? 'bg-white shadow border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{val === 'top' ? 'Üst' : val === 'middle' ? 'Orta' : 'Alt'}</button>
                  ))}
                </div>
              </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Renkler</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-2 border border-slate-200 rounded flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500">Zemin Rengi</span>
                <input type="color" value={globalSettings.priceBgColor} onChange={(e) => setGlobalSettings({ priceBgColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0 p-0 shadow-sm" />
              </div>
              <div className="bg-white p-2 border border-slate-200 rounded flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500">Yazı Rengi</span>
                <input type="color" value={globalSettings.priceFontColor} onChange={(e) => setGlobalSettings({ priceFontColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0 p-0 shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}