"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import {
  Image as ImageIcon,
  Square, Cube, Copy, ClipboardText, Eraser,
  MagicWand, Intersect, Stack as Layers,
  TextT, TextAlignLeft, TextAlignCenter, TextAlignRight,
  ArrowsOut,
  SplitHorizontal,
  TextB, TextItalic, TextUnderline, PaintBrush // DÜZELTİLDİ: TextBolder yerine TextB
} from "@phosphor-icons/react";
import { useState, useRef, useEffect, useMemo } from "react";
import { ColorOpacityPicker } from "./ColorOpacityPicker";
import { BorderRadiusPicker } from "./BorderRadiusPicker";
import { ShadowPicker } from "./ShadowPicker";
import { useLayerStore } from "@/store/useLayerStore";
import { v4 as uuidv4 } from "uuid";
import { Layer } from "@/types/document";
import { TypographyPicker } from "./TypographyPicker";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObject(item: any) { return (item && typeof item === 'object' && !Array.isArray(item)); }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

interface IconButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
  isActive?: boolean;
  popoverId?: string;
  activePopover?: string | null;
  onTogglePopover?: (id: string | null) => void;
  popoverContent?: React.ReactNode;
}

const IconButton = ({
  icon: Icon, label, onClick, onMouseDown, disabled = false, danger = false, isActive = false,
  popoverId, activePopover, onTogglePopover, popoverContent
}: IconButtonProps) => {
  
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
          <Icon size={14} weight="bold" />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 z-99999 shadow-xl border-slate-200 bg-white" align="start" sideOffset={8}>
          {popoverContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      disabled={disabled}
      className={buttonClass}
      title={label}
    >
      <Icon size={14} weight="bold" />
    </button>
  );
};

const FooterImageUploadButton = ({ refCell, scope, updateFooterCellStore }: { refCell: any, scope: string|number, updateFooterCellStore: Function }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!refCell || !e.target.files?.[0]) return;
        setIsUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filename", `footer-logo-${Date.now()}.${file.name.split('.').pop()}`);
    
        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            updateFooterCellStore(scope, refCell.id, { image: `${data.path}?t=${Date.now()}`, text: '' }); 
          }
        } catch(err) {
          alert("Hata: " + String(err));
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateFooterCellStore(scope, refCell.id, { image: null });
    }

    return (
        <>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            <div className="flex items-center gap-0.5 relative">
                <IconButton 
                    icon={ImageIcon}
                    label={isUploading ? "Yükleniyor..." : "Resim Ekle/Değiştir"}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !refCell}
                />
                {refCell?.image && (
                     <IconButton 
                        icon={Eraser}
                        label="Resmi Sil"
                        onClick={handleRemoveImage}
                        danger
                    />
                )}
            </div>
        </>
    );
};


