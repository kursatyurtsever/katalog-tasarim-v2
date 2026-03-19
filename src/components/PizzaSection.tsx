"use client";

import React, { useRef, useState } from 'react';

export function PizzaSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageUrl(URL.createObjectURL(e.target.files[0])); 
    }
  };

  const Cell = ({ size, price }: { size: string, price: string }) => (
    <div className="flex flex-col border-r border-slate-300 bg-white last:border-r-0 h-full">
      <div className="text-[10px] font-bold text-center border-b border-slate-300 bg-slate-100 py-1 flex-1 flex items-center justify-center min-h-[22px]" contentEditable suppressContentEditableWarning>{size}</div>
      <div className="text-[12px] font-black text-center text-red-600 py-1 flex-1 flex items-center justify-center min-h-[22px]" contentEditable suppressContentEditableWarning>{price}</div>
    </div>
  );

  const SpecialCell = ({ title, price }: { title: string, price: string }) => (
    <div className="flex flex-col border-r border-slate-300 bg-white last:border-r-0 h-full">
      <div className="text-[10px] font-bold text-center border-b border-slate-300 bg-slate-100 py-1 flex-1 flex items-center justify-center whitespace-pre-wrap leading-tight px-1 min-h-[30px]" contentEditable suppressContentEditableWarning>{title}</div>
      <div className="text-[12px] font-black text-center text-red-600 py-1 flex-1 flex items-center justify-center min-h-[22px]" contentEditable suppressContentEditableWarning>{price}</div>
    </div>
  );

  return (
    <div className="w-full h-full p-[4mm] flex flex-col bg-white border-2 border-slate-800 rounded-lg shadow-sm">
      
      {/* BAŞLIK (Altındaki çizgi kaldırıldı) */}
      <div className="w-full text-center shrink-0">
        <h2 className="text-[18px] font-black text-slate-900 uppercase tracking-widest italic">Pizzakartons KRAFT !!!</h2>
      </div>

      {/* İÇERİK: Tablo 1 ve Tablo 3'ü 10mm aşağı itmek için mt-[10mm] eklendi */}
      <div className="flex flex-row gap-[5mm] flex-1 min-h-0 mt-[10mm]">
        
        {/* SOL KOLON (Tablo 1 & Tablo 2) */}
        <div className="flex flex-col gap-[6mm] flex-[3] h-full">
          {/* TABLO 1: KRAFT BRAUN */}
          <div className="border-[2px] border-slate-800 flex flex-col bg-white rounded-sm overflow-hidden flex-1">
            <div className="bg-slate-800 text-white text-center font-bold text-[11px] py-1.5 uppercase" contentEditable suppressContentEditableWarning>New York Kraft Braun 100 Stk.</div>
            <div className="flex flex-col flex-1 gap-[3mm]">
              <div className="grid grid-cols-4 flex-1 border-b border-slate-300">
                <Cell size="20x20" price="7,99" />
                <Cell size="22x22" price="9,49" />
                <Cell size="24x24" price="10,49" />
                <Cell size="26x26" price="11,49" />
              </div>
              <div className="grid grid-cols-4 flex-1 border-t border-slate-300">
                <Cell size="28x28" price="12,49" />
                <Cell size="29x29" price="12,99" />
                <Cell size="30x30" price="13,49" />
                <Cell size="32x32" price="14,49" />
              </div>
            </div>
          </div>

          {/* TABLO 2: KRAFT WEISS */}
          <div className="border-[2px] border-slate-800 flex flex-col bg-white rounded-sm overflow-hidden flex-1">
            <div className="bg-slate-200 text-slate-900 text-center font-bold text-[11px] py-1.5 uppercase border-b border-slate-800" contentEditable suppressContentEditableWarning>New York Kraft Weiss 100 Stk.</div>
            <div className="flex flex-col flex-1 gap-[3mm]">
              <div className="grid grid-cols-4 flex-1 border-b border-slate-300">
                <Cell size="20x20" price="7,99" />
                <Cell size="22x22" price="9,49" />
                <Cell size="24x24" price="10,49" />
                <Cell size="26x26" price="11,49" />
              </div>
              <div className="grid grid-cols-4 flex-1 border-t border-slate-300">
                <Cell size="28x28" price="12,49" />
                <Cell size="29x29" price="12,99" />
                <Cell size="30x30" price="13,49" />
                <Cell size="32x32" price="14,49" />
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ KOLON (Tablo 3 & Resim) */}
        <div className="flex flex-col gap-[4mm] flex-[5] h-full">
          {/* TABLO 3: ÖZEL ÜRÜNLER */}
          <div className="border-[2px] border-slate-800 flex flex-col bg-white rounded-sm overflow-hidden shrink-0">
            <div className="grid grid-cols-3">
              <SpecialCell title={"Rollo\n(200 Stk.)"} price="7,99" />
              <SpecialCell title={"Calzone\n(100 Stk.)"} price="9,49" />
              <SpecialCell title={"Familie 40x60\n(50 Stk.)"} price="10,49" />
            </div>
          </div>

          {/* RESİM ALANI */}
          <div 
            className="flex-1 border-[2px] border-dashed border-slate-400 bg-slate-50 flex items-center justify-center relative group cursor-pointer overflow-hidden rounded-sm min-h-0"
            onClick={() => fileInputRef.current?.click()}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Pizza Kartonu" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="text-slate-400 font-bold text-[14px] flex flex-col items-center">
                <span className="text-3xl mb-1">+</span>
                <span>RESİM EKLE</span>
              </div>
            )}
          </div>
        </div>
        
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  );
}