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
  const handleLinkedChange = (val: number) => {
    onChange({ tl: val, tr: val, bl: val, br: val, linked: true });
  };

  const updateCorner = (key: keyof BorderRadiusData, val: number) => {
    onChange({ ...value, [key]: val, linked: false });
  };

  const toggleLink = () => {
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
        <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center space-y-2">
          <span className="text-[10px] font-medium text-slate-500 block">Tüm Köşeler</span>
          <div className="max-w-[120px] mx-auto">
            <input
              type="number"
              value={value.tl}
              onChange={(e) => handleLinkedChange(parseInt(e.target.value) || 0)}
              className="w-full text-[10px] font-bold text-slate-600 text-center border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500 shadow-inner"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'tl', label: 'Sol Üst', short: 'TL' },
            { key: 'tr', label: 'Sağ Üst', short: 'TR' },
            { key: 'bl', label: 'Sol Alt', short: 'BL' },
            { key: 'br', label: 'Sağ Alt', short: 'BR' }
          ].map((corner) => (
            <div key={corner.key} className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold text-slate-500">{corner.short}</span>
                <span className="text-[8px] text-slate-400">{corner.label}</span>
              </div>
              <input
                type="number"
                value={value[corner.key as keyof BorderRadiusData] as number}
                onChange={(e) => updateCorner(corner.key as keyof BorderRadiusData, parseInt(e.target.value) || 0)}
                className="w-full text-[10px] font-bold text-slate-600 text-center border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}