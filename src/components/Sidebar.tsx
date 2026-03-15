"use client";

import { useState } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import * as XLSX from "xlsx";

export function Sidebar() {
  const productPool = useCatalogStore((state) => state.productPool);
  const setProductPool = useCatalogStore((state) => state.setProductPool);
  const globalSettings = useCatalogStore((state) => state.globalSettings);
  const setGlobalSettings = useCatalogStore((state) => state.setGlobalSettings);
  const autoFillSlots = useCatalogStore((state) => state.autoFillSlots);

  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const formattedProducts = data.map((row: any, index: number) => ({
        id: row.ARTNR?.toString() || `urun-${index}`,
        name: row.BEZEICHNUNG || "İsimsiz Ürün",
        price: row.SATIS?.toString() || row["G.VK.KND"]?.toString() || "0",
        sku: row.ARTNR?.toString() || "",
        raw: row,
      }));

      setProductPool(formattedProducts);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <aside className="w-80 h-full bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 shadow-xl">
      {/* ÜST SEKMELER */}
      <div className="flex w-full bg-slate-900 p-2 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
            activeTab === "products"
              ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner"
              : "bg-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          ÜRÜN LİSTESİ
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
            activeTab === "settings"
              ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner"
              : "bg-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          AYARLAR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* --- ÜRÜN LİSTESİ SEKMESİ --- */}
        {activeTab === "products" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 bg-white space-y-4 shadow-sm text-slate-900">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  1. Excel Dosyası Yükle (.xlsx)
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <button
                onClick={autoFillSlots}
                disabled={productPool.length === 0}
                className={`w-full font-bold py-3 rounded-md text-sm transition-all shadow-md ${
                  productPool.length > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white transform active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Tasarımı Yerleştir (POS'a Göre)
              </button>
            </div>

            <div className="p-4 bg-slate-50 flex-1">
              <h3 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest text-slate-900">
                Ürün Havuzu ({productPool.length})
              </h3>
              <div className="grid gap-2">
                {productPool.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-[11px] flex flex-col gap-1 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-black text-slate-800">{p.sku}</span>
                      <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                        POS: {p.raw?.POS || "-"}
                      </span>
                    </div>
                    <span className="text-slate-600 truncate font-medium">{p.name}</span>
                    <span className="font-bold text-red-600 self-end text-[12px]">
                      {p.price} TL
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- AYARLAR SEKMESİ --- */}
        {activeTab === "settings" && (
          <div className="p-5 space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 border-b pb-2">
                Tasarım Detayları
              </h3>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Hücre Boşluğu</label>
                  <span className="text-xs font-black text-blue-600 px-2 py-1 bg-blue-50 rounded">
                    {globalSettings.gridGap} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={globalSettings.gridGap}
                  onChange={(e) => setGlobalSettings({ gridGap: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}