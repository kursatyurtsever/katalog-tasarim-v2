"use client";

import React from "react";

// t: top, r: right, b: bottom, l: left
export interface SpacingData {
  t: number; 
  r: number; 
  b: number; 
  l: number; 
  linked: boolean;
}

interface Props {
  title?: string;
  value: SpacingData;
  onChange: (val: SpacingData) => void;
}

export function SpacingPicker({ title = "İç Boşluk (Padding)", value, onChange }: Props) {
  
  const handleLinkedChange = (val: number) => {
    onChange({ t: val, r: val, b: val, l: val, linked: true });
  };

  const updateSide = (key: keyof Omit<SpacingData, 'linked'>, val: number) => {
    onChange({ ...value, [key]: val, linked: false });
  };

  const toggleLink = () => {
    if (!value.linked) {
      // Bağlanırken Üst (t) değerini referans alıp diğerlerini eşitliyoruz
      onChange({ t: value.t, r: value.t, b: value.t, l: value.t, linked: true });
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
          title={value.linked ? "Kenarları Ayır" : "Tüm Kenarları Bağla"}
        >
          {value.linked ? "BAĞLI" : "AYRI"}
        </button>
      </div>

      {value.linked ? (
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-200">
          <span className="text-[9px] font-medium text-slate-400 w-8">Tümü</span>
          <input type="range" min="0" max="100" value={value.t} onChange={(e) => handleLinkedChange(Number(e.target.value))} className="flex-1 accent-blue-600" />
          <input type="number" value={value.t} onChange={(e) => handleLinkedChange(parseInt(e.target.value) || 0)} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {[
            { key: 't', label: 'Üst' },
            { key: 'r', label: 'Sağ' },
            { key: 'b', label: 'Alt' },
            { key: 'l', label: 'Sol' }
          ].map((side) => (
            <div key={side.key} className="flex items-center justify-between gap-1 bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[8px] font-medium text-slate-400 w-6">{side.label}</span>
              <input type="range" min="0" max="100" value={value[side.key as keyof Omit<SpacingData, 'linked'>]} onChange={(e) => updateSide(side.key as keyof Omit<SpacingData, 'linked'>, Number(e.target.value))} className="flex-1 w-10 accent-blue-600" />
              <input type="number" value={value[side.key as keyof Omit<SpacingData, 'linked'>]} onChange={(e) => updateSide(side.key as keyof Omit<SpacingData, 'linked'>, parseInt(e.target.value) || 0)} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}