"use client";

import { useCatalogStore, Forma, CatalogPage } from "@/store/useCatalogStore";

interface Props {
  pageNumber: number;
  onClose: () => void;
}

export function PageGridSettings({ pageNumber, onClose }: Props) {
  const { formas, activeFormaId, globalSettings, updateGridSettings, revertToGlobalGrid, applyPageGridChange } = useCatalogStore();
  const activeForma = formas.find((f: Forma) => f.id === activeFormaId);
  const page = activeForma?.pages.find((p: CatalogPage) => p.pageNumber === pageNumber);
  const currentSettings = page?.gridSettings || globalSettings.defaultGrid;

  return (
    <div className="bg-slate-50 p-3 mt-3 rounded-md border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-center">
        <h5 className="text-xs font-black text-blue-600">SAYFA {pageNumber} AYARLARI</h5>
        <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-700">Kapat &times;</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-bold text-slate-400">Satır</label>
          <input 
            type="number" min="1" max="10"
            value={currentSettings.rows}
            onChange={(e) => updateGridSettings(pageNumber, { ...currentSettings, rows: parseInt(e.target.value) || 1 })}
            className="w-full mt-1 text-sm font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-slate-400">Sütun</label>
          <input 
            type="number" min="1" max="10"
            value={currentSettings.cols}
            onChange={(e) => updateGridSettings(pageNumber, { ...currentSettings, cols: parseInt(e.target.value) || 1 })}
            className="w-full mt-1 text-sm font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500"
          />
        </div>
      </div>
      
      <button 
        onClick={() => applyPageGridChange(pageNumber)}
        className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors mt-2 shadow-sm"
      >
        Sadece Bu Sayfaya Uygula
      </button>

      {page?.gridSettings && (
        <button 
          onClick={() => revertToGlobalGrid(pageNumber)}
          className="w-full py-2 bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold rounded-md hover:bg-orange-200 transition-colors mt-1"
        >
          Globale Geri Dön
        </button>
      )}
    </div>
  );
}
