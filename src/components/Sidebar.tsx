"use client";

import { useState, useMemo, useEffect } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import * as XLSX from "xlsx";

export function Sidebar() {
  const productPool = useCatalogStore((state) => state.productPool);
  const setProductPool = useCatalogStore((state) => state.setProductPool);
  
  const masterProductPool = useCatalogStore((state) => state.masterProductPool);
  const setMasterProductPool = useCatalogStore((state) => state.setMasterProductPool);
  
  const pages = useCatalogStore((state) => state.pages);
  const globalSettings = useCatalogStore((state) => state.globalSettings);
  const setGlobalSettings = useCatalogStore((state) => state.setGlobalSettings);
  const autoFillSlots = useCatalogStore((state) => state.autoFillSlots);
  const clearProducts = useCatalogStore((state) => state.clearProducts);
  const resetCatalog = useCatalogStore((state) => state.resetCatalog);

  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Akordeon menü için state (varsayılan olarak ilk sekme açık)
  const [openAcc, setOpenAcc] = useState<string | null>("cell");

  useEffect(() => {
    if (masterProductPool.length === 0) {
      const mockData = [
        { id: "1", sku: "01", name: "Pide Brot", price: "2,50", category: "102 - Vorspeisen (5)", image: "/images/products/01.png" },
        { id: "2", sku: "02", name: "Zaziki", price: "3,50", category: "102 - Vorspeisen (5)", image: "/images/products/02.png" },
        { id: "3", sku: "03", name: "Kräuterbutter", price: "1,50", category: "102 - Vorspeisen (5)", image: "/images/products/03.png" },
        { id: "4", sku: "04", name: "Tzatziki Groß", price: "4,50", category: "102 - Vorspeisen (5)", image: "/images/products/04.png" },
        { id: "5", sku: "05", name: "Oliven", price: "3,00", category: "102 - Vorspeisen (5)", image: "/images/products/05.png" },
        { id: "6", sku: "10", name: "Pizza Margherita", price: "8,00", category: "201 - Pizzalar (2)", image: "/images/products/10.png" },
        { id: "7", sku: "11", name: "Pizza Salami", price: "9,00", category: "201 - Pizzalar (2)", image: "/images/products/11.png" },
      ];
      setMasterProductPool(mockData);
    }
  }, [masterProductPool.length, setMasterProductPool]);

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

  const activeSkus = useMemo(() => {
    const skus = new Set<string>();
    pages.forEach(p => p.slots.forEach(s => {
      if (s.product && s.product.sku) skus.add(s.product.sku);
    }));
    return skus;
  }, [pages]);

  const filteredMaster = useMemo(() => {
    if (!searchTerm) return masterProductPool;
    return masterProductPool.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [masterProductPool, searchTerm]);

  const groupedMaster = useMemo(() => {
    return filteredMaster.reduce((acc, product) => {
      const cat = product.category || "Diğer Ürünler";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, typeof masterProductPool>);
  }, [filteredMaster]);

  return (
    <aside className="w-[340px] h-full bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 shadow-xl">
      <div className="flex w-full bg-slate-900 p-2 gap-1 shrink-0">
        <button onClick={() => setActiveTab("products")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "products" ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner" : "bg-transparent text-slate-400 hover:text-slate-200"}`}>
          ÜRÜN YÖNETİMİ
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "settings" ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner" : "bg-transparent text-slate-400 hover:text-slate-200"}`}>
          AYARLAR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {activeTab === "products" && (
          <>
            <div className="p-4 border-b border-slate-200 bg-white space-y-4 shadow-sm shrink-0">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Excel'den Broşür Dizilimi Yükle
                </label>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer" />
              </div>
              <div className="flex gap-2 w-full">
                <button onClick={autoFillSlots} disabled={productPool.length === 0} className={`flex-1 font-bold py-2.5 rounded-md text-[11px] transition-all shadow-sm ${productPool.length > 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
                  Yerleştir
                </button>
                <button onClick={clearProducts} className="flex-1 font-bold py-2.5 rounded-md text-[11px] bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm" title="Sadece ürünleri temizle, hücreleri koru">
                  Temizle
                </button>
                <button onClick={resetCatalog} className="flex-1 font-bold py-2.5 rounded-md text-[11px] bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm" title="Tasarımı ve ürünleri tamamen sıfırla">
                  Sıfırla
                </button>
              </div>
              {productPool.length > 0 && (
                <div className="text-[10px] text-center text-slate-500 font-medium">Excel'den {productPool.length} ürün hazırda bekliyor.</div>
              )}
            </div>

            <div className="flex-1 p-3 bg-slate-100 flex flex-col">
              <div className="mb-3 shrink-0 relative">
                <input type="text" placeholder="Ürün Ara... (İsim veya Kod)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm" />
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-2.5 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {Object.entries(groupedMaster).map(([category, products]) => (
                  <div key={category} className="mb-4">
                    <div className="flex items-center justify-between px-2 py-1.5 bg-slate-200 rounded text-[11px] font-bold text-slate-700 mb-2">
                      <span>{category.split(' - ')[1] || category}</span>
                      <span className="bg-white px-1.5 rounded">{products.length}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {products.map((product) => {
                        const isActive = activeSkus.has(product.sku || "");
                        return (
                          <div
                            key={product.id || product.sku}
                            draggable={!isActive}
                            onDragStart={(e) => {
                              if (!isActive) e.dataTransfer.setData("newProductFromSidebar", JSON.stringify(product));
                            }}
                            className={`flex items-center gap-2 p-1.5 rounded-md border transition-all ${
                              isActive ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed grayscale" : "bg-white border-slate-200 hover:border-blue-300 shadow-sm cursor-grab active:cursor-grabbing"
                            }`}
                          >
                            <div className="w-8 h-8 bg-slate-50 rounded border flex justify-center items-center overflow-hidden shrink-0">
                              {product.image ? <img src={product.image} className="max-w-full max-h-full object-contain" /> : <span className="text-[8px] text-slate-400 font-bold uppercase">Yok</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-slate-800 truncate leading-none">{product.name}</div>
                              <div className="flex justify-between mt-1">
                                <span className="text-[9px] font-semibold text-slate-500">{product.sku}</span>
                                <span className="text-[9px] font-bold text-blue-600">{product.price} TL</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "settings" && (
          <div className="p-4 bg-slate-50/50 h-full overflow-y-auto custom-scrollbar">
            
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden mb-20">
              {/* ANA AKORDEON BAŞLIĞI */}
              <button 
                onClick={() => setOpenAcc(openAcc === "cell" ? null : "cell")} 
                className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Hücre Ayarları</span>
                <span className="text-white text-xs">{openAcc === "cell" ? "▲" : "▼"}</span>
              </button>
              
              {openAcc === "cell" && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-6">
                  
                  {/* --- 1. KENAR VE BOŞLUK --- */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Kenar ve Boşluk</h4>
                    
                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer bg-white p-2 rounded border border-slate-200">
                      <input type="checkbox" checked={globalSettings.linkRadius} onChange={(e) => setGlobalSettings({ linkRadius: e.target.checked })} className="accent-blue-600" />
                      Köşeleri Birlikte Değiştir
                    </label>
                    
                    {globalSettings.linkRadius ? (
                      <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-slate-200">
                        <span className="text-[10px] font-medium text-slate-500 w-16">Yarıçap</span>
                        <input type="range" min="0" max="50" value={globalSettings.radiusTL} onChange={(e) => { const v = parseInt(e.target.value); setGlobalSettings({ radiusTL: v, radiusTR: v, radiusBR: v, radiusBL: v }); }} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.radiusTL}</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 bg-white p-2 rounded border border-slate-200">
                        {['TL', 'TR', 'BL', 'BR'].map((pos) => (
                          <div key={pos} className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-medium text-slate-400 w-4">{pos}</span>
                            <input type="range" min="0" max="50" value={(globalSettings as any)[`radius${pos}`]} onChange={(e) => setGlobalSettings({ [`radius${pos}`]: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            <span className="text-[9px] font-bold text-slate-600 w-4 text-right">{Math.floor((globalSettings as any)[`radius${pos}`])}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 w-24">Hücre Boşluğu</span>
                      <input type="range" min="0" max="10" step="0.5" value={globalSettings.gridGap} onChange={(e) => setGlobalSettings({ gridGap: parseFloat(e.target.value) })} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      <span className="text-[10px] font-black text-blue-600 w-8 text-right">{globalSettings.gridGap}mm</span>
                    </div>
                  </div>

                  {/* --- 2. TİPOGRAFİ (YAZI) --- */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Tipografi (Ürün İsmi)</h4>
                    
                    <div className="grid grid-cols-2 gap-3 bg-white p-2 rounded border border-slate-200">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Font Ailesi</span>
                        <select value={globalSettings.fontFamily} onChange={(e) => setGlobalSettings({ fontFamily: e.target.value })} className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none focus:border-blue-500">
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Kalınlık</span>
                        <select value={globalSettings.fontWeight} onChange={(e) => setGlobalSettings({ fontWeight: e.target.value })} className="text-[10px] p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-700 outline-none focus:border-blue-500">
                          <option value="400">Normal (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semi Bold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 bg-white p-2 rounded border border-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-slate-500 w-20">Punto (Size)</span>
                        <input type="range" min="8" max="32" value={globalSettings.fontSize} onChange={(e) => setGlobalSettings({ fontSize: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.fontSize}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-slate-500 w-20">Harf Aralığı (VA)</span>
                        <input type="range" min="-5" max="10" step="0.5" value={globalSettings.letterSpacing} onChange={(e) => setGlobalSettings({ letterSpacing: parseFloat(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.letterSpacing}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-slate-500 w-20">Satır Aralığı</span>
                        <input type="range" min="0.8" max="2.0" step="0.1" value={globalSettings.lineHeight} onChange={(e) => setGlobalSettings({ lineHeight: parseFloat(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{globalSettings.lineHeight}</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600">Yazı Rengi</span>
                      <input type="color" value={globalSettings.fontColor} onChange={(e) => setGlobalSettings({ fontColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded border border-slate-200 space-y-2 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-500 block">Yatay Hizalama</span>
                        <div className="flex flex-col bg-slate-50 rounded p-1 gap-1 border border-slate-100 flex-1">
                          {['left', 'center', 'right', 'justify'].map((align) => (
                            <button key={align} onClick={() => setGlobalSettings({ textAlign: align as any })} className={`w-full py-1 text-[9px] font-bold rounded transition-all ${globalSettings.textAlign === align ? 'bg-white shadow border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                              {align === 'left' ? 'Sol' : align === 'center' ? 'Orta' : align === 'right' ? 'Sağ' : 'Yasla'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded border border-slate-200 space-y-2 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-500 block">Dikey Hizalama</span>
                        <div className="flex flex-col bg-slate-50 rounded p-1 gap-1 border border-slate-100 flex-1">
                          {['top', 'middle', 'bottom'].map((val) => (
                            <button key={val} onClick={() => setGlobalSettings({ textVerticalAlign: val as any })} className={`w-full py-1 text-[9px] font-bold rounded transition-all ${globalSettings.textVerticalAlign === val ? 'bg-white shadow border border-slate-200 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                              {val === 'top' ? 'Üst' : val === 'middle' ? 'Orta' : 'Alt'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- 3. RENK VE GÖRÜNÜM --- */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Renk ve Görünüm</h4>
                    
                    <div className="bg-white p-2 border border-slate-200 rounded space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600">Dolgu Rengi (Zemin)</span>
                        <input type="color" value={globalSettings.bgColor} onChange={(e) => setGlobalSettings({ bgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-[9px] font-medium text-slate-400 w-16">Saydamlık</span>
                        <input type="range" min="0" max="100" value={globalSettings.bgOpacity} onChange={(e) => setGlobalSettings({ bgOpacity: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <span className="text-[9px] font-bold text-slate-500 w-8 text-right">%{globalSettings.bgOpacity}</span>
                      </div>
                    </div>

                    <div className="bg-white p-2 border border-slate-200 rounded space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600">Kontur Rengi</span>
                        <input type="color" value={globalSettings.borderColor} onChange={(e) => setGlobalSettings({ borderColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-[9px] font-medium text-slate-400 w-16">Saydamlık</span>
                        <input type="range" min="0" max="100" value={globalSettings.borderOpacity} onChange={(e) => setGlobalSettings({ borderOpacity: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <span className="text-[9px] font-bold text-slate-500 w-8 text-right">%{globalSettings.borderOpacity}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-[9px] font-medium text-slate-400 w-16">Kalınlık</span>
                        <input type="range" min="0" max="10" step="0.5" value={globalSettings.borderWidth} onChange={(e) => setGlobalSettings({ borderWidth: parseFloat(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <span className="text-[9px] font-bold text-slate-500 w-8 text-right">{globalSettings.borderWidth}px</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </aside>
  );
}