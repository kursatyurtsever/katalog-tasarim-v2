"use client";

import { useEffect } from "react";
import { ProductManagement } from "./sidebar-panels/ProductManagement";
import { GlobalCellSettings } from "./sidebar-panels/GlobalCellSettings";
import { GlobalPriceSettings } from "./sidebar-panels/GlobalPriceSettings";
import { CustomCellSettings } from "./sidebar-panels/CustomCellSettings";
import { ProductInfoSettings } from "./sidebar-panels/ProductInfoSettings";
import { TemplateSettingsPanel } from "./sidebar-panels/TemplateSettingsPanel";
import { BackgroundSettingsPanel } from "./sidebar-panels/BackgroundSettingsPanel";
import { ModuleRegistry } from "@/lib/moduleRegistry";
import { GlobalGridSettings } from "./sidebar-panels/GlobalGridSettings";
import { useUIStore } from "@/store/useUIStore";
import { useCatalogStore } from "@/store/useCatalogStore";
import { DownloadMenu } from "./DownloadMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Package, FileDashed, Target, DownloadSimple, 
  Layout, GridFour, Image as ImageIcon, PaintBucket, Tag, 
  Megaphone, Pizza, CaretLeft, CaretRight, Info, SlidersHorizontal 
} from "@phosphor-icons/react";

