"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { availableTemplates } from "@/lib/templates";

interface Props { isOpen: boolean; onToggle: () => void; }

export function TemplateSettingsPanel({ isOpen, onToggle }: Props) {
  const { activeTemplate, setActiveTemplate } = useCatalogStore();

  const handleTemplateChange = (templateId: string) => {
    if (templateId === activeTemplate.id) return;
    
    // Şablon değişince içindeki ürünler sıfırlanacağı için kullanıcıyı uyarıyoruz
    const isConfirmed = window.confirm("DİKKAT: Şablonu değiştirdiğinizde sayfalar yeniden oluşturulacak ve mevcut broşür üzerindeki tüm ürün/tasarım yerleşimleri silinecektir. Onaylıyor musunuz?");
    
    if (isConfirmed) {
      setActiveTemplate(templateId);
    }
  };

  return (
    <div className="bg-white rounded-md border border-slate-700 shadow-sm mb-4 relative z-30">
      <button onClick={onToggle} className={`w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors ${isOpen ? "rounded-t-md" : "rounded-md"}`}>
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Şablonlar</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-700 space-y-4 rounded-b-md">
          <p className="text-[10px] text-slate-500 font-bold mb-2">Broşürünüz için bir şablon seçin:</p>
          
          <div className="space-y-2">
            {availableTemplates.map((template) => {
              const isActive = activeTemplate.id === template.id;
              
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`w-full flex flex-col items-start p-3 rounded-md border transition-all ${
                    isActive 
                      ? "bg-blue-50 border-blue-500 shadow-sm" 
                      : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-[11px] font-black ${isActive ? "text-blue-700" : "text-slate-700"}`}>
                      {template.name}
                    </span>
                    {isActive && (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">
                    {template.pageCount} Sayfa • {template.foldCount > 0 ? `${template.foldCount} Kırımlı` : 'Kırımsız'}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-2 rounded mt-2">
            <p className="text-[9px] font-bold text-amber-700 leading-tight">
              ⚠️ Şablon değiştirildiğinde mevcut tasarımınız sıfırlanır.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}