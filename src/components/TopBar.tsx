"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, ArrowUUpLeft, ArrowUUpRight } from "@phosphor-icons/react";

export function TopBar() {
  const formas = useCatalogStore((state) => state.formas || []);
  const activeFormaId = useCatalogStore((state) => state.activeFormaId);
  const setActiveFormaId = useCatalogStore((state) => state.setActiveFormaId);

  const toggleZoom = useUIStore((state) => state.toggleZoom);
  const isZoomed = useUIStore((state) => state.isZoomed);

  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const pastPages = useHistoryStore((state) => state.past || []);
  const futurePages = useHistoryStore((state) => state.future || []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) { e.preventDefault(); redo(); } 
        else { e.preventDefault(); undo(); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-12 bg-(--bg-panel) border-b border-(--border-color) flex items-center justify-between px-4 shrink-0 shadow-sm relative z-1001">
      <div className="flex items-center gap-3">
        <label htmlFor="forma-select" className="section-title">Görünüm:</label>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Select value={activeFormaId.toString()} onValueChange={(val: any) => val && setActiveFormaId(Number(val))}>
          <SelectTrigger className="bg-(--bg-subpanel) text-(--text-main) text-[12px] font-semibold px-3 py-1.5 rounded-md outline-none border border-(--border-color) cursor-pointer hover:bg-slate-100 transition-all min-w-45 h-8">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore - Base UI placeholder tip denetimi uyumluluğu */}
            <SelectValue placeholder="Görünüm seç..." />
          </SelectTrigger>
          <SelectContent className="z-99999">
            {formas.map((forma) => (
              <SelectItem key={forma.id} value={forma.id.toString()} className="text-[12px] font-medium">
                {forma.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-2 border-r pr-3 border-(--border-color)">
          <Button variant="ghost" onClick={undo} disabled={pastPages.length === 0} className="h-8 px-2.5 text-(--text-muted) hover:text-(--text-main) hover:bg-(--bg-canvas)" title="Geri Al (Ctrl+Z)">
            <ArrowUUpLeft size={16} weight="regular" />
            <span className="ml-1.5 text-[11px] font-medium">Geri</span>
          </Button>
          <Button variant="ghost" onClick={redo} disabled={futurePages.length === 0} className="h-8 px-2.5 text-(--text-muted) hover:text-(--text-main) hover:bg-(--bg-canvas)" title="İleri Al (Ctrl+Shift+Z)">
            <span className="mr-1.5 text-[11px] font-medium">İleri</span>
            <ArrowUUpRight size={16} weight="regular" />
          </Button>
        </div>

        <button
          onClick={toggleZoom}
          className={`h-8 px-3.5 rounded-md text-[11px] font-semibold border transition-all flex items-center gap-1.5 ${
            isZoomed
              ? "bg-primary border-primary text-white hover:bg-(--primary-hover)"
              : "bg-(--bg-panel) border-(--border-color) text-(--text-main) hover:bg-(--bg-canvas)"
          }`}
        >
          <MagnifyingGlass size={16} weight="regular" />
          {isZoomed ? "Uzaklaş" : "Yakınlaş"}
        </button>
      </div>
    </div>
  );
}