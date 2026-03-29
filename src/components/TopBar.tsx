"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useEffect } from "react";
import { DownloadMenu } from "./DownloadMenu";

export function TopBar() {
  // Yeni Forma Yapısı State'leri
  const formas = useCatalogStore((state) => state.formas || []);
  const activeFormaId = useCatalogStore((state) => state.activeFormaId);
  const setActiveFormaId = useCatalogStore((state) => state.setActiveFormaId);

  // Zoom ve Yardımcı Fonksiyonlar
  const toggleZoom = useCatalogStore((state) => state.toggleZoom);
  const isZoomed = useCatalogStore((state) => state.isZoomed);
  
  // Geri - İleri (Undo/Redo)
  const undo = useCatalogStore((state) => state.undo);
  const redo = useCatalogStore((state) => state.redo);
  const pastPages = useCatalogStore((state) => state.pastPages || []);
  const futurePages = useCatalogStore((state) => state.futurePages || []);

  // Klavye Kısayolları (Ctrl+Z ve Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) { 
          e.preventDefault(); 
          redo(); 
        } else { 
          e.preventDefault(); 
          undo(); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm relative z-50">
      
      {/* SOL KISIM: FORMA SEÇİCİ (DROPDOWN) */}
      <div className="flex items-center gap-3">
        <label htmlFor="forma-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Görünüm:
        </label>
        <select
          id="forma-select"
          value={activeFormaId}
          onChange={(e) => setActiveFormaId(Number(e.target.value))}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-1.5 rounded-lg outline-none border-none shadow-md cursor-pointer hover:bg-slate-700 transition-all min-w-[180px]"
        >
          {formas.map((forma) => (
            <option key={forma.id} value={forma.id}>
              {forma.name}
            </option>
          ))}
        </select>
      </div>

      {/* SAĞ KISIM: ARAÇLAR */}
      <div className="flex items-center gap-4">
        
        {/* GERİ / İLERİ BUTONLARI */}
        <div className="flex items-center gap-1 mr-2 border-r pr-4 border-slate-200">
          <button 
            onClick={undo} 
            disabled={pastPages.length === 0} 
            className={`px-3 py-1.5 rounded flex items-center gap-1 text-sm font-bold transition-all ${
              pastPages.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-200"
            }`} 
            title="Geri Al (Ctrl+Z)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            Geri
          </button>
          <button 
            onClick={redo} 
            disabled={futurePages.length === 0} 
            className={`px-3 py-1.5 rounded flex items-center gap-1 text-sm font-bold transition-all ${
              futurePages.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-200"
            }`} 
            title="İleri Al (Ctrl+Shift+Z)"
          >
            İleri
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
          </button>
        </div>

        {/* ZOOM BUTONU */}
        <button
          onClick={toggleZoom}
          className={`px-4 py-1.5 rounded-md text-sm font-bold border transition-all flex items-center gap-2 ${
            isZoomed ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {isZoomed ? "🔍 Uzaklaş" : "🔍 Yakınlaş"}
        </button>
        
        {/* İNDİRME MENÜSÜ */}
        <DownloadMenu />
        
      </div>
    </div>
  );
}