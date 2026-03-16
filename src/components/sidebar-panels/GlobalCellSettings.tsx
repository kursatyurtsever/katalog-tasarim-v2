"use client";

import { useCatalogStore } from "@/store/useCatalogStore";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export function GlobalCellSettings({ isOpen, onToggle }: Props) {
  const globalSettings = useCatalogStore((state) => state.globalSettings);
  const setGlobalSettings = useCatalogStore((state) => state.setGlobalSettings);

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden mb-4">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors">
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Global Hücre Ayarları</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-6">
          {/* --- GLOBAL 1. KENAR VE BOŞLUK --- */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Kenar ve Boşluk</h4>
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer bg-white p-2 rounded border border-slate-200">
              <input type="checkbox" checked={globalSettings.linkRadius} onChange={(e) => setGlobalSettings({ linkRadius: e.target.checked })} className="accent-blue-600" />
              Köşeleri Birlikte Değiştir
            </label>
            {globalSettings.linkRadius ? (
              <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] font-medium text-slate-500 w-16">Yarıçap</span>
                <input type="range" min="0" max="50" value={globalSettings.radiusTL} onChange={(e) => { const v = parseInt(e.target.value); setGlobalSettings({ radiusTL: v, radiusTR: v, radiusBR: v, radiusBL: v }); }} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.radiusTL}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 bg-white p-2 rounded border border-slate-200">
                {['TL', 'TR', 'BL', 'BR'].map((pos) => (
                  <div key={pos} className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-medium text-slate-400 w-4">{pos}</span>
                    <input type="range" min="0" max="50" value={(globalSettings as any)[`radius${pos}`]} onChange={(e) => setGlobalSettings({ [`radius${pos}`]: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 w-24">Hücre Boşluğu</span>
              <input type="range" min="0" max="10" step="0.5" value={globalSettings.gridGap} onChange={(e) => setGlobalSettings({ gridGap: parseFloat(e.target.value) })} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              <span className="text-[10px] font-black text-blue-600 w-8 text-right">{globalSettings.gridGap}mm</span>
            </div>
          </div>

          {/* --- GLOBAL 2. TİPOGRAFİ --- */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Tipografi (Ürün İsmi)</h4>
            <div className="grid grid-cols-2 gap-3 bg-white p-2 rounded border border-slate-200">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Font Ailesi</span>
                <select value={globalSettings.fontFamily} onChange={(e) => setGlobalSettings({ fontFamily: e.target.value })} className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none focus:border-blue-500">
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Kalınlık</span>
                <select value={globalSettings.fontWeight} onChange={(e) => setGlobalSettings({ fontWeight: e.target.value })} className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none focus:border-blue-500">
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi Bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
            </div>
            <div className="space-y-3 bg-white p-2 rounded border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-slate-500 w-20">Punto (Size)</span>
                <input type="range" min="8" max="32" value={globalSettings.fontSize} onChange={(e) => setGlobalSettings({ fontSize: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.fontSize}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-slate-500 w-20">Harf Aralığı (VA)</span>
                <input type="range" min="-5" max="10" step="0.5" value={globalSettings.letterSpacing} onChange={(e) => setGlobalSettings({ letterSpacing: parseFloat(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.letterSpacing}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-slate-500 w-20">Satır Aralığı</span>
                <input type="range" min="0.8" max="2.0" step="0.1" value={globalSettings.lineHeight} onChange={(e) => setGlobalSettings({ lineHeight: parseFloat(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.lineHeight}</span>
              </div>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600">Yazı Rengi</span>
              <input type="color" value={globalSettings.fontColor} onChange={(e) => setGlobalSettings({ fontColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border border-slate-200 space-y-2 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-slate-500 block">Yatay Hizalama</span>
                <div className="flex flex-col bg-slate-50 rounded p-1 gap-1 border border-slate-100 flex-1">
                  {['left', 'center', 'right', 'justify'].map((align) => (
                    <button key={align} onClick={() => setGlobalSettings({ textAlign: align as any })} className={`w-full py-1 text-[9px] font-bold rounded transition-all ${globalSettings.textAlign === align ? 'bg-white shadow border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{align === 'left' ? 'Sol' : align === 'center' ? 'Orta' : align === 'right' ? 'Sağ' : 'Yasla'}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 space-y-2 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-slate-500 block">Dikey Hizalama</span>
                <div className="flex flex-col bg-slate-50 rounded p-1 gap-1 border border-slate-100 flex-1">
                  {['top', 'middle', 'bottom'].map((val) => (
                    <button key={val} onClick={() => setGlobalSettings({ textVerticalAlign: val as any })} className={`w-full py-1 text-[9px] font-bold rounded transition-all ${globalSettings.textVerticalAlign === val ? 'bg-white shadow border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{val === 'top' ? 'Üst' : val === 'middle' ? 'Orta' : 'Alt'}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- GLOBAL 3. RENK VE GÖRÜNÜM --- */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Renk ve Görünüm</h4>
            <div className="bg-white p-2 border border-slate-200 rounded space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600">Dolgu Rengi (Zemin)</span>
                <input type="color" value={globalSettings.bgColor} onChange={(e) => setGlobalSettings({ bgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <span className="text-[9px] font-medium text-slate-400 w-16">Saydamlık</span>
                <input type="range" min="0" max="100" value={globalSettings.bgOpacity} onChange={(e) => setGlobalSettings({ bgOpacity: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <span className="text-[9px] font-bold text-slate-500 w-8 text-right">%{globalSettings.bgOpacity}</span>
              </div>
            </div>
            <div className="bg-white p-2 border border-slate-200 rounded space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600">Kontur Rengi</span>
                <input type="color" value={globalSettings.borderColor} onChange={(e) => setGlobalSettings({ borderColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <span className="text-[9px] font-medium text-slate-400 w-16">Saydamlık</span>
                <input type="range" min="0" max="100" value={globalSettings.borderOpacity} onChange={(e) => setGlobalSettings({ borderOpacity: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <span className="text-[9px] font-bold text-slate-500 w-8 text-right">%{globalSettings.borderOpacity}</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <span className="text-[9px] font-medium text-slate-400 w-16">Kalınlık</span>
                <input type="range" min="0" max="10" step="0.5" value={globalSettings.borderWidth} onChange={(e) => setGlobalSettings({ borderWidth: parseFloat(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <span className="text-[9px] font-bold text-slate-500 w-8 text-right">{globalSettings.borderWidth}px</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}