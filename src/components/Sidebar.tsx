"use client";

import { useState } from "react";
import { ProductManagement } from "./sidebar-panels/ProductManagement";
import { GlobalCellSettings } from "./sidebar-panels/GlobalCellSettings";
import { GlobalPriceSettings } from "./sidebar-panels/GlobalPriceSettings";
import { CustomCellSettings } from "./sidebar-panels/CustomCellSettings";
import { PizzaSettingsPanel } from "./sidebar-panels/PizzaSettingsPanel";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");
  const [openAcc, setOpenAcc] = useState<string | null>("customCell");

  return (
    <aside className="w-[340px] flex flex-col h-full bg-slate-50 border-l border-slate-200 shrink-0 shadow-xl overflow-hidden">
      <div className="flex w-full bg-slate-900 p-2 gap-1 shrink-0">
        <button onClick={() => setActiveTab("products")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "products" ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner" : "bg-transparent text-slate-400 hover:text-slate-200"}`}>
          ÜRÜN YÖNETİMİ
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "settings" ? "bg-slate-800 text-white border-b-2 border-blue-500 shadow-inner" : "bg-transparent text-slate-400 hover:text-slate-200"}`}>
          AYARLAR
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 pb-20">
            <GlobalCellSettings isOpen={openAcc === "cell"} onToggle={() => setOpenAcc(openAcc === "cell" ? null : "cell")} />
            <GlobalPriceSettings isOpen={openAcc === "price"} onToggle={() => setOpenAcc(openAcc === "price" ? null : "price")} />
            <CustomCellSettings isOpen={openAcc === "customCell"} onToggle={() => setOpenAcc(openAcc === "customCell" ? null : "customCell")} />

            {/* Yeni Pizza Paneli */}
            <PizzaSettingsPanel isOpen={openAcc === "pizza"} onToggle={() => setOpenAcc(openAcc === "pizza" ? null : "pizza")} />
          </div>
        )}
      </div>
    </aside>
  );
}