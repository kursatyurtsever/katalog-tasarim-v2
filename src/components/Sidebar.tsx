"use client";

import { useState, useEffect } from "react";
import { ProductManagement } from "./sidebar-panels/ProductManagement";
import { GlobalCellSettings } from "./sidebar-panels/GlobalCellSettings";
import { GlobalPriceSettings } from "./sidebar-panels/GlobalPriceSettings";
import { CustomCellSettings } from "./sidebar-panels/CustomCellSettings";
import { ProductInfoSettings } from "./sidebar-panels/ProductInfoSettings";
import { PizzaSettingsPanel } from "./sidebar-panels/PizzaSettingsPanel";
import { TemplateSettingsPanel } from "./sidebar-panels/TemplateSettingsPanel";
import { BannerSettingsPanel } from "./sidebar-panels/BannerSettingsPanel";

export function Sidebar() {
  // YENİ: Yan panelin açık/kapalı durumunu tutan state (Varsayılan olarak açık başlar)
  const [isOpen, setIsOpen] = useState(true);

  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");
  const [openAcc, setOpenAcc] = useState<string | null>("template"); 

  // YENİ: ContextualBar'dan gelen "Detaylı Ayarlar" olayını dinliyoruz
  useEffect(() => {
    const handleOpenPanel = (e: any) => {
      setIsOpen(true); // Panel kapalıysa hemen aç
      setActiveTab("settings"); // Sekmeyi "Ayarlar"a getir
      setOpenAcc(e.detail); // Hangi butona basıldıysa o akordeonu aç
    };
    window.addEventListener('open-sidebar-panel', handleOpenPanel);
    return () => window.removeEventListener('open-sidebar-panel', handleOpenPanel);
  }, []);

  return (
    // YENİ: margin-right ile pürüzsüz kayma animasyonu
    <aside 
      className={`relative z-[9999] w-[340px] flex flex-col h-full bg-slate-50 border-l border-slate-200 shrink-0 shadow-xl transition-all duration-300 ease-in-out ${
        isOpen ? "mr-0" : "-mr-[340px]"
      }`}
    >
      
      {/* YENİ: Sola taşan Aç/Kapat Kulakçığı */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-7 top-1/2 -translate-y-1/2 w-7 h-16 bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-l-md shadow-[-4px_0_10px_rgba(0,0,0,0.1)] border-y border-l border-slate-700 hover:bg-slate-700 transition-colors z-[10000]"
        title={isOpen ? "Paneli Gizle" : "Paneli Göster"}
      >
        {isOpen ? (
          // Sağa Ok (Gizle)
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        ) : (
          // Sola Ok (Göster)
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        )}
      </button>

      <div className="flex w-full bg-slate-900 p-2 gap-1 shrink-0">
        <button onClick={() => setActiveTab("products")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "products" ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner" : "bg-transparent text-slate-400 hover:text-slate-200"}`}>
          ÜRÜN YÖNETİMİ
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "settings" ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner" : "bg-transparent text-slate-400 hover:text-slate-200"}`}>
          AYARLAR
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 pb-20">
            <TemplateSettingsPanel isOpen={openAcc === "template"} onToggle={() => setOpenAcc(openAcc === "template" ? null : "template")} />
            
            <GlobalCellSettings isOpen={openAcc === "cell"} onToggle={() => setOpenAcc(openAcc === "cell" ? null : "cell")} />
            <GlobalPriceSettings isOpen={openAcc === "price"} onToggle={() => setOpenAcc(openAcc === "price" ? null : "price")} />
            
            <ProductInfoSettings isOpen={openAcc === "productInfo"} onToggle={() => setOpenAcc(openAcc === "productInfo" ? null : "productInfo")} />
            <CustomCellSettings isOpen={openAcc === "customCell"} onToggle={() => setOpenAcc(openAcc === "customCell" ? null : "customCell")} />
            
            <BannerSettingsPanel isOpen={openAcc === "banner"} onToggle={() => setOpenAcc(openAcc === "banner" ? null : "banner")} />
            <PizzaSettingsPanel isOpen={openAcc === "pizza"} onToggle={() => setOpenAcc(openAcc === "pizza" ? null : "pizza")} />
          </div>
        )}
      </div>
    </aside>
  );
}