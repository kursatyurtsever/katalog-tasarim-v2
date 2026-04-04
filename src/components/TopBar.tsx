"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useEffect } from "react";
import { DownloadMenu } from "./DownloadMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export function TopBar() {
  // Yeni Forma Yapısı State'leri
  const formas = useCatalogStore((state) => state.formas || []);
  const activeFormaId = useCatalogStore((state) => state.activeFormaId);
  const setActiveFormaId = useCatalogStore((state) => state.setActiveFormaId);

  // Zoom ve Yardımcı Fonksiyonlar
  const toggleZoom = useUIStore((state) => state.toggleZoom);
  const isZoomed = useUIStore((state) => state.isZoomed);

  // Geri - İleri (Undo/Redo)
  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const pastPages = useHistoryStore((state) => state.past || []);
  const futurePages = useHistoryStore((state) => state.future || []);

  // Klavye Kısayolları (Ctrl+Z ve Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm relative z-50">
      {/* SOL KISIM: FORMA SEÇİCİ (DROPDOWN) */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="forma-select"
          className="text-xs font-bold text-slate-400 uppercase tracking-wider"
        >
          Görünüm:
        </label>
        <Select
          value={activeFormaId.toString()}
          onValueChange={(value) => setActiveFormaId(Number(value))}
        >
          <SelectTrigger className="bg-slate-800 text-white text-sm font-bold px-4 py-1.5 rounded-lg outline-none border-none shadow-md cursor-pointer hover:bg-slate-700 transition-all min-w-[180px] h-auto">
            <SelectValue placeholder="Görünüm seç..." />
          </SelectTrigger>
          <SelectContent>
            {formas.map((forma) => (
              <SelectItem key={forma.id} value={forma.id.toString()}>
                {forma.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SAĞ KISIM: ARAÇLAR */}
      <div className="flex items-center gap-4">
        {/* GERİ / İLERİ BUTONLARI */}
        <div className="flex items-center gap-1 mr-2 border-r pr-4 border-slate-200">
          <Button
            variant="ghost"
            onClick={undo}
            disabled={pastPages.length === 0}
            size="sm"
            title="Geri Al (Ctrl+Z)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
            <span className="ml-2">Geri</span>
          </Button>
          <Button
            variant="ghost"
            onClick={redo}
            disabled={futurePages.length === 0}
            size="sm"
            title="İleri Al (Ctrl+Shift+Z)"
          >
            <span className="mr-2">İleri</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
            </svg>
          </Button>
        </div>

        {/* ZOOM BUTONU */}
        <button
          onClick={toggleZoom}
          className={`px-4 py-1.5 rounded-md text-sm font-bold border transition-all flex items-center gap-2 ${
            isZoomed
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
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
