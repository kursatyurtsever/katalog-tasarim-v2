"use client";
import { useState } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import { PageGridSettings } from "./PageGridSettings";

export function GlobalGridSettings() {
  const { globalSettings, updateGridSettings, applyGridChanges, formas, activeFormaId } = useCatalogStore();
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const activeForma = formas.find(f => f.id === activeFormaId);

  const handleApply = () => {
    if (window.confirm("DİKKAT: Izgara ayarlarını uygulamak, tüm sayfalardaki birleştirilmiş ve serbest alanları sıfırlayacak, ürünleri yeniden dizecektir. Bu işlem geri alınamaz. Onaylıyor musunuz?")) {
      applyGridChanges();
      setSelectedPage(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 tracking-widest">Varsayılan Ayarlar</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-bold text-slate-400">Satır</label>
<input 
              type="number" 
              min="1" max="10" 
              value={globalSettings.defaultGrid?.rows || 4}
              onChange={(e) => updateGridSettings("global", { ...(globalSettings.defaultGrid || {rows: 4, cols: 4}), rows: parseInt(e.target.value) || 1 })}
              className="w-full mt-1 text-sm font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400">Sütun</label>
            <input 
              type="number" 
              min="1" max="10"
              value={globalSettings.defaultGrid?.cols || 4}
              onChange={(e) => updateGridSettings("global", { ...(globalSettings.defaultGrid || {rows: 4, cols: 4}), cols: parseInt(e.target.value) || 1 })}
              className="w-full mt-1 text-sm font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 tracking-widest">Sayfa Bazlı Özelleştirme</h4>
        <div className="flex flex-wrap gap-2">
          {activeForma?.pages.map(page => {
            const isCustom = !!page.gridSettings;
            const isSelected = selectedPage === page.pageNumber;
            return (
              <button
                key={page.pageNumber}
                onClick={() => setSelectedPage(isSelected ? null : page.pageNumber)}
                className={`relative min-w-9 h-9 rounded border text-xs font-black transition-all ${
                  isSelected ? "bg-blue-600 border-blue-600 text-white shadow-md z-10" :
                  isCustom ? "bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100" :
                  "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
                title={isCustom ? "Bu sayfa özel ayara sahip" : "Bu sayfa global ayarları kullanıyor"}
              >
                {page.pageNumber}
                {isCustom && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />}              </button>
            )
          })}
        </div>
        {selectedPage && <PageGridSettings pageNumber={selectedPage} onClose={() => setSelectedPage(null)} />}
      </div>
      
      <button 
        onClick={handleApply}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md shadow-md transition-all mt-2"
      >
        Tüm Ayarları Uygula
      </button>
    </div>
  );
}
