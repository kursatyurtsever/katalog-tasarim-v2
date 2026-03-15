"use client";

import { useCatalogStore } from "@/store/useCatalogStore";

/**
 * Sayfa 1 başlığı: logo, kırmızı SELBSTABHOLER - ANGEBOT, tarih, 41 numarası, alt slogan.
 */
export function Header() {
  const header = useCatalogStore((state) => state.header);
  const setHeader = useCatalogStore((state) => state.setHeader);

  return (
    <div className="header shrink-0 mb-2 flex flex-col border border-slate-400 bg-white text-black">
      <div className="flex h-20 border-b border-slate-400">
        <div className="relative flex flex-[4] items-center justify-center border-r border-slate-400 p-2">
          {header.logoUrl ? (
            <img
              src={header.logoUrl}
              alt="Logo"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-xs text-slate-400">Logo</span>
          )}
        </div>
        <div className="flex flex-[3] flex-col overflow-hidden border-r border-slate-400">
          <div
            id="header-b-container"
            className="relative flex flex-1 items-center justify-center overflow-hidden border-b border-slate-400 bg-blue-800 px-2 font-bold text-white"
          >
            <span
              id="header-b-text"
              className="whitespace-nowrap text-lg"
            >
              {header.title}
            </span>
          </div>
          <div className="relative flex flex-1 items-center justify-center bg-yellow-400 px-2">
            <input
              type="text"
              id="header-date"
              value={header.date}
              onChange={(e) => setHeader({ date: e.target.value })}
              className="w-full border-none bg-transparent text-center font-bold text-red-700 outline-none"
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center bg-red-600 px-1 text-white">
          <input
            type="text"
            id="header-no"
            value={header.no}
            onChange={(e) => setHeader({ no: e.target.value })}
            className="w-full border-none bg-transparent text-center font-black text-white outline-none placeholder-white"
            style={{ fontSize: "36px" }}
          />
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center py-2">
        <h2 className="text-[22px] font-black leading-none tracking-tighter text-red-600">
          GROSSE AUSWAHL KLEINE PREISE
        </h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-800">
          Ihr Gastro-Großhandel in Wuppertal
        </p>
      </div>
    </div>
  );
}
