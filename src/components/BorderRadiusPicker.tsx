"use client";

import React from "react";

export interface BorderRadiusData {
  tl: number; // Top-Left (Sol Üst)
  tr: number; // Top-Right (Sağ Üst)
  bl: number; // Bottom-Left (Sol Alt)
  br: number; // Bottom-Right (Sağ Alt)
  linked: boolean; // Köşeler birbirine bağlı mı?
}

interface Props {
  title?: string;
  value: BorderRadiusData;
  onChange: (val: BorderRadiusData) => void;
}

export function BorderRadiusPicker({ title = "Köşe Ovalliği (Radius)", value, onChange }: Props) {
  
  // Tüm köşeleri aynı anda günceller
  const handleLinkedChange = (val: number) => {
    onChange({ tl: val, tr: val, bl: val, br: val, linked: true });
  };

  // Sadece tek bir köşeyi günceller ve bağı koparır
  const updateCorner = (key: keyof BorderRadiusData, val: number) => {
    onChange({ ...value, [key]: val, linked: false });
  };

  // Bağlantı (Link) butonuna basıldığında tetiklenir
  const toggleLink = () => {
    // Eğer bağlanıyorsa, sol üst (tl) değerini baz alıp hepsine eşitle
    if (!value.linked) {
      onChange({ tl: value.tl, tr: value.tl, bl: value.tl, br: value.tl, linked: true });
    } else {
      onChange({ ...value, linked: false });
    }
  };

  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-600">{title}</span>
        <button 
          onClick={toggleLink}
          className={`text-[8px] px-1.5 py-0.5 rounded font-bold transition-colors ${value.linked ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          title={value.linked ? "Köşeleri Ayır" : "Tüm Köşeleri Bağla"}
        >
          {value.linked ? "BAĞLI" : "AYRI"}
        </button>
      </div>

      {value.linked ? (
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-200">
          <span className="text-[9px] font-medium text-slate-400 w-8">Tümü</span>
          <input type="range" min="0" max="50" value={value.tl} onChange={(e) => handleLinkedChange(Number(e.target.value))} className="flex-1 accent-blue-600" />
          <span className="text-[9px] font-bold text-slate-600 w-6 text-right">{value.tl}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {[
            { key: 'tl', label: 'Sol Üst' },
            { key: 'tr', label: 'Sağ Üst' },
            { key: 'bl', label: 'Sol Alt' },
            { key: 'br', label: 'Sağ Alt' }
          ].map((corner) => (
            <div key={corner.key} className="flex items-center justify-between gap-1 bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[8px] font-medium text-slate-400 w-10">{corner.label}</span>
              <input type="range" min="0" max="50" value={value[corner.key as keyof BorderRadiusData] as number} onChange={(e) => updateCorner(corner.key as keyof BorderRadiusData, Number(e.target.value))} className="flex-1 w-10 accent-blue-600" />
              <span className="text-[8px] font-bold text-slate-600 w-4 text-right">{value[corner.key as keyof BorderRadiusData]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}