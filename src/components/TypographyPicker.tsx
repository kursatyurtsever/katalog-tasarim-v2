"use client";

import React from "react";
import { ColorOpacityPicker } from "./ColorOpacityPicker";

export interface TypographyData {
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: "left" | "center" | "right" | "justify";
  verticalAlign: "top" | "middle" | "bottom";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration: "none" | "underline" | "line-through";
  color: string;
  opacity: number;
  decimalScale: number; // YENİ EKLENDİ
}

interface Props {
  title: string;
  value: TypographyData;
  onChange: (value: TypographyData) => void;
}

const AlignIcon = ({ type }: { type: string }) => {
  if (type === "left") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h12M3 18h18"/></svg>;
  if (type === "center") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M3 18h18"/></svg>;
  if (type === "right") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M9 12h12M3 18h18"/></svg>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
};

const VerticalAlignIcon = ({ type }: { type: string }) => {
  if (type === "top") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h18M7 10h10M7 16h10"/></svg>;
  if (type === "middle") return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M7 6h10M7 18h10"/></svg>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 20h18M7 8h10M7 14h10"/></svg>;
};

export function TypographyPicker({ title, value, onChange }: Props) {
  const update = (key: keyof TypographyData, val: any) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <details className="group/font bg-white border border-slate-200 rounded shadow-sm mb-2 last:mb-0">
      <summary className="text-[10px] font-bold text-slate-700 uppercase tracking-wider p-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors list-none flex justify-between items-center">
        {title}
        <span className="group-open/font:rotate-180 transition-transform text-[9px] text-slate-400">▼</span>
      </summary>
      
      <div className="p-3 space-y-3 border-t border-slate-200 bg-white">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Font Ailesi</span>
            <select value={value.fontFamily} onChange={(e) => update("fontFamily", e.target.value)} className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none focus:border-blue-500">
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Arial">Arial</option>
              <option value="Oswald">Oswald</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Kalınlık</span>
            <select value={value.fontWeight} onChange={(e) => update("fontWeight", e.target.value)} className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none focus:border-blue-500">
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="700">Bold (700)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-medium text-slate-500 w-20">Punto (Size)</span>
            <input type="range" min="8" max="72" value={value.fontSize} onChange={(e) => update("fontSize", Number(e.target.value))} className="flex-1 accent-blue-600" />
            <input type="number" min="8" max="72" value={value.fontSize} onChange={(e) => update("fontSize", Number(e.target.value))} className="w-10 text-[9px] font-bold text-slate-600 text-center border border-slate-200 rounded p-0.5" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-medium text-slate-500 w-20">Satır Yüksekliği</span>
            <input type="range" min="0.5" max="3" step="0.1" value={value.lineHeight} onChange={(e) => update("lineHeight", Number(e.target.value))} className="flex-1 accent-blue-600" />
            <input type="number" min="0.5" max="3" step="0.1" value={value.lineHeight} onChange={(e) => update("lineHeight", Number(e.target.value))} className="w-10 text-[9px] font-bold text-slate-600 text-center border border-slate-200 rounded p-0.5" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-medium text-slate-500 w-20">Harf Aralığı</span>
            <input type="range" min="-5" max="10" step="0.5" value={value.letterSpacing} onChange={(e) => update("letterSpacing", Number(e.target.value))} className="flex-1 accent-blue-600" />
            <input type="number" min="-5" max="10" step="0.5" value={value.letterSpacing} onChange={(e) => update("letterSpacing", Number(e.target.value))} className="w-10 text-[9px] font-bold text-slate-600 text-center border border-slate-200 rounded p-0.5" />
          </div>
          
          {/* YENİ EKLENEN KÜSURAT BOYUTU AYARI */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-medium text-slate-500 w-20">Küsurat Boyutu</span>
            <input type="range" min="30" max="100" value={value.decimalScale ?? 100} onChange={(e) => update("decimalScale", Number(e.target.value))} className="flex-1 accent-blue-600" />
            <span className="w-10 text-[9px] font-bold text-slate-600 text-center border border-slate-200 rounded p-0.5">%{value.decimalScale ?? 100}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Yatay Hizalama</span>
            <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                <button key={align} onClick={() => update("textAlign", align)} className={`flex-1 flex justify-center items-center py-1 rounded-sm transition-colors ${value.textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title={align.toUpperCase()}>
                  <AlignIcon type={align} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Dikey Hizalama</span>
            <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
              {(['top', 'middle', 'bottom'] as const).map((align) => (
                <button key={align} onClick={() => update("verticalAlign", align)} className={`flex-1 flex justify-center items-center py-1 rounded-sm transition-colors ${value.verticalAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title={align.toUpperCase()}>
                  <VerticalAlignIcon type={align} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Biçim</span>
            <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
              <button onClick={() => update("textTransform", value.textTransform === "uppercase" ? "none" : "uppercase")} className={`flex-1 flex justify-center items-center py-1 rounded-sm transition-colors font-bold text-[10px] ${value.textTransform === 'uppercase' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="TÜMÜ BÜYÜK">AA</button>
              <button onClick={() => update("textTransform", value.textTransform === "capitalize" ? "none" : "capitalize")} className={`flex-1 flex justify-center items-center py-1 rounded-sm transition-colors font-bold text-[10px] ${value.textTransform === 'capitalize' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="İlk Harfler Büyük">Aa</button>
              <button onClick={() => update("textDecoration", value.textDecoration === "underline" ? "none" : "underline")} className={`flex-1 flex justify-center items-center py-1 rounded-sm transition-colors font-bold text-[10px] underline ${value.textDecoration === 'underline' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="Altı Çizili">U</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-700">Yazı Rengi & Saydamlık</span>
          <ColorOpacityPicker color={value.color} opacity={value.opacity} onChange={(c, o) => onChange({ ...value, color: c, opacity: o })} />
        </div>

      </div>
    </details>
  );
}