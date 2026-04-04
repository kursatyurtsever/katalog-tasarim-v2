"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore"; // UI Store eklendi
import {
  Image as ImageIcon,
  Square, Box, Copy, ClipboardPaste, Eraser, Settings2,
  Wand2, Combine,
  Type, AlignLeft, AlignCenter, AlignRight,
  Maximize
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { ColorOpacityPicker } from "./ColorOpacityPicker";
import { BorderRadiusPicker } from "./BorderRadiusPicker";
import { ShadowPicker } from "./ShadowPicker";
import { useLayerStore } from "@/store/useLayerStore";
import { v4 as uuidv4 } from "uuid";
import { Layer } from "@/types/document";

// SHADCN UI
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function isObject(item: any) { return (item && typeof item === 'object' && !Array.isArray(item)); }
function deepMerge(target: any, source: any) {
  if (!target) return source;
  if (!source) return target;
  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (isObject(source[key]) && key in target && isObject(target[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}

const Divider = () => <div className="w-px h-5 bg-slate-200 mx-1"></div>;

// HATASIZ ICON BUTTON: asChild kullanmadan doğrudan Trigger'ı stilize eder
interface IconButtonProps {
  icon: any;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
  isActive?: boolean;
  popoverId?: string;
  activePopover?: string | null;
  onTogglePopover?: (id: string | null) => void;
  popoverContent?: React.ReactNode;
}

const IconButton = ({
  icon: Icon, label, onClick, disabled = false, danger = false, isActive = false,
  popoverId, activePopover, onTogglePopover, popoverContent
}: IconButtonProps) => {
  
  // Ortak stil sınıfları
  const buttonClass = `
    inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950
    disabled:pointer-events-none disabled:opacity-50 h-8 w-8
    ${danger ? 'text-red-500 hover:bg-red-50' : isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
  `;

  if (popoverId && popoverContent) {
    return (
      <Popover open={activePopover === popoverId} onOpenChange={(open) => onTogglePopover && onTogglePopover(open ? popoverId : null)}>
        <PopoverTrigger 
          disabled={disabled}
          className={buttonClass}
          title={label}
        >
          <Icon size={14} strokeWidth={2.5} />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 z-[99999] shadow-xl border-slate-200 bg-white" align="start" sideOffset={8}>
          {popoverContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
      title={label}
    >
      <Icon size={14} strokeWidth={2.5} />
    </button>
  );
};

export function ContextualBar() {
// Store bağlantıları düzeltildi
  const {
    globalSettings, setGlobalSettings, formas, activeTemplate,
    updateSlotImageSettings, updateSlotCustomSettings, toggleSlotCustomSettings,
    clearSlotSettings, copySlotSettings, pasteSlotSettings, setActiveFormaId,
    activeFormaId,        // <--- Buraya taşındı
    copiedSlotSettings    // <--- Buraya eklendi
  } = useCatalogStore();

  const {
    selectedSlotIds, selectedTextElement, setSelectedTextElement,
    contextualBarFormaId, contextualBarSelectedPages, setContextualBarFormaId, 
    setContextualBarSelectedPages, setSidebarState
    // activeFormaId buradan silindi
  } = useUIStore();

  const {
    layers, addLayer, updateLayerProperties, setLayerMask, fitLayerToPages,
    selectLayers, selectPages
  } = useLayerStore();

  const isGlobalApplyActive = false;

  const currentFormaScope = formas.find(f => f.id === (contextualBarFormaId ? parseInt(contextualBarFormaId) : undefined));

  const displayScopeText = () => {
    if (isGlobalApplyActive) return "Tüm Broşüre Uygula";
    if (!currentFormaScope) return "Kapsam Seçilmedi";

    let scopeText = currentFormaScope.name;
    if (contextualBarSelectedPages.length === 0) {
      scopeText += " (Tüm Sayfalar)";
    } else if (contextualBarSelectedPages.length === 1) {
      scopeText += ` (Sayfa ${contextualBarSelectedPages[0]})`;
    } else if (contextualBarSelectedPages.length > 1) {
      const pageNumbers = [...contextualBarSelectedPages].sort((a, b) => a - b).join(", ");
      scopeText += ` (Sayfa ${pageNumbers})`;
    }
    return scopeText;
  };

  const handleBackgroundColorChange = (color: string, opacity: number) => {
    let maskType: 'page' | 'spread' | 'document' = 'page';
    let targetIds: string[] = [];

    if (isGlobalApplyActive) {
      maskType = 'document';
      targetIds = [];
    } else if (contextualBarSelectedPages.length > 0) {
      maskType = 'page';
      targetIds = contextualBarSelectedPages.map(num => {
        const page = currentFormaScope?.pages.find(p => p.pageNumber === num);
        return page?.id || `page-${num}`;
      });
    } else if (currentFormaScope) {
      maskType = 'spread';
      targetIds = currentFormaScope.pages.map(p => p.id);
    }

    const existingLayer = layers.find(l => 
      l.type === 'solid' && 
      l.mask &&
      l.mask.type === maskType && 
      JSON.stringify(l.mask.targetIds || []) === JSON.stringify(targetIds)
    );

    if (existingLayer) {
      updateLayerProperties(existingLayer.id, { color, opacity });
    } else {
      const newId = uuidv4();
      const newLayer: Layer = {
        id: newId,
        type: 'solid',
        name: 'Arka Plan (Renk)',
        bounds: { 
          x: 0, 
          y: 0, 
          w: (activeTemplate?.openWidthMm || 210) + ((activeTemplate?.bleedMm || 0) * 2), 
          h: (activeTemplate?.openHeightMm || 297) + ((activeTemplate?.bleedMm || 0) * 2) 
        },
        transform: { rotation: 0, scale: 100, flipX: false, flipY: false, offsetX: 0, offsetY: 0 },
        mask: { type: maskType, targetIds },
        zIndex: 0,
        properties: { color, opacity },
        visible: true,
      };
      addLayer(newLayer);
      fitLayerToPages(newId, targetIds.length > 0 ? targetIds : currentFormaScope?.pages.map(p => p.id) || []);
      selectLayers([newId]);
    }
  };

  const initialBackgroundColor = useMemo(() => {
    let maskType: 'page' | 'spread' | 'document' = 'page';
    let targetIds: string[] = [];

    if (isGlobalApplyActive) {
      maskType = 'document';
      targetIds = [];
    } else if (contextualBarSelectedPages.length > 0) {
      maskType = 'page';
      targetIds = contextualBarSelectedPages.map(num => {
        const page = currentFormaScope?.pages.find(p => p.pageNumber === num);
        return page?.id || `page-${num}`;
      });
    } else if (currentFormaScope) {
      maskType = 'spread';
      targetIds = currentFormaScope.pages.map(p => p.id);
    }

    const match = layers.find(l => 
      l.type === 'solid' && 
      l.mask &&
      l.mask.type === maskType && 
      JSON.stringify(l.mask.targetIds || []) === JSON.stringify(targetIds)
    );

    return match ? { color: match.properties.color, opacity: match.properties.opacity } : { color: "#ffffff", opacity: 100 };
  }, [layers, isGlobalApplyActive, contextualBarSelectedPages, currentFormaScope]);

  const activeForma = formas.find((f) => f.id === activeFormaId);
  const pages = activeForma?.pages || [];

  const [activePopover, setActivePopover] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  let selectedSlot: any = null;
  let selectedPageNum = -1;

  if (selectedSlotIds.length > 0) { // Çoklu seçimde ilkini referans al
    for (const page of pages) {
      const slot = page.slots.find(s => s.id === selectedSlotIds[0]);
      if (slot) {
        selectedSlot = slot;
        selectedPageNum = page.pageNumber;
        break;
      }
    }
  }

  const activeSettings = (selectedSlot?.isCustom && selectedSlot?.customSettings)
    ? deepMerge(globalSettings, selectedSlot.customSettings)
    : globalSettings;

  const imgEditMode = selectedSlot?.imageSettings?.editMode ?? activeSettings.imageEditMode;
  const imgScale = selectedSlot?.imageSettings?.scale ?? activeSettings.imageScale;

  const handleSettingUpdate = (updates: any) => {
    if (selectedSlot?.isCustom) {
      updateSlotCustomSettings(updates);
    } else {
      setGlobalSettings(updates);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest('.z-\\[99999\\]')) return;
      if (barRef.current && !barRef.current.contains(target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // 1. METİN ARAÇ ÇUBUĞU
  // ==========================================
  if (selectedTextElement && selectedSlot) {
    const isName = selectedTextElement.elementType === 'name';
    const isPrice = selectedTextElement.elementType === 'price';
    const isBadge = selectedTextElement.elementType === 'badge';

    const currentFont = isName ? activeSettings.fonts.productName : isPrice ? activeSettings.fonts.price : (activeSettings.badge?.font || activeSettings.fonts.productName);

    const handleFontUpdate = (newFont: any) => {
      if (isName) handleSettingUpdate({ fonts: { ...activeSettings.fonts, productName: newFont } });
      if (isPrice) handleSettingUpdate({ fonts: { ...activeSettings.fonts, price: newFont } });
      if (isBadge) handleSettingUpdate({ badge: { ...activeSettings.badge, font: newFont } });
    };

    return (
      <div ref={barRef} className="h-12 bg-indigo-50 border-b border-indigo-200 flex items-center justify-center px-4 gap-2 shrink-0 shadow-sm z-40 relative">
        <div className="flex items-center gap-1.5 pr-2 mr-1">
          <Type size={14} className="text-indigo-600" />
          <span className="text-[11px] font-black text-indigo-800 uppercase tracking-widest">
            {isName ? 'Ürün İsmi' : isPrice ? 'Fiyat' : 'Etiket'}
          </span>
        </div>
        <Divider />

        <select 
          value={currentFont.fontFamily} 
          onChange={(e) => handleFontUpdate({ ...currentFont, fontFamily: e.target.value })} 
          className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded p-1 outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Arial">Arial</option>
          <option value="Oswald">Oswald</option>
        </select>

        <select 
          value={currentFont.fontWeight} 
          onChange={(e) => handleFontUpdate({ ...currentFont, fontWeight: e.target.value })} 
          className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded p-1 outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="400">Normal</option>
          <option value="700">Kalın</option>
          <option value="900">Black</option>
        </select>

        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded p-1">
          <span className="text-[9px] text-slate-400 font-bold px-1">PT</span>
          <input 
            type="number" 
            value={currentFont.fontSize} 
            onChange={(e) => handleFontUpdate({ ...currentFont, fontSize: parseInt(e.target.value) || 12 })} 
            className="w-8 text-[11px] font-bold text-slate-700 bg-transparent text-center outline-none" 
          />
        </div>

        <div className="relative group flex items-center justify-center ml-1">
          <ColorOpacityPicker 
            color={currentFont.color} 
            opacity={currentFont.opacity} 
            onChange={(c, o) => handleFontUpdate({ ...currentFont, color: c, opacity: o })} 
          />
        </div>

        <Divider />

        <div className="flex items-center bg-white border border-slate-200 rounded overflow-hidden">
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'left' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'left' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><AlignLeft size={14} /></button>
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'center' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'center' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><AlignCenter size={14} /></button>
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'right' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'right' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><AlignRight size={14} /></button>
        </div>

        <Divider />

        <div className="flex items-center bg-white border border-slate-200 rounded overflow-hidden">
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'top' })} className={`px-2 py-1.5 text-[9px] font-bold transition-colors ${currentFont.verticalAlign === 'top' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>ÜST</button>
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'middle' })} className={`px-2 py-1.5 text-[9px] font-bold transition-colors ${currentFont.verticalAlign === 'middle' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>ORTA</button>
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'bottom' })} className={`px-2 py-1.5 text-[9px] font-bold transition-colors ${currentFont.verticalAlign === 'bottom' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>ALT</button>
        </div>

        <Divider />
        <Button 
          variant="outline"
          size="sm"
          onClick={() => {
            if (selectedSlot?.isCustom) {
              setSidebarState("settings", "customCell", "price");
            } else {
              setSidebarState("settings", "price", null);
            }
            setActivePopover(null);
          }}
          className="h-8 text-[10px] font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <Settings2 className="h-3 w-3 mr-1" /> Detaylar
        </Button>
      </div>
    );
  }

  // ==========================================
  // 2. HÜCRE ARAÇ ÇUBUĞU
  // ==========================================
  if (selectedSlotIds.length > 0) {
    return (
      <div ref={barRef} className="h-12 bg-white border-b border-slate-200 flex items-center justify-center px-4 gap-1.5 shrink-0 shadow-sm z-40 relative">
        <div className="flex items-center gap-2 pr-2 mr-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {selectedSlotIds.length > 1 ? `${selectedSlotIds.length} HÜCRE` : 'HÜCRE'}
          </span>
        </div>
        <Divider />

        <div className="flex items-center gap-2 relative">
          <IconButton 
            icon={ImageIcon} 
            label="Resim Ayarları" 
            popoverId="imageSettings" 
            activePopover={activePopover}
            onTogglePopover={setActivePopover}
            isActive={activePopover === "imageSettings"}
            popoverContent={
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ürün Görseli Ayarları</span>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Serbest Konum</span>
                  <input type="checkbox" checked={imgEditMode} onChange={(e) => updateSlotImageSettings(selectedPageNum, selectedSlot.id, { editMode: e.target.checked })} />
                </div>
                <div className={`flex flex-col gap-2 ${!imgEditMode ? 'opacity-40' : ''}`}>
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold">Büyütme</span><span className="text-[10px] font-bold">%{imgScale}</span></div>
                  <input type="range" min="10" max="300" value={imgScale} onChange={(e) => updateSlotImageSettings(selectedPageNum, selectedSlot.id, { scale: parseInt(e.target.value) })} className="w-full" />
                </div>
                <Button variant="outline" size="sm" onClick={() => updateSlotImageSettings(selectedPageNum, selectedSlot.id, { editMode: false, scale: 100, posX: 0, posY: 0 })} className="w-full">Sıfırla</Button>
              </div>
            }
          />
          
          <ColorOpacityPicker color={activeSettings?.colors?.cellBg?.c || "#ffffff"} opacity={activeSettings?.colors?.cellBg?.o ?? 100} onChange={(c, o) => handleSettingUpdate({ colors: { cellBg: { c, o } } })} />
          <ColorOpacityPicker type="border" color={activeSettings?.colors?.cellBorder?.c || "#e2e8f0"} opacity={activeSettings?.colors?.cellBorder?.o ?? 100} thickness={activeSettings?.borderWidth ?? 1} onChange={(c, o) => handleSettingUpdate({ colors: { cellBorder: { c, o } } })} onThicknessChange={(thickness) => handleSettingUpdate({ borderWidth: thickness })} />

          <IconButton 
            icon={Square} 
            popoverId="borderRadius" 
            activePopover={activePopover}
            onTogglePopover={setActivePopover}
            isActive={activePopover === 'borderRadius'} 
            label="Köşe Ovalliği" 
            popoverContent={<BorderRadiusPicker value={activeSettings?.radiuses?.cell!} onChange={(val: any) => handleSettingUpdate({ radiuses: { cell: val } })} />}
          />

          <IconButton 
            icon={Box} 
            label="Hücre Gölgesi" 
            popoverId="boxShadow" 
            activePopover={activePopover}
            onTogglePopover={setActivePopover}
            isActive={activePopover === 'boxShadow'} 
            popoverContent={<ShadowPicker value={activeSettings?.shadows?.cell!} onChange={(val: any) => handleSettingUpdate({ shadows: { cell: val } })} />}
          />
        </div>

        <Divider />

        <div className="flex items-center gap-0.5 relative">
          <IconButton icon={Copy} label="Kopyala" onClick={copySlotSettings} />
          <IconButton icon={ClipboardPaste} label="Yapıştır" onClick={pasteSlotSettings} disabled={!copiedSlotSettings} />
          <Divider />
          {selectedSlot?.isCustom ? (
            <IconButton icon={Combine} label="Global Yap" onClick={clearSlotSettings} isActive={true} />
          ) : (
            <IconButton icon={Wand2} label="Özelleştir" onClick={() => toggleSlotCustomSettings(true)} />
          )}
          <IconButton icon={Eraser} label="Temizle" onClick={clearSlotSettings} danger />
        </div>

        <Divider /> 

        <Button 
          variant="outline"
          size="sm"
          onClick={() => {
            if (selectedSlot?.isCustom) {
              setSidebarState("settings", "customCell", null);
            } else {
              setSidebarState("settings", "cell", null);
            }
          }}
          className="h-8 text-[10px] font-bold"
        >
          <Settings2 className="h-3 w-3 mr-1" /> Detaylar
        </Button>
      </div>
    );
  }

  // ==========================================
  // 3. ARKA PLAN ARAÇ ÇUBUĞU (VARSAYILAN)
  // ==========================================
  return (
    <div ref={barRef} className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-40 relative">
      <div className="flex flex-row items-center gap-4 w-full">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700">Tüm Broşür</span>
          <input type="checkbox" checked={isGlobalApplyActive} readOnly />
        </div>

        <Divider />

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700">Kapsam:</span>
          <select
            className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded p-1 outline-none focus:border-indigo-500 cursor-pointer"
            value={contextualBarFormaId || ""}
            onChange={(e) => {
              const newFormaId = parseInt(e.target.value, 10);
              if (newFormaId) {
                setActiveFormaId(newFormaId);
                setContextualBarFormaId(e.target.value);
                setContextualBarSelectedPages([]);
              }
            }}
          >
            <option value="">Seç...</option>
            {formas.map((f) => (
              <option key={f.id} value={f.id.toString()}>{f.name}</option>
            ))}
          </select>
        </div>

        {currentFormaScope && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-700">Sayfalar:</span>
            <div className="flex gap-1">
              {currentFormaScope.pages.map((page) => (
                <Button
                  key={page.pageNumber}
                  variant={contextualBarSelectedPages.includes(page.pageNumber) ? "default" : "secondary"}
                  size="sm"
                  className="h-7 text-[10px] font-bold px-2"
                  onClick={() => {
                    const newSelectedPages = contextualBarSelectedPages.includes(page.pageNumber)
                      ? contextualBarSelectedPages.filter((p) => p !== page.pageNumber)
                      : [...contextualBarSelectedPages, page.pageNumber];
                    setContextualBarSelectedPages(newSelectedPages);
                    
                    const layerPageIds = newSelectedPages
                      .map(num => currentFormaScope.pages.find(p => p.pageNumber === num)?.id)
                      .filter(Boolean) as string[];
                    selectPages(layerPageIds);
                  }}
                >
                  {page.pageNumber}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Divider />

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
            {displayScopeText()}
          </span>
        </div>

        <Divider />

        <ColorOpacityPicker
          color={initialBackgroundColor?.color || "#ffffff"}
          opacity={initialBackgroundColor?.opacity ?? 100}
          onChange={handleBackgroundColorChange}
        />

        <Divider />

        <IconButton 
          icon={Maximize} 
          label="Spread Yap" 
          onClick={() => {
            const targetIds = contextualBarSelectedPages.map(num => currentFormaScope?.pages.find(p => p.pageNumber === num)?.id).filter(Boolean) as string[];
            const pageLayer = layers.find(l => l.type === 'solid' && l.mask?.type === 'page' && JSON.stringify(l.mask.targetIds) === JSON.stringify(targetIds));
            
            if (pageLayer && currentFormaScope) {
              const allFormaPageIds = currentFormaScope.pages.map(p => p.id);
              setLayerMask(pageLayer.id, { type: 'spread', targetIds: allFormaPageIds });
              fitLayerToPages(pageLayer.id, allFormaPageIds);
            }
          }}
          disabled={contextualBarSelectedPages.length === 0}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarState("settings", "background", null)}
          className="h-8 text-[10px] font-bold"
        >
          <Settings2 className="h-3 w-3 mr-1" /> Detaylı Ayarlar
        </Button>
      </div>
    </div>
  );
}