export function ContextualBar() {
  const {
    globalSettings, setGlobalSettings, formas, activeTemplate,
    updateSlotImageSettings, updateSlotCustomSettings, toggleSlotCustomSettings,
    clearSlotSettings, copySlotSettings, pasteSlotSettings, setActiveFormaId,
    toggleSlotRole, activeFormaId, copiedSlotSettings,
    setPageFooterMode,
    updateFooterCellStore,
    mergeFooterCellsStore,
    unmergeFooterCellStore,
    getActivePages,
  } = useCatalogStore();

  const {
    selection, selectedTextElement, setSelectedTextElement,
    contextualBarFormaId, contextualBarSelectedPages, setContextualBarFormaId, 
    setContextualBarSelectedPages
  } = useUIStore();

  const {
    layers, addLayer, updateLayerProperties, setLayerMask, fitLayerToPages,
    selectLayers, selectPages
  } = useLayerStore();

  const [activePopover, setActivePopover] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  
  // YENİ: Renk seçimi için range (seçim koordinatları) hafızası
  const [colorRange, setColorRange] = useState<Range | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [savedColors, setSavedColors] = useState<{ c: string; o: number }[]>([]);

  useEffect(() => {
    const loadColors = () => {
      const saved = localStorage.getItem("pizza_saved_colors");
      if (saved) {
        try {
          setSavedColors(JSON.parse(saved));
        } catch (e) {}
      } else {
        setSavedColors([]);
      }
    };
    loadColors();
    window.addEventListener("pizza_colors_updated", loadColors);
    return () => window.removeEventListener("pizza_colors_updated", loadColors);
  }, []);

  // Butonlardaki standart biçimlendirmeler için (Focus kaybetmeden uygular)
  const applyInlineFormat = (e: React.MouseEvent, command: string, value?: string) => {
    e.preventDefault(); // Div'in focus'unu kaybetmesini engeller
    document.execCommand(command, false, value);
  };

  // Renk input'unu focus kaybetmeden tetiklemek için
  const handleColorClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Div'in focus'unu kaybetmesini KESİN olarak engeller
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setColorRange(sel.getRangeAt(0).cloneRange());
    }
    
    // display: none engeline takılmamak ve mousedown preventDefault çakışmasını aşmak için setTimeout
    setTimeout(() => {
      if (colorInputRef.current) {
        colorInputRef.current.click();
      }
    }, 10);
  };

  // Renk seçildiğinde hafızadaki seçimi geri yükleyip rengi uygular
  const applyColorFormat = (colorValue: string) => {
    if (colorRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(colorRange);
      
      document.execCommand('foreColor', false, colorValue);
      
      // ÖNEMLİ: Tarayıcı metin rengini değiştirdiğinde DOM'u günceller ve eski Range bozulabilir.
      // Sürükleme sırasında seçimin kaybolmaması için yeni oluşan seçimi tekrar hafızaya alıyoruz.
      if (sel && sel.rangeCount > 0) {
        setColorRange(sel.getRangeAt(0).cloneRange());
      }
    }
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    applyColorFormat(e.currentTarget.value);
  };

  // Metin İçi Biçimlendirme Araç Çubuğu Bloğu
  const InlineRichTextToolbar = () => (
    <div className="flex items-center bg-slate-100 border border-slate-200 rounded p-0.5 ml-2 shadow-inner">
       <IconButton icon={TextB} label="Kalın (Seçili Metin)" onMouseDown={(e) => applyInlineFormat(e, 'bold')} />
       <IconButton icon={TextItalic} label="İtalik (Seçili Metin)" onMouseDown={(e) => applyInlineFormat(e, 'italic')} />
       <IconButton icon={TextUnderline} label="Altı Çizili (Seçili Metin)" onMouseDown={(e) => applyInlineFormat(e, 'underline')} />
       
       {/* Renk Seçici Butonu */}
       <div className="relative flex items-center justify-center ml-1">
         <IconButton 
            icon={PaintBrush} 
            label="Metin Rengi" 
            popoverId="text-color-picker"
            activePopover={activePopover}
            onTogglePopover={(id) => {
              if (id) {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                  setColorRange(sel.getRangeAt(0).cloneRange());
                }
              }
              setActivePopover(id);
            }}
            popoverContent={
               <div 
                 onMouseDown={(e) => {
                    // Input alanları haricindeki tıklamalarda focus kaybolmasını engelle
                    if ((e.target as HTMLElement).tagName !== 'INPUT') {
                       e.preventDefault(); 
                    }
                 }} 
                 className="flex flex-col gap-3"
               >
                 <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded cursor-pointer border border-slate-300 shadow-sm relative overflow-hidden shrink-0">
                     <input 
                       type="color" 
                       onChange={handleColorInputChange as any}
                       onInput={handleColorInputChange as any}
                       className="absolute -top-2.5 -left-2.5 w-15 h-15 cursor-pointer" 
                       title="Yeni Renk Seç" 
                     />
                   </div>
                   <div className="flex flex-col justify-center">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Özel Renk</span>
                     <span className="text-[9px] text-slate-400 leading-tight">Renk paletini aç</span>
                   </div>
                 </div>
                 
                 {savedColors.length > 0 && (
                   <div className="pt-2 border-t border-slate-200">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Kayıtlı Renkler</span>
                     <div className="flex flex-wrap gap-1.5">
                       {savedColors.map((sc, idx) => (
                         <div 
                           key={idx} 
                           className="w-6 h-6 rounded cursor-pointer border border-slate-200 hover:border-blue-500 transition-colors relative overflow-hidden shadow-sm" 
                           onClick={() => applyColorFormat(sc.c)} 
                           title={`${sc.c} (%${sc.o})`}
                         >
                           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPjwvc3ZnPg==')] opacity-30"></div>
                           <div className="absolute inset-0 transition-opacity" style={{ backgroundColor: sc.c, opacity: sc.o / 100 }} />
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            }
         />
       </div>
    </div>
  );

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let selectedSlot: any = null;
  let selectedPageNum = -1;

  const selectedSlotIds = selection.type === 'slot' ? selection.ids : [];

  if (selectedSlotIds.length > 0) { 
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

  const imgEditMode = selectedSlot?.imageSettings?.editMode ?? false;
  const imgScale = selectedSlot?.imageSettings?.scale ?? 100;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      
      if (!document.contains(target)) return;
      if (target.closest('.z-\\[99999\\]') || target.closest('[data-slot="popover-content"]')) return;
      
      if (barRef.current && !barRef.current.contains(target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // FOOTER & BANNER (Metin İçeren Serbest Hücreler)
  // ==========================================
  if (selection.type === 'footerCell' || selection.type === 'bannerCell') {
    const isFooter = selection.type === 'footerCell';
    const parentId = selection.parentId;
    if (!parentId) return null;

    let scope: number | 'global' = 'global';
    let refCell: any = null;
    let handleModeChange: any = null;
    let footerMode = 'global';

    if (isFooter) {
        const pageNumber = parseInt(parentId.split('-')[1], 10);
        const page = getActivePages().find(p => p.pageNumber === pageNumber);
        if (!page) return null;
        footerMode = page.footerMode || 'global';
        scope = footerMode === 'global' ? 'global' : pageNumber;
        const activeFooter = footerMode === 'custom' && page.customFooter ? page.customFooter : globalSettings.footer;
        const cells = activeFooter?.cells || [];
        const selectedCells = cells.filter(c => selection.ids.includes(c.id));
        refCell = selectedCells.length > 0 ? selectedCells[0] : null;
        handleModeChange = (mode: 'global' | 'custom' | 'hidden') => {
            setPageFooterMode(page.pageNumber, mode);
            useUIStore.getState().clearSelection();
        };
    }

    return (
      <div id="contextual-bar" ref={barRef} className="h-12 bg-transparent flex items-center justify-center px-4 gap-1.5 shrink-0 z-40 relative">
        <div className="flex items-center gap-2 pr-2 mr-1">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
               {isFooter ? 'FOOTER' : 'HÜCRE'}
            </span>
            {isFooter && handleModeChange && (
                <div className="flex gap-1 bg-white p-1 rounded border border-slate-200">
                    <button onClick={() => handleModeChange('global')} className={`px-2 py-1 text-[9px] font-bold rounded ${footerMode === 'global' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>Global</button>
                    <button onClick={() => handleModeChange('custom')} className={`px-2 py-1 text-[9px] font-bold rounded ${footerMode === 'custom' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>Özel</button>
                    <button onClick={() => handleModeChange('hidden')} className={`px-2 py-1 text-[9px] font-bold rounded ${footerMode === 'hidden' ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-100'}`}>Gizle</button>
                </div>
            )}
        </div>
        
        {(!isFooter || footerMode !== 'hidden') && (
          <>
            <Divider />
            <div className="flex items-center gap-1.5">
              {isFooter && refCell && (
                <>
                  <ColorOpacityPicker 
                      color={refCell.bgColor.c} 
                      opacity={refCell.bgColor.o} 
                      onChange={(c, o) => { selection.ids.forEach(id => updateFooterCellStore(scope, id, { bgColor: { c, o } })); }} 
                  />
                  <IconButton 
                      icon={TextT}
                      label="Genel Font Ayarları"
                      popoverId="cellFontSettings"
                      activePopover={activePopover}
                      onTogglePopover={setActivePopover}
                      isActive={activePopover === "cellFontSettings"}
                      popoverContent={
                          <div onPointerDownCapture={(e) => e.stopPropagation()} onMouseDownCapture={(e) => e.stopPropagation()}>
                              <TypographyPicker 
                                  title="Genel Hücre Fontu" 
                                  value={refCell.font} 
                                  onChange={(val) => { selection.ids.forEach(id => updateFooterCellStore(scope, id, { font: val })); }} 
                              />
                          </div>
                      }
                  />
                </>
              )}

              {/* YENİ: Kelime Bazlı Inline Rich Text Biçimlendirme Araçları */}
              <InlineRichTextToolbar />

              {isFooter && refCell && (
                  <>
                    <Divider />
                    <IconButton icon={Intersect} label="Birleştir" onClick={() => mergeFooterCellsStore(scope, selection.ids)} disabled={selection.ids.length < 2}/>
                    <IconButton icon={SplitHorizontal} label="Ayır" onClick={() => unmergeFooterCellStore(scope, refCell.id)} disabled={!refCell || refCell.colSpan <= 1}/>
                    <Divider />
                    <FooterImageUploadButton refCell={refCell} scope={scope} updateFooterCellStore={updateFooterCellStore} />
                  </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ==========================================
  // 1. ÜRÜN BİLGİSİ (İSİM / FİYAT) ARAÇ ÇUBUĞU
  // ==========================================
  if (selectedTextElement && selectedSlot) {
    const isName = selectedTextElement.elementType === 'name';
    const isPrice = selectedTextElement.elementType === 'price';
    const isBadge = selectedTextElement.elementType === 'badge';

    const currentFont = isName ? activeSettings.fonts.productName : isPrice ? activeSettings.fonts.price : (activeSettings.badge?.font || activeSettings.fonts.productName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFontUpdate = (newFont: any) => {
      if (isName) handleSettingUpdate({ fonts: { ...activeSettings.fonts, productName: newFont } });
      if (isPrice) handleSettingUpdate({ fonts: { ...activeSettings.fonts, price: newFont } });
      if (isBadge) handleSettingUpdate({ badge: { ...activeSettings.badge, font: newFont } });
    };

    return (
      <div id="contextual-bar" ref={barRef} className="h-12 bg-(--primary-light) flex items-center justify-center px-4 gap-2 shrink-0 z-40 relative">
        <div className="flex items-center gap-1.5 pr-2 mr-1">
          <TextT size={16} weight="bold" className="text-indigo-600" />
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
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'left' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'left' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><TextAlignLeft size={16} weight="bold" /></button>
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'center' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'center' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><TextAlignCenter size={16} weight="bold" /></button>
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'right' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'right' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><TextAlignRight size={16} weight="bold" /></button>
        </div>

        <Divider />

        <div className="flex items-center bg-white border border-slate-200 rounded overflow-hidden">
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'top' })} className={`px-2 py-1.5 text-[9px] font-bold transition-colors ${currentFont.verticalAlign === 'top' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>ÜST</button>
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'middle' })} className={`px-2 py-1.5 text-[9px] font-bold transition-colors ${currentFont.verticalAlign === 'middle' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>ORTA</button>
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'bottom' })} className={`px-2 py-1.5 text-[9px] font-bold transition-colors ${currentFont.verticalAlign === 'bottom' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>ALT</button>
        </div>

        <InlineRichTextToolbar />
      </div>
    );
  }

  // ==========================================
  // 2. ÜRÜN HÜCRESİ ARAÇ ÇUBUĞU
  // ==========================================
  if (selectedSlotIds.length > 0 && selectedSlot?.role === 'product') {
    return (
      <div id="contextual-bar" ref={barRef} className="h-12 bg-transparent flex items-center justify-center px-4 gap-1.5 shrink-0 z-40 relative">
        <div className="flex items-center gap-2 pr-2 mr-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {selectedSlotIds.length > 1 ? `${selectedSlotIds.length} ÜRÜN HÜCRESİ` : 'ÜRÜN HÜCRESİ'}
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
              <div 
                className="flex flex-col gap-3"
                onPointerDownCapture={(e) => e.stopPropagation()}
                onMouseDownCapture={(e) => e.stopPropagation()}
                onTouchStartCapture={(e) => e.stopPropagation()}
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ürün Görseli Ayarları</span>
                
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Serbest Konum</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={imgEditMode} 
                      onChange={(e) => updateSlotImageSettings(selectedPageNum, selectedSlot.id, { editMode: e.target.checked })} 
                    />
                    <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                  </label>
                </div>

                <div className={`flex flex-col gap-2 ${!imgEditMode ? 'opacity-40' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold">Büyütme</span>
                    <span className="text-[10px] font-bold">%{imgScale}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="300" 
                    value={imgScale} 
                    onChange={(e) => updateSlotImageSettings(selectedPageNum, selectedSlot.id, { scale: parseInt(e.target.value) })} 
                    className="w-full accent-blue-600" 
                  />
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
            popoverContent={
              <div onPointerDownCapture={(e) => e.stopPropagation()} onMouseDownCapture={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <BorderRadiusPicker value={activeSettings?.radiuses?.cell!} onChange={(val: any) => handleSettingUpdate({ radiuses: { cell: val } })} />
              </div>
            }
          />

          <IconButton 
            icon={Cube} 
            label="Hücre Gölgesi" 
            popoverId="boxShadow" 
            activePopover={activePopover}
            onTogglePopover={setActivePopover}
            isActive={activePopover === 'boxShadow'} 
            popoverContent={
              <div onPointerDownCapture={(e) => e.stopPropagation()} onMouseDownCapture={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <ShadowPicker value={activeSettings?.shadows?.cell!} onChange={(val: any) => handleSettingUpdate({ shadows: { cell: val } })} />
              </div>
            }
          />
        </div>

        <Divider />

        <div className="flex items-center gap-0.5 relative">
          <IconButton icon={Copy} label="Kopyala" onClick={copySlotSettings} />
          <IconButton icon={ClipboardText} label="Yapıştır" onClick={pasteSlotSettings} disabled={!copiedSlotSettings} />
          <Divider />
          {selectedSlot?.isCustom ? (
            <IconButton icon={Intersect} label="Global Yap" onClick={clearSlotSettings} isActive={true} />
          ) : (
            <IconButton icon={MagicWand} label="Özelleştir" onClick={() => toggleSlotCustomSettings(true)} />
          )}
          <IconButton icon={Eraser} label="Temizle" onClick={clearSlotSettings} danger />
        </div>

        <Divider />

        <div className="flex items-center gap-0.5 relative">
          <IconButton icon={Layers} label="Serbest Alan Yap" onClick={() => toggleSlotRole('free')} isActive={false} />
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. ARKA PLAN ARAÇ ÇUBUĞU (VARSAYILAN)
  // ==========================================
  return (
    <div id="contextual-bar" ref={barRef} className="h-12 bg-transparent flex items-center justify-between px-4 shrink-0 z-40 relative">
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
          icon={ArrowsOut} 
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
      </div>
    </div>
  );
}