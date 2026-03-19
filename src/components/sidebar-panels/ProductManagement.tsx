"use client";

import { useState, useMemo, useRef } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import * as XLSX from "xlsx";

export function ProductManagement() {
  const { productPool, setProductPool, masterProductPool, setMasterProductPool, pages, autoFillSlots, clearProducts, resetCatalog } = useCatalogStore();
  const [searchTerm, setSearchTerm] = useState("");
  const layoutFileRef = useRef<HTMLInputElement>(null);
  const masterFileRef = useRef<HTMLInputElement>(null);

  const handleLayoutFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      // defval: "" ile boş hücrelerin hata vermesini engelliyoruz
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      
      const formatted = rows.map((row: any, i) => ({
        id: row.ARTNR?.toString() || row.KOD?.toString() || `u-${i}`,
        name: row.BEZEICHNUNG || row.URUN_ADI || "İsimsiz",
        price: row.VK_NETTO?.toString() || row.FIYAT?.toString() || "0",
        sku: row.ARTNR?.toString() || row.KOD?.toString() || `u-${i}`,
        category: row.KATEGORI || row.ARTGRP?.toString() || "Yüklenen",
        image: row.RESIM || `/images/products/${row.ARTNR || row.KOD}.png`,
        raw: row,
      }));
      setProductPool(formatted);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleMasterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      
      const formatted = rows.map((row: any, i) => ({
        id: row.ARTNR?.toString() || row.KOD?.toString() || `u-${i}`,
        name: row.BEZEICHNUNG || row.URUN_ADI || "İsimsiz",
        price: row.VK_NETTO?.toString() || row.FIYAT?.toString() || "0",
        sku: row.ARTNR?.toString() || row.KOD?.toString() || `u-${i}`,
        category: row.KATEGORI || row.ARTGRP?.toString() || "Yüklenen",
        image: row.RESIM || `/images/products/${row.ARTNR || row.KOD}.png`,
        raw: row,
      }));
      setMasterProductPool(formatted);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClearAll = () => {
    clearProducts(); setProductPool([]); setMasterProductPool([]); setSearchTerm("");
    if (layoutFileRef.current) layoutFileRef.current.value = "";
    if (masterFileRef.current) masterFileRef.current.value = "";
  };

  const activeSkus = useMemo(() => {
    const skus = new Set<string>();
    pages.forEach(p => p.slots.forEach(s => { if (s.product?.sku) skus.add(s.product.sku); }));
    return skus;
  }, [pages]);

  const filteredMaster = useMemo(() => masterProductPool.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase())), [masterProductPool, searchTerm]);

  const groupedMaster = useMemo(() => filteredMaster.reduce((acc, p) => {
    const cat = p.category || "Diğer";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, typeof masterProductPool>), [filteredMaster]);

  return (
    <>
      <div className="p-4 border-b border-slate-200 bg-white space-y-4 shadow-sm shrink-0">
        <div><label className="block text-[10px] font-bold text-blue-600 mb-2 uppercase tracking-wider">1. Otomatik Dizilim Excel</label><input ref={layoutFileRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleLayoutFileUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-md" /></div>
        <div className="flex gap-2 w-full"><button onClick={autoFillSlots} disabled={productPool.length === 0} className={`flex-1 font-bold py-2.5 rounded-md text-[11px] transition-all shadow-sm ${productPool.length > 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>Yerleştir</button><button onClick={handleClearAll} className="flex-1 font-bold py-2.5 rounded-md text-[11px] bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm">Temizle</button><button onClick={resetCatalog} className="flex-1 font-bold py-2.5 rounded-md text-[11px] bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm">Sıfırla</button></div>
        <div className="pt-3 border-t border-slate-100"><label className="block text-[10px] font-bold text-purple-600 mb-2 uppercase tracking-wider">2. Tüm Ürün Havuzu Excel</label><input ref={masterFileRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleMasterFileUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer border border-slate-200 rounded-md" /></div>
      </div>
      <div className="flex-1 p-3 bg-slate-100 flex flex-col min-h-0">
        <div className="mb-3 shrink-0 relative"><input type="text" placeholder="Ürün Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" /><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-2.5 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
        <div className="flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
          {masterProductPool.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-medium italic p-4 text-center">Havuz boş. Excel yükleyin.</div>) : (
            Object.entries(groupedMaster).map(([category, products]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-200 rounded text-[11px] font-bold text-slate-700 mb-2"><span>{category}</span><span className="bg-white px-1.5 rounded">{products.length}</span></div>
                <div className="flex flex-col gap-1.5">{products.map((product, index) => {
                  const isActive = activeSkus.has(product.sku || "");
                  return (<div key={`${product.id || product.sku}-${index}`} draggable={!isActive} onDragStart={(e) => { if (!isActive) e.dataTransfer.setData("newProductFromSidebar", JSON.stringify(product)); }} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${isActive ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed grayscale" : "bg-white border-slate-200 hover:border-blue-300 shadow-sm cursor-grab active:cursor-grabbing"}`}><div className="w-8 h-8 bg-slate-50 rounded border flex justify-center items-center overflow-hidden shrink-0">{product.image ? <img src={product.image} className="max-w-full max-h-full object-contain" /> : <span className="text-[8px] text-slate-400 font-bold">Yok</span>}</div><div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-slate-800 truncate leading-none">{product.name}</div><div className="flex justify-between mt-1"><span className="text-[9px] font-semibold text-slate-500">{product.sku}</span><span className="text-[9px] font-bold text-blue-600">{product.price} TL</span></div></div></div>);
                })}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}