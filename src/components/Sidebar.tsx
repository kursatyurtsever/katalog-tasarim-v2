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
import { useUIStore } from "@/store/useUIStore";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Sidebar() {
  const { sidebarState, setSidebarState, editingContent } = useUIStore();

  useEffect(() => {
    if (editingContent) {
      switch (editingContent.contentType) {
        case 'product':
          setSidebarState('settings', 'productInfo', null);
          break;
        case 'banner':
          setSidebarState('settings', 'banner', null);
          break;
        case 'pizza':
          setSidebarState('settings', 'pizza', null);
          break;
        default:
          break;
      }
    }
  }, [editingContent, setSidebarState]);
  const isOpen = sidebarState.activePanel !== null;

  const toggleOpen = () => {
    if (isOpen) {
      setSidebarState(null, null);
    } else {
      setSidebarState("products", null);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "products" || value === "settings" || value === "modules") {
      setSidebarState(value, null);
    }
  };

  return (
    <aside
      className={`relative z-[9999] w-[340px] flex flex-col h-full bg-slate-50 border-l border-slate-200 shrink-0 shadow-xl transition-all duration-300 ease-in-out ${
        isOpen ? "mr-0" : "-mr-[340px]"
      }`}
    >
      <button
        onClick={toggleOpen}
        className="absolute -left-7 top-1/2 -translate-y-1/2 w-7 h-16 bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center rounded-l-md shadow-[-4px_0_10px_rgba(0,0,0,0.1)] border-y border-l border-slate-700 hover:bg-slate-700 transition-colors z-[10000]"
        title={isOpen ? "Paneli Gizle" : "Paneli Göster"}
      >
        {isOpen ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        )}
      </button>

      <Tabs
        value={sidebarState.activePanel ?? ""}
        onValueChange={handleTabChange}
        className="flex flex-col w-full h-full"
      >
        <TabsList className="w-full bg-slate-900 p-2 gap-1 shrink-0 rounded-none">
          <TabsTrigger value="products" className="flex-1 py-2 text-xs font-bold">ÜRÜNLER</TabsTrigger>
          <TabsTrigger value="modules" className="flex-1 py-2 text-xs font-bold">MODÜLLER</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 py-2 text-xs font-bold">AYARLAR</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="flex-1 flex flex-col min-h-0">
          <ProductManagement />
        </TabsContent>
        <TabsContent value="modules" className="flex-1 flex flex-col min-h-0 p-4 bg-slate-50">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Sürüklenebilir Modüller</h3>
          <div className="grid grid-cols-2 gap-3">
            <div draggable onDragStart={(e) => e.dataTransfer.setData("newModuleType", "banner")} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md cursor-grab active:cursor-grabbing flex flex-col items-center gap-2 transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">B</div>
              <span className="text-[11px] font-bold text-slate-700">Banner (Izgara)</span>
            </div>
            <div draggable onDragStart={(e) => e.dataTransfer.setData("newModuleType", "pizza")} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:orange-blue-500 hover:shadow-md cursor-grab active:cursor-grabbing flex flex-col items-center gap-2 transition-all">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">P</div>
              <span className="text-[11px] font-bold text-slate-700">Pizza Fiyat Listesi</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-6 text-center">Modülü tutup katalogdaki \"Serbest Alan\" hücrelerinin içine bırakın.</p>
        </TabsContent>
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 bg-slate-50/50 pb-20">
          <Accordion
            className="w-full"
            value={sidebarState.activeTab ? [sidebarState.activeTab] : []}
            onValueChange={(val) =>
              setSidebarState("settings", val[0] || null, null)
            }
          >
            <AccordionItem value="template">
              <AccordionTrigger>Şablon Ayarları</AccordionTrigger>
              <AccordionContent>
                <TemplateSettingsPanel />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="background">
              <AccordionTrigger>Arkaplan Ayarları</AccordionTrigger>
              <AccordionContent>
                <BackgroundSettingsPanel />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cell">
              <AccordionTrigger>Genel Hücre Ayarları</AccordionTrigger>
              <AccordionContent>
                <GlobalCellSettings />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price">
              <AccordionTrigger>Genel Fiyat Ayarları</AccordionTrigger>
              <AccordionContent>
                <GlobalPriceSettings />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="productInfo">
              <AccordionTrigger>Ürün Bilgisi Ayarları</AccordionTrigger>
              <AccordionContent>
                <ProductInfoSettings />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="customCell">
              <AccordionTrigger>Özel Hücre Ayarları</AccordionTrigger>
              <AccordionContent>
                <CustomCellSettings />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="banner">
              <AccordionTrigger>Banner Ayarları</AccordionTrigger>
              <AccordionContent>
                <BannerSettingsPanel />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pizza">
              <AccordionTrigger>Pizza Dilimi Ayarları</AccordionTrigger>
              <AccordionContent>
                <PizzaSettingsPanel />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
