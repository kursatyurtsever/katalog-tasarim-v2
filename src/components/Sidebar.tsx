"use client";

import { useEffect } from "react";
import { ProductManagement } from "./sidebar-panels/ProductManagement";
import { GlobalCellSettings } from "./sidebar-panels/GlobalCellSettings";
import { GlobalPriceSettings } from "./sidebar-panels/GlobalPriceSettings";
import { CustomCellSettings } from "./sidebar-panels/CustomCellSettings";
import { ProductInfoSettings } from "./sidebar-panels/ProductInfoSettings";
import { PizzaSettingsPanel } from "./sidebar-panels/PizzaSettingsPanel";
import { TemplateSettingsPanel } from "./sidebar-panels/TemplateSettingsPanel";
import { BannerSettingsPanel } from "./sidebar-panels/BannerSettingsPanel";
import { BackgroundSettingsPanel } from "./sidebar-panels/BackgroundSettingsPanel";
import { useCatalogStore } from "@/store/useCatalogStore";

export function Sidebar() {
  const { sidebarState, setSidebarState } = useCatalogStore();
  // Yan panel açık/kapalı durumu (varsayılan açık)
  const isOpen = sidebarState.activePanel !== null; // products/settings/customCell/price vs. için açık; null ise kapalı

  // Paneli aç/kapa kulakçığı: panel kapalıysa activePanel=null; açarken mevcut state korunur
  const toggleOpen = () => {
    if (isOpen) {
      setSidebarState(null, null);
    } else {
      // yeniden açarken en son panel bilgisi yoksa products ile aç
      setSidebarState("products", null);
    }
  };

  return (
    // YENİ: margin-right ile pürüzsüz kayma animasyonu
    <aside 
      className={`relative z-[9999] w-[340px] flex flex-col h-full bg-slate-50 border-l border-slate-200 shrink-0 shadow-xl transition-all duration-300 ease-in-out ${
        isOpen ? "mr-0" : "-mr-[340px]"
      }`}
    >
      
      {/* YENİ: Sola taşan Aç/Kapat Kulakçığı */}
      <button
        onClick={toggleOpen}
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
        <button onClick={() => setSidebarState("products", null)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${sidebarState.activePanel === "products" ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner" : "bg-transparent text-slate-400 hover:text-slate-200"}`}>
          ÜRÜN YÖNETİMİ
        </button>
        <button onClick={() => setSidebarState("settings", sidebarState.activeTab)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${sidebarState.activePanel === "settings" ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner" : "bg-transparent text-slate-400 hover:text-slate-200"}`}>
          AYARLAR
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {sidebarState.activePanel === "products" && <ProductManagement />}
        {sidebarState.activePanel === "settings" && (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 pb-20">
            <TemplateSettingsPanel isOpen={sidebarState.activeTab === "template"} onToggle={() => setSidebarState("settings", sidebarState.activeTab === "template" ? null : "template")} />
            <BackgroundSettingsPanel isOpen={sidebarState.activeTab === "background"} onToggle={() => setSidebarState("settings", sidebarState.activeTab === "background" ? null : "background")} />
            
            <GlobalCellSettings isOpen={sidebarState.activeTab === "cell"} onToggle={() => setSidebarState("settings", sidebarState.activeTab === "cell" ? null : "cell")} />
            <GlobalPriceSettings isOpen={sidebarState.activeTab === "price"} onToggle={() => setSidebarState("settings", sidebarState.activeTab === "price" ? null : "price")} />
            
            <ProductInfoSettings isOpen={sidebarState.activeTab === "productInfo"} onToggle={() => setSidebarState("settings", sidebarState.activeTab === "productInfo" ? null : "productInfo")} />
            <CustomCellSettings isOpen={sidebarState.activeTab === "customCell"} onToggle={() => setSidebarState("settings", sidebarState.activeTab === "customCell" ? null : "customCell")} />
            
            <BannerSettingsPanel isOpen={sidebarState.activeTab === "banner"} onToggle={() => setSidebarState("settings", sidebarState.activeTab === "banner" ? null : "banner")} />
            <PizzaSettingsPanel isOpen={sidebarState.activeTab === "pizza"} onToggle={() => setSidebarState("settings", sidebarState.activeTab === "pizza" ? null : "pizza")} />
          </div>
        )}
      </div>
    </aside>
  );
}
