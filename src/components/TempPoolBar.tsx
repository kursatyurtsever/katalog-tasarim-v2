"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { Archive, Trash, ArrowUUpLeft, Broom, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export function TempPoolBar() {
  const { isTempPoolOpen, toggleTempPool, contextualBarSelectedPages } = useUIStore();
  const { tempProductPool, removeFromTempPool, clearTempPool, dumpPageToTempPool, returnProductFromTempPool, activeFormaId, formas } = useCatalogStore();
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsOver(false);
    const sPage = parseInt(e.dataTransfer.getData("sourcePage"));
    const sIndex = parseInt(e.dataTransfer.getData("sourceIndex"));
    if (!isNaN(sPage)) {
      const page = useCatalogStore.getState().getActivePages().find(p => p.pageNumber === sPage);
      const slot = page?.slots[sIndex];
      if (slot && slot.product) {
        useCatalogStore.getState().moveSlotToTempPool(sPage, slot.id);
      }
      return;
    }
    const newProductData = e.dataTransfer.getData("newProductFromSidebar");
    if (newProductData) useCatalogStore.getState().addToTempPool(JSON.parse(newProductData));
  };

  const handleDumpPage = () => {
    const currentForma = formas.find(f => f.id === activeFormaId);
    if (!currentForma) return;
    const targetPages = contextualBarSelectedPages.length > 0 ? contextualBarSelectedPages : currentForma.pages.map(p => p.pageNumber);
    if (window.confirm(`Seçili sayfanın tüm ürünleri yedeğe alınacak. Onaylıyor musunuz?`)) {
      targetPages.forEach(pNum => dumpPageToTempPool(pNum));
    }
  };

  return (
    <TooltipProvider delay={150}>
      <div 
        className="flex h-full relative z-1000 shrink-0"
        onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
      >
        {/* 1. SOL SABİT İKON ŞERİDİ (TOOLBAR) */}
        <div className={`w-16 h-full bg-white border-r border-slate-200 flex flex-col items-center py-4 z-20 shrink-0 transition-colors ${isOver && !isTempPoolOpen ? 'bg-blue-50' : ''} ${!isTempPoolOpen ? 'rounded-l-xl rounded-r-xl shadow-xl' : 'rounded-l-xl'}`}>
          
          {/* Havuz İkonu */}
          <button 
            onClick={toggleTempPool}
            className={`relative p-3 rounded-xl transition-all outline-none ${isTempPoolOpen ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            title="Yedek Havuz"
          >
            <Archive size={28} weight={isTempPoolOpen ? "fill" : "duotone"} />
            {tempProductPool.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {tempProductPool.length}
              </span>
            )}
          </button>

          {/* Ayırıcı Çizgi (Gelecek ikonlar için hazırlık) */}
          <div className="w-8 h-px bg-slate-200 my-3 shrink-0" />
          
          {/* Yeni modül ikonları gelecekte buraya eklenecek */}

        </div>

        {/* 2. AÇILIR KAPANIR ÇEKMECE PANELİ (SLIDE-OUT) */}
        <div className={`bg-slate-50 relative h-full transition-all duration-300 ease-in-out flex flex-col overflow-visible shadow-xl rounded-r-xl ${isTempPoolOpen ? "w-37.5 border-r border-y border-slate-200" : "w-0 border-none"}`}>
          
          {/* Mavi Kapatma/Açma Sekmesi (Artık her zaman görünür) */}
          <button 
            onClick={toggleTempPool}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-12 bg-primary text-white hover:bg-blue-700 flex items-center justify-center rounded-r-md shadow-md border-y border-r border-primary transition-colors z-50 outline-none"
            title={isTempPoolOpen ? "Paneli Gizle" : "Paneli Göster"}
          >
            {isTempPoolOpen ? <CaretLeft size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
          </button>

          {/* İçerik Sarıcısı: Kapalıyken pointer-events-none ile etkileşimi keser */}
          <div className={`w-37.5 flex flex-col h-full overflow-hidden transition-opacity duration-300 ${isTempPoolOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Panel Üst (Header) */}
            <div className="p-2 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 h-12">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest pl-1">
                HAVUZ
              </span>
              <div className="flex gap-1 pr-1">
                <button onClick={handleDumpPage} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded transition-colors" title="Sayfayı havuza aktar"><Broom size={16} weight="bold" /></button>
                <button onClick={() => { if(window.confirm("Tümü silinsin mi?")) clearTempPool() }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Havuzu temizle" disabled={tempProductPool.length === 0}><Trash size={16} weight="bold" /></button>
              </div>
            </div>

            {/* Ürünler Listesi (Kompakt: Resim + SKU) */}
            <div className={`flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 custom-scrollbar transition-colors ${isOver ? 'bg-blue-50/50 shadow-inner' : ''}`}>
              {tempProductPool.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2 opacity-60">
                  <Archive size={32} weight="thin" />
                  <span className="text-[10px] leading-tight font-medium">Sürükleyip bırakın.</span>
                </div>
              ) : (
                tempProductPool.map((product, index) => (
                  <Tooltip key={`${product.sku}-${index}`}>
                    <TooltipTrigger render={<div className="w-full" />}>
                      <div 
                        draggable 
                        onDragStart={(e) => { e.dataTransfer.setData("sourceTempPoolSku", product.sku!); }} 
                        className="group relative flex items-center bg-white rounded border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 transition-all w-full p-1 h-12"
                      >
                        {/* Ürün Görseli (Sol / Sarı Kısım) */}
                        <div className="w-10 h-10 bg-slate-50 rounded flex items-center justify-center shrink-0 border border-slate-100 p-0.5">
                          {product.image ? (
                            <img src={product.image} className="w-full h-full object-contain" alt={product.sku} />
                          ) : (
                            <span className="text-[7px] text-slate-300 font-bold uppercase">Yok</span>
                          )}
                        </div>

                        {/* Ürün Kodu / SKU (Sağ / Kırmızı Kısım) */}
                        <div className="flex-1 min-w-0 pl-2 pr-1 text-left">
                          <div className="text-[10px] font-bold text-slate-700 truncate">{product.sku}</div>
                        </div>

                        {/* Hover Aksiyonları (Üzerine Gelince Çıkan Butonlar) */}
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          {product.originalPage && product.originalSlotId && (
                            <button onClick={(e) => { e.stopPropagation(); returnProductFromTempPool(product.sku!); }} className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors shadow-sm" title={`Eski yerine gönder (Sayfa ${product.originalPage})`}><ArrowUUpLeft size={12} weight="bold" /></button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); removeFromTempPool(product.sku!); }} className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm" title="Sil"><Trash size={12} weight="bold" /></button>
                        </div>
                      </div>
                    </TooltipTrigger>
                    
                    {/* Tooltip Hover Kartı (Paneli taşan, beyaz zeminli ve metni sarmalayan şık bilgi kartı) */}
                    <TooltipContent side="right" sideOffset={15} className="w-56 bg-white text-slate-800! border border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] rounded-xl p-3 z-99999 flex flex-col">
                      <div className="w-full h-32 bg-white flex items-center justify-center mb-2">
                        {product.image ? (
                          <img src={product.image} className="max-w-full max-h-full object-contain" alt={product.name} />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-xs text-slate-400 rounded border border-dashed border-slate-200">Görsel Yok</div>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 leading-snug whitespace-normal wrap-break-word">{product.name}</div>
                      <div className="text-[9px] text-slate-500 mt-1">{product.sku}</div>
                      <div className="text-[12px] font-black text-blue-600 mt-1.5">{product.price} TL</div>
                    </TooltipContent>
                  </Tooltip>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}