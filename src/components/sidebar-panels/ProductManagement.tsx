"use client";

import { useState, useMemo, useRef } from "react";
import { useCatalogStore } from "../../store/useCatalogStore";
import { useLayerStore } from "../../store/useLayerStore";
import { useBannerStore } from "../../store/useBannerStore";

import * as XLSX from "xlsx";

export function ProductManagement() {
  const { productPool, setProductPool, masterProductPool, setMasterProductPool, formas, activeFormaId, autoFillSlots, clearProducts, resetCatalog } = useCatalogStore();
  const activeForma = formas.find((f) => f.id === activeFormaId);
  const pages = activeForma?.pages || [];
  const [searchTerm, setSearchTerm] = useState("");
  const layoutFileRef = useRef<HTMLInputElement>(null);
  const masterFileRef = useRef<HTMLInputElement>(null);
  const projectFileRef = useRef<HTMLInputElement>(null);
  const [isLayoutDragging, setIsLayoutDragging] = useState(false);
  const [isMasterDragging, setIsMasterDragging] = useState(false);

  const handleExportProject = () => {
    const catalogState = useCatalogStore.getState();
    const layerState = useLayerStore.getState();
    const bannerState = useBannerStore.getState();

    const projectData = {
      catalog: {
        activeTemplate: catalogState.activeTemplate,
        formas: catalogState.formas,
        globalSettings: catalogState.globalSettings,
        productPool: catalogState.productPool,
        masterProductPool: catalogState.masterProductPool,
      },
      layers: layerState.layers,
      banner: {
        bannerSettings: bannerState.bannerSettings
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `katalog-proje-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const projectData = JSON.parse(evt.target?.result as string);
        
        if (projectData.catalog) {
          useCatalogStore.setState({
            activeTemplate: projectData.catalog.activeTemplate,
            formas: projectData.catalog.formas,
            globalSettings: projectData.catalog.globalSettings,
            productPool: projectData.catalog.productPool || [],
            masterProductPool: projectData.catalog.masterProductPool || [],
          });
        }
        
        if (projectData.layers) {
          useLayerStore.setState({ layers: projectData.layers });
        }
        
        if (projectData.banner) {
          useBannerStore.setState({ bannerSettings: projectData.banner.bannerSettings });
        }
        
        alert("Proje başarıyla yüklendi!");
      } catch {
        alert("Geçersiz veya bozuk proje dosyası!");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const processLayoutFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = rows.map((row: any, i: number) => ({
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

  const handleLayoutFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processLayoutFile(e.target.files[0]);
    if (layoutFileRef.current) layoutFileRef.current.value = "";
  };

  const processMasterFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = rows.map((row: any, i: number) => ({
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

  const handleMasterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processMasterFile(e.target.files[0]);
    if (masterFileRef.current) masterFileRef.current.value = "";
  };

  const handleClearAll = () => {
    clearProducts(); setProductPool([]); setMasterProductPool([]); setSearchTerm("");
    if (layoutFileRef.current) layoutFileRef.current.value = "";
    if (masterFileRef.current) masterFileRef.current.value = "";
  };

  const activeSkus = useMemo(() => {
    const skus = new Set<string>();
    // Sadece aktif olan 'pages' üzerinde değil, tüm 'formas' üzerinde geziyoruz
    formas.forEach(f => {
      f.pages.forEach(p => {
        p.slots.forEach(s => { 
          if (s.product?.sku) skus.add(s.product.sku); 
        });
      });
    });
    return skus;
  }, [formas]);

  const filteredMaster = useMemo(() => masterProductPool.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase())), [masterProductPool, searchTerm]);

  const groupedMaster = useMemo(() => filteredMaster.reduce((acc, p) => {
    const cat = p.category || "Diğer";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, typeof masterProductPool>), [filteredMaster]);

  return (
    <>
      <div className="p-4 border-b border-(--border-color) bg-(--bg-panel) space-y-4 shadow-sm shrink-0">
        <div>
          <label className="section-title block mb-2 text-primary">1. Otomatik Dizilim Excel</label>
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsLayoutDragging(true); }}
            onDragLeave={() => setIsLayoutDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsLayoutDragging(false); if (e.dataTransfer.files?.[0]) processLayoutFile(e.dataTransfer.files[0]); }}
            onClick={() => layoutFileRef.current?.click()}
            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-all shadow-sm ${isLayoutDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-300'}`}
          >
            <div className="text-[11px] font-bold text-slate-600 mb-1">Excel dosyasını buraya sürükleyin</div>
            <div className="text-[9px] text-slate-400">veya seçmek için tıklayın (.xlsx, .xls, .csv)</div>
          </div>
          <input ref={layoutFileRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleLayoutFileUpload} className="hidden" />
        </div>
        <div className="flex gap-1 bg-slate-50 p-2 rounded border border-slate-200 shadow-sm w-full">
          <button 
            onClick={() => autoFillSlots()} 
            disabled={productPool.length === 0} 
            className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-colors ${productPool.length > 0 ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}`}
          >
            Yerleştir
          </button>
          <button 
            onClick={handleClearAll} 
            className="flex-1 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-200 transition-colors"
          >
            Temizle
          </button>
          <button 
            onClick={() => resetCatalog()} 
            className="flex-1 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-[10px] font-bold hover:bg-red-100 transition-colors"
          >
            Sıfırla
          </button>
        </div>
        
        <div className="pt-3 border-t border-(--border-color)">
          <label className="section-title block mb-2 text-primary">2. Tüm Ürün Havuzu Excel</label>
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsMasterDragging(true); }}
            onDragLeave={() => setIsMasterDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsMasterDragging(false); if (e.dataTransfer.files?.[0]) processMasterFile(e.dataTransfer.files[0]); }}
            onClick={() => masterFileRef.current?.click()}
            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-all shadow-sm ${isMasterDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-300'}`}
          >
            <div className="text-[11px] font-bold text-slate-600 mb-1">Excel dosyasını buraya sürükleyin</div>
            <div className="text-[9px] text-slate-400">veya seçmek için tıklayın (.xlsx, .xls, .csv)</div>
          </div>
          <input ref={masterFileRef} type="file" accept=".xlsx, .xls, .csv" onChange={handleMasterFileUpload} className="hidden" />
        </div>
        
        {/* Proje Kaydet / Yükle */}
        <div className="pt-3 border-t border-(--border-color)">
          <label className="section-title block mb-2 text-primary">3. Proje Yönetimi (Geçici)</label>
          <div className="flex gap-1 bg-slate-50 p-2 rounded border border-slate-200 shadow-sm w-full">
            <button 
              onClick={handleExportProject} 
              className="flex-1 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors"
            >
              Projeyi Kaydet
            </button>
            <button 
              onClick={() => projectFileRef.current?.click()} 
              className="flex-1 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-bold hover:bg-green-100 transition-colors"
            >
              Projeyi Yükle
            </button>
            <input type="file" accept=".json" ref={projectFileRef} onChange={handleImportProject} className="hidden" />
          </div>
        </div>
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
                  return (<div key={`${product.id || product.sku}-${index}`} draggable={!isActive} onDragStart={(e) => { if (!isActive) e.dataTransfer.setData("newProductFromSidebar", JSON.stringify(product)); }} className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${isActive ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed grayscale" : "bg-white border-slate-200 hover:border-blue-300 shadow-sm cursor-grab active:cursor-grabbing"}`}><div className="w-8 h-8 bg-slate-50 rounded border flex justify-center items-center overflow-hidden shrink-0">{product.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={product.image} alt={product.name || "Ürün resmi"} className="max-w-full max-h-full object-contain" /> : <span className="text-[8px] text-slate-400 font-bold">Yok</span>}</div><div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-slate-800 truncate leading-none">{product.name}</div><div className="flex justify-between mt-1"><span className="text-[9px] font-semibold text-slate-500">{product.sku}</span><span className="text-[9px] font-bold text-blue-600">{product.price} TL</span></div></div></div>);
                })}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
