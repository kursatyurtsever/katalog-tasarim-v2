"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useEffect } from "react";

export function TopBar() {
  const activeTab = useCatalogStore((state) => state.activeTab);
  const setActiveTab = useCatalogStore((state) => state.setActiveTab);
  const toggleZoom = useCatalogStore((state) => state.toggleZoom);
  const isZoomed = useCatalogStore((state) => state.isZoomed);
  
  // Geri - İleri state'leri
  const undo = useCatalogStore((state) => state.undo);
  const redo = useCatalogStore((state) => state.redo);
  const pastPages = useCatalogStore((state) => state.pastPages || []);
  const futurePages = useCatalogStore((state) => state.futurePages || []);

  // Klavye Kısayolları Dinleyicisi (Ctrl+Z ve Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) { e.preventDefault(); redo(); } 
        else { e.preventDefault(); undo(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm relative z-50">
      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          onClick={() => setActiveTab("outer")}
          className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
            activeTab === "outer" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Dış Sayfalar (1, 5, 6)
        </button>
        <button
          onClick={() => setActiveTab("inner")}
          className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
            activeTab === "inner" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          İç Sayfalar (2, 3, 4)
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* GERİ / İLERİ BUTONLARI */}
        <div className="flex items-center gap-1 mr-2 border-r pr-4 border-slate-200">
          <button 
            onClick={undo} 
            disabled={pastPages.length === 0} 
            className={`px-3 py-1.5 rounded flex items-center gap-1 text-sm font-bold transition-all ${pastPages.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-200"}`} 
            title="Geri Al (Ctrl+Z)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            Geri
          </button>
          <button 
            onClick={redo} 
            disabled={futurePages.length === 0} 
            className={`px-3 py-1.5 rounded flex items-center gap-1 text-sm font-bold transition-all ${futurePages.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-200"}`} 
            title="İleri Al (Ctrl+Shift+Z)"
          >
            İleri
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
          </button>
        </div>

        <button
          onClick={toggleZoom}
          className={`px-4 py-1.5 rounded-md text-sm font-bold border transition-all flex items-center gap-2 ${
            isZoomed ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {isZoomed ? "🔍 Uzaklaş" : "🔍 Yakınlaş"}
        </button>
        <button className="px-5 py-1.5 bg-[#e60000] hover:bg-red-700 text-white rounded-md text-sm font-bold transition-all shadow-sm">
          PDF İndir
        </button>
      </div>
    </div>
  );
}