"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  color: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
  // YENİ EKLENENLER: Kalınlık ayarı ve Buton Tipi (Dolu mu, Çerçeve mi?)
  thickness?: number;
  onThicknessChange?: (thickness: number) => void;
  type?: 'fill' | 'border'; 
  disabled?: boolean;
}

export function ColorOpacityPicker({ color, opacity, onChange, thickness, onThicknessChange, type = 'fill' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedColors, setSavedColors] = useState<{ c: string; o: number }[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadColors = () => {
    const saved = localStorage.getItem("pizza_saved_colors");
    if (saved) {
      try {
        setSavedColors(JSON.parse(saved));
      } catch (e) {}
    } else {
      setSavedColors([]);
    }
  };

  useEffect(() => {
    loadColors();
    window.addEventListener("pizza_colors_updated", loadColors);
    return () => window.removeEventListener("pizza_colors_updated", loadColors);
  }, []);

  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 5,
        left: rect.right + window.scrollX - 210, 
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSaveColor = () => {
    if (savedColors.some((sc) => sc.c === color && sc.o === opacity)) return;
    const newColors = [{ c: color, o: opacity }, ...savedColors].slice(0, 18); 
    setSavedColors(newColors);
    localStorage.setItem("pizza_saved_colors", JSON.stringify(newColors));
    window.dispatchEvent(new Event("pizza_colors_updated"));
  };

  const handleDeleteSaved = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); 
    const newColors = savedColors.filter((_, i) => i !== index);
    setSavedColors(newColors);
    localStorage.setItem("pizza_saved_colors", JSON.stringify(newColors));
    window.dispatchEvent(new Event("pizza_colors_updated"));
  };

  return (
    <>
      {/* TETİKLEYİCİ BUTON */}
      <div
        ref={buttonRef}
        className="w-8 h-8 rounded cursor-pointer border border-slate-300 shadow-sm relative overflow-hidden shrink-0 bg-white"
        onClick={() => setIsOpen(!isOpen)}
        title={`${color} (%${opacity})`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPjwvc3ZnPg==')] opacity-40"></div>
        
        {/* YENİ: Tip 'border' ise içi boş çerçeve, 'fill' ise tam dolu kutu gösterir */}
        {type === 'border' ? (
          <div className="absolute inset-1.5 border-[3px] rounded-[1px] transition-colors z-10" style={{ borderColor: color, opacity: opacity / 100 }} />
        ) : (
          <div className="absolute inset-0 transition-colors z-10" style={{ backgroundColor: color, opacity: opacity / 100 }} />
        )}
      </div>

      {/* AÇILAN MENÜ (PORTAL) */}
      {isOpen && createPortal(
        <div 
          ref={popoverRef}
          className="fixed z-[99999] w-[210px] bg-white border border-slate-200 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-3 flex flex-col gap-3"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        >
          {/* RENK SEÇİCİ */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded cursor-pointer border border-slate-300 shadow-sm relative overflow-hidden shrink-0">
              <input type="color" value={color} onChange={(e) => onChange(e.target.value, opacity)} className="absolute top-[-10px] left-[-10px] w-[60px] h-[60px] cursor-pointer" title="Renk Seçmek İçin Tıkla" />
            </div>
            <input type="text" value={color.toUpperCase()} onChange={(e) => { const val = e.target.value; if (/^#[0-9A-F]{6}$/i.test(val)) onChange(val, opacity); }} className="flex-1 min-w-0 w-full bg-slate-50 border border-slate-200 text-slate-800 text-[12px] py-1.5 px-2 rounded outline-none uppercase font-mono text-center transition-colors focus:border-blue-400 font-bold" />
          </div>

          {/* YENİ: KALINLIK AYARI (Sadece onThicknessChange prop'u gelirse görünür) */}
          {thickness !== undefined && onThicknessChange && (
            <div className="flex flex-col gap-1 pt-1 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kalınlık</span>
                <span className="text-[10px] text-blue-600 font-bold">{thickness}px</span>
              </div>
              <input type="range" min="0" max="10" value={thickness} onChange={(e) => onThicknessChange(parseInt(e.target.value))} className="w-full accent-blue-600" />
            </div>
          )}

          {/* SAYDAMLIK AYARI */}
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saydamlık</span>
              <span className="text-[10px] text-blue-600 font-bold">%{opacity}</span>
            </div>
            <input type="range" min="0" max="100" value={opacity} onChange={(e) => onChange(color, parseInt(e.target.value))} className="w-full accent-blue-600" />
          </div>

          {/* KAYITLI RENKLER */}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kayıtlı Renkler</span>
              <button onClick={handleSaveColor} className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors font-bold tracking-wider shadow-sm border border-slate-200">+ EKLE</button>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {savedColors.map((sc, idx) => (
                <div key={idx} className="w-6 h-6 rounded cursor-pointer border border-slate-200 hover:border-blue-500 transition-colors relative overflow-hidden group/coloritem shadow-sm" onClick={() => onChange(sc.c, sc.o)} title={`${sc.c} (%${sc.o})`}>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPjwvc3ZnPg==')] opacity-30"></div>
                  <div className="absolute inset-0 transition-opacity" style={{ backgroundColor: sc.c, opacity: sc.o / 100 }} />
                  <div className="absolute top-0 right-0 bg-red-600/90 text-white w-3 h-3 flex items-center justify-center text-[10px] leading-none opacity-0 group-hover/coloritem:opacity-100 transition-opacity rounded-bl-sm z-10 font-black" onClick={(e) => handleDeleteSaved(e, idx)} title="Rengi Sil">×</div>
                </div>
              ))}
              {savedColors.length === 0 && <span className="text-[9px] text-slate-500 italic mt-1">Henüz renk kaydedilmedi.</span>}
            </div>
          </div>
        </div>,
        document.body 
      )}
    </>
  );
}