"use client";

import React, { useState, useEffect, useRef } from "react";

interface Props {
  color: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
}

export function ColorOpacityPicker({ color, opacity, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedColors, setSavedColors] = useState<{ c: string; o: number }[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Kayıtlı renkleri yükleme fonksiyonu (Ortak kullanabilmek için dışarı çıkardık)
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

  // Component yüklendiğinde ve diğer renk seçicilerden sinyal geldiğinde çalışır
  useEffect(() => {
    loadColors();
    
    // Diğer bileşenlerin "güncellendim" sinyalini dinle
    window.addEventListener("pizza_colors_updated", loadColors);
    
    return () => {
      window.removeEventListener("pizza_colors_updated", loadColors);
    };
  }, []);

  // Dışarı tıklanınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Yeni rengi kaydet
  const handleSaveColor = () => {
    if (savedColors.some((sc) => sc.c === color && sc.o === opacity)) return;

    const newColors = [{ c: color, o: opacity }, ...savedColors].slice(0, 18); 
    setSavedColors(newColors);
    localStorage.setItem("pizza_saved_colors", JSON.stringify(newColors));
    
    // Diğer tüm renk seçicilere anlık güncelleme sinyali gönder
    window.dispatchEvent(new Event("pizza_colors_updated"));
  };

  // Rengi Sil
  const handleDeleteSaved = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); 
    const newColors = savedColors.filter((_, i) => i !== index);
    setSavedColors(newColors);
    localStorage.setItem("pizza_saved_colors", JSON.stringify(newColors));
    
    // Diğer tüm renk seçicilere anlık güncelleme sinyali gönder
    window.dispatchEvent(new Event("pizza_colors_updated"));
  };

  return (
    <div className="relative flex items-center" ref={popoverRef}>
      {/* TETİKLEYİCİ BUTON */}
      <div
        className="w-8 h-8 rounded cursor-pointer border border-slate-300 shadow-sm relative overflow-hidden shrink-0"
        onClick={() => setIsOpen(!isOpen)}
        title={`${color} (%${opacity})`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPjwvc3ZnPg==')] opacity-40"></div>
        <div
          className="absolute inset-0 transition-colors"
          style={{ backgroundColor: color, opacity: opacity / 100 }}
        />
      </div>

      {/* AÇILIR MENÜ (POPOVER) */}
      {isOpen && (
        <div className="absolute right-0 top-10 z-[100] w-[210px] bg-white border border-slate-200 rounded-lg shadow-xl p-3 flex flex-col gap-3">
          
          {/* HEX GÖSTERİMİ VE BÜYÜK KARE RENK SEÇİCİ */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded cursor-pointer border border-slate-300 shadow-sm relative overflow-hidden shrink-0">
              <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value, opacity)}
                className="absolute top-[-10px] left-[-10px] w-[60px] h-[60px] cursor-pointer"
                title="Renk Seçmek İçin Tıkla"
              />
            </div>
            
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(val)) onChange(val, opacity);
              }}
              className="flex-1 min-w-0 w-full bg-slate-50 border border-slate-200 text-slate-800 text-[12px] py-1.5 px-2 rounded outline-none uppercase font-mono text-center transition-colors focus:border-blue-400 font-bold"
            />
          </div>

          {/* SAYDAMLIK (OPACITY) */}
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saydamlık</span>
              <span className="text-[10px] text-blue-600 font-bold">%{opacity}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => onChange(color, parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* KAYITLI RENKLER BÖLÜMÜ */}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kayıtlı Renkler</span>
              <button
                onClick={handleSaveColor}
                className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors font-bold tracking-wider shadow-sm border border-slate-200"
              >
                + EKLE
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {savedColors.map((sc, idx) => (
                <div
                  key={idx}
                  /* group yerine group/coloritem kullandık, çakışmayı önlemek için */
                  className="w-6 h-6 rounded cursor-pointer border border-slate-200 hover:border-blue-500 transition-colors relative overflow-hidden group/coloritem shadow-sm"
                  onClick={() => onChange(sc.c, sc.o)}
                  title={`${sc.c} (%${sc.o})`}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPjwvc3ZnPg==')] opacity-30"></div>
                  <div
                    className="absolute inset-0 transition-opacity"
                    style={{ backgroundColor: sc.c, opacity: sc.o / 100 }}
                  />
                  {/* Sadece group-hover/coloritem ile tetiklenir */}
                  <div
                    className="absolute top-0 right-0 bg-red-600/90 text-white w-3 h-3 flex items-center justify-center text-[10px] leading-none opacity-0 group-hover/coloritem:opacity-100 transition-opacity rounded-bl-sm z-10 font-black"
                    onClick={(e) => handleDeleteSaved(e, idx)}
                    title="Rengi Sil"
                  >
                    ×
                  </div>
                </div>
              ))}
              {savedColors.length === 0 && (
                <span className="text-[9px] text-slate-500 italic mt-1">Henüz renk kaydedilmedi.</span>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}