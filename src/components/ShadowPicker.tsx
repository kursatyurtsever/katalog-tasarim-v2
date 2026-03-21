"use client";

import React from "react";
import { ColorOpacityPicker } from "./ColorOpacityPicker";

// Tüm sistemde kullanılacak standart Gölge veri modeli
export interface ShadowData {
  x: number; // X ekseni kaydırma (Offset X)
  y: number; // Y ekseni kaydırma (Offset Y)
  blur: number; // Bulanıklık (Blur)
  spread: number; // Yayılma (Spread)
  color: string; // Gölge Rengi
  opacity: number; // Gölge Saydamlığı
  active: boolean; // Gölge aktif mi?
}

interface Props {
  title?: string;
  value: ShadowData;
  onChange: (val: ShadowData) => void;
}

export function ShadowPicker({ title = "Gölge Ayarları (Drop Shadow)", value, onChange }: Props) {
  
  const update = (key: keyof Omit<ShadowData, 'active' | 'color' | 'opacity'>, val: number) => {
    onChange({ ...value, [key]: val });
  };

  const toggleActive = () => {
    onChange({ ...value, active: !value.active });
  };

  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-600">{title}</span>
        <button 
          onClick={toggleActive}
          className={`text-[8px] px-1.5 py-0.5 rounded font-bold transition-colors ${value.active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          title={value.active ? "Gölgeyi Kapat" : "Gölgeyi Aç"}
        >
          {value.active ? "AKTİF" : "KAPALI"}
        </button>
      </div>

      {value.active && (
        <div className="p-3 space-y-3 bg-slate-50 rounded border border-slate-200">
          
          {/* X & Y Kaydırma */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 bg-white p-1.5 rounded border border-slate-100">
              <span className="text-[9px] font-medium text-slate-400">Yatay Kaydırma (X)</span>
              <div className="flex items-center gap-2">
                <input type="range" min="-50" max="50" value={value.x} onChange={(e) => update("x", Number(e.target.value))} className="flex-1 accent-blue-600" />
                <span className="text-[9px] font-bold text-slate-600 w-6 text-right">{value.x}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 bg-white p-1.5 rounded border border-slate-100">
              <span className="text-[9px] font-medium text-slate-400">Dikey Kaydırma (Y)</span>
              <div className="flex items-center gap-2">
                <input type="range" min="-50" max="50" value={value.y} onChange={(e) => update("y", Number(e.target.value))} className="flex-1 accent-blue-600" />
                <span className="text-[9px] font-bold text-slate-600 w-6 text-right">{value.y}</span>
              </div>
            </div>
          </div>

          {/* Blur & Spread */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div className="flex flex-col gap-1.5 bg-white p-1.5 rounded border border-slate-100">
              <span className="text-[9px] font-medium text-slate-400">Bulanıklık (Blur)</span>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="100" value={value.blur} onChange={(e) => update("blur", Number(e.target.value))} className="flex-1 accent-blue-600" />
                <span className="text-[9px] font-bold text-slate-600 w-6 text-right">{value.blur}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 bg-white p-1.5 rounded border border-slate-100">
              <span className="text-[9px] font-medium text-slate-400">Yayılma (Spread)</span>
              <div className="flex items-center gap-2">
                <input type="range" min="-20" max="50" value={value.spread} onChange={(e) => update("spread", Number(e.target.value))} className="flex-1 accent-blue-600" />
                <span className="text-[9px] font-bold text-slate-600 w-6 text-right">{value.spread}</span>
              </div>
            </div>
          </div>

          {/* Renk ve Saydamlık */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 bg-white p-2 rounded border border-slate-100">
            <span className="text-[10px] font-bold text-slate-700">Gölge Rengi & Saydamlık</span>
            <ColorOpacityPicker
              color={value.color}
              opacity={value.opacity}
              onChange={(c, o) => {
                onChange({ ...value, color: c, opacity: o });
              }}
            />
          </div>

        </div>
      )}
    </div>
  );
}