export function Sidebar() {
  const { sidebarState, setSidebarState, editingContent, selection } = useUIStore();
  const { formas, activeFormaId } = useCatalogStore();

  const activeForma = formas.find(f => f.id === activeFormaId);
  const pages = activeForma?.pages || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let selectedSlot: any = null;
  const selectedSlotIds = selection.type === 'slot' ? selection.ids : (selection.type === 'bannerCell' && selection.parentId ? [selection.parentId] : []);
  
  if (selectedSlotIds.length > 0) {
    for (const p of pages) {
      const s = p.slots.find(slot => slot.id === selectedSlotIds[0]);
      if (s) { selectedSlot = s; break; }
    }
  }

  useEffect(() => {
    if (editingContent) { setSidebarState('selection', null, null); }
  }, [editingContent, setSidebarState]);

  const isOpen = sidebarState.activePanel !== null;

  const toggleOpen = () => {
    if (isOpen) setSidebarState(null, null);
    else setSidebarState("products", null);
  };

  return (
    <aside className={`relative z-1000 w-85 flex flex-col h-full bg-(--bg-panel) rounded-xl border border-(--border-color) shrink-0 shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? "mr-0" : "-mr-89"}`}>
      <button
        onClick={toggleOpen}
        className="absolute -left-7 top-1/2 -translate-y-1/2 w-7 h-16 bg-primary text-white hover:bg-(--primary-hover) flex items-center justify-center rounded-l-md shadow-[-4px_0_10px_rgba(0,0,0,0.1)] border-y border-l border-primary transition-colors z-10000"
        title={isOpen ? "Paneli Gizle" : "Paneli Göster"}
      >
        {isOpen ? <CaretRight size={20} weight="bold" /> : <CaretLeft size={20} weight="bold" />}
      </button>

      <div className="w-full h-full overflow-hidden rounded-xl flex flex-col">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Tabs value={sidebarState.activePanel ?? "products"} onValueChange={(val: any) => setSidebarState(val, null)} className="flex flex-col w-full h-full">
        
        <div className="shrink-0 relative z-50">
          <TabsList className="w-full bg-primary p-0 gap-0 rounded-t-xl h-16 flex items-stretch shadow-md overflow-hidden">
            <TabsTrigger value="products" className="flex-1 bg-transparent text-[11px] font-semibold text-white/80 data-[state=active]:bg-(--primary-hover) data-[state=active]:text-white rounded-none transition-all flex flex-col items-center justify-center gap-1 hover:bg-(--primary-hover) hover:text-white tracking-wide"><Package size={20} weight="regular" />Ürünler</TabsTrigger>
            <TabsTrigger value="page" className="flex-1 bg-transparent text-[11px] font-semibold text-white/80 data-[state=active]:bg-(--primary-hover) data-[state=active]:text-white rounded-none transition-all flex flex-col items-center justify-center gap-1 hover:bg-(--primary-hover) hover:text-white tracking-wide"><FileDashed size={20} weight="regular" />Sayfa</TabsTrigger>
            <TabsTrigger value="selection" className="flex-1 bg-transparent text-[11px] font-semibold text-white/80 data-[state=active]:bg-(--primary-hover) data-[state=active]:text-white rounded-none transition-all flex flex-col items-center justify-center gap-1 hover:bg-(--primary-hover) hover:text-white tracking-wide"><Target size={20} weight="regular" />Seçim</TabsTrigger>
            <TabsTrigger value="export" className="flex-1 bg-transparent text-[11px] font-semibold text-white/80 data-[state=active]:bg-(--primary-hover) data-[state=active]:text-white rounded-none transition-all flex flex-col items-center justify-center gap-1 hover:bg-(--primary-hover) hover:text-white tracking-wide"><DownloadSimple size={20} weight="regular" />Çıktı</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="products" className="flex-1 flex flex-col min-h-0 data-[state=active]:flex p-0 m-0 border-none outline-none">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="page" className="flex-1 overflow-y-auto p-4 bg-(--bg-subpanel) pb-20 data-[state=active]:block m-0 border-none outline-none">
          <h3 className="section-title mb-3">Katalog Yapısı</h3>
          <Accordion className="w-full space-y-2">
            <AccordionItem value="template" className="border border-(--border-color) bg-(--bg-panel) rounded-md px-2 shadow-sm"><AccordionTrigger className="py-2.5 text-[12px] font-semibold hover:no-underline flex gap-2"><Layout size={16} weight="bold" className="text-(--text-muted)"/> Şablon Seçimi</AccordionTrigger><AccordionContent><TemplateSettingsPanel /></AccordionContent></AccordionItem>
            <AccordionItem value="grid" className="border border-(--border-color) bg-(--bg-panel) rounded-md px-2 shadow-sm"><AccordionTrigger className="py-2.5 text-[12px] font-semibold hover:no-underline flex justify-between w-full"><div className="flex gap-2"><GridFour size={16} weight="bold" className="text-(--text-muted)"/> Izgara (Grid)</div></AccordionTrigger><AccordionContent><GlobalGridSettings /></AccordionContent></AccordionItem>
            <AccordionItem value="background" className="border border-(--border-color) bg-(--bg-panel) rounded-md px-2 shadow-sm"><AccordionTrigger className="py-2.5 text-[12px] font-semibold hover:no-underline flex justify-between w-full"><div className="flex gap-2"><ImageIcon size={16} weight="bold" className="text-(--text-muted)"/> Arka Plan</div></AccordionTrigger><AccordionContent><BackgroundSettingsPanel /></AccordionContent></AccordionItem>
          </Accordion>

          <h3 className="section-title mt-6 mb-3">Varsayılan Tasarım</h3>
          <Accordion className="w-full space-y-2">
            <AccordionItem value="cell" className="border border-(--border-color) bg-(--bg-panel) rounded-md px-2 shadow-sm"><AccordionTrigger className="py-2.5 text-[12px] font-semibold hover:no-underline flex justify-between w-full"><div className="flex gap-2"><PaintBucket size={16} weight="bold" className="text-(--text-muted)"/> Hücre Görünümü</div></AccordionTrigger><AccordionContent><GlobalCellSettings /></AccordionContent></AccordionItem>
            <AccordionItem value="price" className="border border-(--border-color) bg-(--bg-panel) rounded-md px-2 shadow-sm"><AccordionTrigger className="py-2.5 text-[12px] font-semibold hover:no-underline flex justify-between w-full"><div className="flex gap-2"><Tag size={16} weight="bold" className="text-(--text-muted)"/> Fiyat Kutusu</div></AccordionTrigger><AccordionContent><GlobalPriceSettings /></AccordionContent></AccordionItem>
          </Accordion>

          <h3 className="section-title mt-6 mb-3">Sürüklenebilir Modüller</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(ModuleRegistry).map((module) => {
              const Icon = module.icon;
              return (
                <div 
                  key={module.id} 
                  draggable 
                  onDragStart={(e) => e.dataTransfer.setData("newModuleType", module.id)} 
                  className={`bg-(--bg-panel) p-4 rounded-xl border border-(--border-color) shadow-sm ${module.borderHoverClass} cursor-grab flex flex-col items-center gap-2 transition-all`}
                >
                  <Icon size={28} weight="duotone" className={module.colorClass} />
                  <span className="ui-text-small font-semibold">{module.label}</span>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="selection" className="flex-1 overflow-y-auto p-4 bg-(--bg-subpanel) pb-20 data-[state=active]:block m-0 border-none outline-none">
          {!selectedSlot && !editingContent ? (
            <div className="bg-(--primary-light) border border-primary rounded-xl p-6 text-center mt-4 shadow-inner flex flex-col items-center gap-3">
              <Target size={40} weight="duotone" className="text-primary" />
              <strong className="text-[13px] text-primary">Hiçbir öğe seçili değil</strong>
              <span className="text-[11px] text-primary opacity-80 leading-relaxed">Katalogdaki bir hücreye veya modüle tıkladığınızda, o öğeye özel tüm ayarlar burada belirecektir.</span>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              {selectedSlot?.role === 'product' && (
                <>
                  <div className="bg-(--primary-light) border border-primary p-3 rounded-lg flex items-center gap-2 shadow-sm">
                    <Package size={20} weight="fill" className="text-primary" />
                    <span className="text-[11px] font-bold text-primary tracking-wider">Ürün Hücresi Seçili</span>
                  </div>
                  <Accordion className="w-full space-y-2">
                    <AccordionItem value="info" className="border border-(--border-color) bg-(--bg-panel) rounded-md px-2 shadow-sm"><AccordionTrigger className="py-2.5 text-[12px] font-semibold hover:no-underline flex gap-2"><Info size={16} weight="bold" className="text-(--text-muted)"/> Ürün Bilgisi</AccordionTrigger><AccordionContent><ProductInfoSettings /></AccordionContent></AccordionItem>
                    <AccordionItem value="custom" className="border border-(--border-color) bg-(--bg-panel) rounded-md px-2 shadow-sm"><AccordionTrigger className="py-2.5 text-[12px] font-semibold hover:no-underline flex gap-2"><SlidersHorizontal size={16} weight="bold" className="text-(--text-muted)"/> Özel Ayarlar</AccordionTrigger><AccordionContent><CustomCellSettings /></AccordionContent></AccordionItem>
                  </Accordion>
                </>
              )}
              {selectedSlot?.role === 'free' && selectedSlot?.moduleData?.type && ModuleRegistry[selectedSlot.moduleData.type] ? (
                (() => {
                  const module = ModuleRegistry[selectedSlot.moduleData.type];
                  const SidebarPanel = module.sidebarComponent;
                  const Icon = module.icon;
                  return (
                    <>
                      <div className={`${module.bgColorClass} border ${module.borderColorClass} p-3 rounded-lg flex items-center gap-2 shadow-sm`}>
                        <Icon size={20} weight="fill" className={module.colorClass} />
                        <span className={`text-[11px] font-bold ${module.colorClass.replace('text-', 'text-')} tracking-wider`}>{module.label} Seçili</span>
                      </div>
                      <SidebarPanel />
                    </>
                  );
                })()
              ) : selectedSlot?.role === 'free' && selectedSlot?.moduleData?.type ? (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 shadow-sm text-red-500 font-bold text-[11px]">
                  Bilinmeyen Modül: {selectedSlot.moduleData.type}
                </div>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="export" className="flex-1 overflow-y-auto p-4 bg-(--bg-subpanel) pb-20 data-[state=active]:block m-0 border-none outline-none">
           <h3 className="section-title mb-3">Dışa Aktar</h3>
           <div className="bg-(--bg-panel) p-4 rounded-xl border border-(--border-color) shadow-sm space-y-4">
             <div className="flex items-start gap-3 bg-(--primary-light) p-3 rounded-lg border border-primary">
               <Info size={20} weight="fill" className="text-primary shrink-0" />
               <p className="text-[11px] text-primary font-medium leading-relaxed">Kataloğunuzun hazır olduğunu düşünüyorsanız, çıktıyı almak için aşağıdaki butonu kullanabilirsiniz.</p>
             </div>
             
             <div className="flex justify-center p-4 bg-(--bg-subpanel) rounded-xl border border-(--border-color) shadow-inner">
                <DownloadMenu />
             </div>
           </div>
        </TabsContent>
      </Tabs>
      </div>
    </aside>
  );
}
