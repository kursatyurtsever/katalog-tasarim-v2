"use client";

import { useCatalogStore } from "@/store/useCatalogStore";
import {
  Package, DollarSign, Image as ImageIcon,
  Square, Box, Copy, ClipboardPaste, Eraser, Settings2,
  Wand2, Combine,
  Type, AlignLeft, AlignCenter, AlignRight, // YENİ: Metin ikonları
  Maximize // YENİ: Yayma ikonu
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { ColorOpacityPicker } from "./ColorOpacityPicker";
import { BorderRadiusPicker } from "./BorderRadiusPicker";
import { ShadowPicker } from "./ShadowPicker";
import { useLayerStore } from "@/store/useLayerStore";
import { v4 as uuidv4 } from "uuid";
import { Layer } from "@/types/document";

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

export function ContextualBar() {
  const {
    selectedSlotIds, clearSlotSettings, copySlotSettings, pasteSlotSettings,
    copiedSlotSettings, globalSettings, setGlobalSettings, updateGlobalSettings,
    formas, activeFormaId, selectedPageNumber,
    updateSlotImageSettings, updateSlotCustomSettings,
    toggleSlotCustomSettings,
    selectedTextElement, setSelectedTextElement, // YENİ: Metin seçimi eklendi
    setSidebarState,
    contextualBarFormaId, contextualBarSelectedPages, setContextualBarFormaId, setContextualBarSelectedPages,
    setActiveFormaId,
    activeTemplate,
  } = useCatalogStore();

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
      // Tüm forma seçili
      scopeText += " (Tüm Sayfalar)";
    } else if (contextualBarSelectedPages.length === 1) {
      // Tek sayfa seçili
      scopeText += ` (Sayfa ${contextualBarSelectedPages[0]})`;
    } else if (contextualBarSelectedPages.length > 1) {
      // Birden fazla sayfa seçili
      const pageNumbers = [...contextualBarSelectedPages].sort((a, b) => a - b).join(", ");
      scopeText += ` (Sayfa ${pageNumbers})`;
    }
    return scopeText;
  };

  const handleBackgroundColorChange = (color: string, opacity: number) => {
    // 1. Hedef maskeyi belirle
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

    // 2. Mevcut maske ve tiple eşleşen bir 'solid' katman var mı bak
    const existingLayer = layers.find(l => 
      l.type === 'solid' && 
      l.mask &&
      l.mask.type === maskType && 
      JSON.stringify(l.mask.targetIds || []) === JSON.stringify(targetIds)
    );

    if (existingLayer) {
      // Güncelle
      updateLayerProperties(existingLayer.id, { color, opacity });
    } else {
      // Yeni Oluştur
      const newId = uuidv4();
      const newLayer: Layer = {
        id: newId,
        type: 'solid',
        name: 'Arka Plan (Renk)',
        bounds: { x: 0, y: 0, w: activeTemplate?.openWidthMm || 210, h: activeTemplate?.openHeightMm || 297 },
        transform: { rotation: 0, scale: 100, flipX: false, flipY: false, offsetX: 0, offsetY: 0 },
        mask: { type: maskType, targetIds },
        zIndex: 0, // En alta dayalı
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

  if (selectedSlotIds.length === 1) {
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

  const selectedPage = selectedPageNumber !== null
    ? pages.find((p) => p.pageNumber === selectedPageNumber)
    : null;



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

  const Divider = () => <div className="w-px h-5 bg-slate-200 mx-1"></div>;

  const IconButton = ({ icon: Icon, label, onClick, disabled = false, danger = false, isActive = false, popoverId }: any) => (
    <div className="relative group flex items-center justify-center">
      <button 
        onClick={(e) => {
          if (popoverId) {
            setActivePopover(activePopover === popoverId ? null : popoverId);
          } else if (onClick) {
            onClick(e);
          }
        }}
        disabled={disabled}
        className={`p-1.5 rounded transition-all flex items-center justify-center
          ${disabled ? 'text-slate-300 cursor-not-allowed' :
            danger ? 'text-slate-500 hover:text-red-500 hover:bg-red-50' :
            isActive ? 'text-blue-600 bg-blue-50' :
            'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
          `}
      >
        <Icon size={14} strokeWidth={2.5} />
      </button>
      {activePopover !== popoverId && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
          {label}
        </span>
      )}
    </div>
  );

  // ==========================================
  // 1. DURUM: EĞER BİR METİN SEÇİLİYSE (TEXT TOOLBAR)
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
      <div ref={barRef} className="h-12 bg-indigo-50/80 border-b border-indigo-200 flex items-center justify-center px-4 gap-2 shrink-0 shadow-sm z-40 relative">
        
        {/* Hangi Metnin Düzenlendiği Bilgisi */}
        <div className="flex items-center gap-1.5 pr-2 mr-1">
          <Type size={14} className="text-indigo-600" />
          <span className="text-[11px] font-black text-indigo-800 uppercase tracking-widest">
            {isName ? 'Ürün İsmi' : isPrice ? 'Fiyat' : 'Etiket'}
          </span>
        </div>
        <Divider />

        {/* FONT AİLESİ */}
        <select 
          value={currentFont.fontFamily} 
          onChange={(e) => handleFontUpdate({ ...currentFont, fontFamily: e.target.value })} 
          className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded p-1.5 outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Arial">Arial</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Oswald">Oswald</option>
        </select>

        {/* FONT KALINLIĞI */}
        <select 
          value={currentFont.fontWeight} 
          onChange={(e) => handleFontUpdate({ ...currentFont, fontWeight: e.target.value })} 
          className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded p-1.5 outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="400">Normal</option>
          <option value="500">Orta</option>
          <option value="700">Kalın</option>
          <option value="900">Çok Kalın</option>
        </select>

        {/* PUNTO BÜYÜKLÜĞÜ */}
        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded p-1" title="Punto">
          <span className="text-[10px] text-slate-400 font-bold pl-1">PT</span>
          <input 
            type="number" 
            value={currentFont.fontSize} 
            onChange={(e) => handleFontUpdate({ ...currentFont, fontSize: parseInt(e.target.value) || 12 })} 
            className="w-10 text-[11px] font-bold text-slate-700 bg-transparent text-center outline-none" 
          />
        </div>

        {/* YAZI RENGİ */}
        <div className="relative group flex items-center justify-center ml-1" onClick={() => setActivePopover(null)}>
          <ColorOpacityPicker 
            color={currentFont.color} 
            opacity={currentFont.opacity} 
            onChange={(c, o) => handleFontUpdate({ ...currentFont, color: c, opacity: o })} 
          />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Yazı Rengi</span>
        </div>

        <Divider />

        {/* YATAY HİZALAMA */}
        <div className="flex items-center bg-white border border-slate-200 rounded overflow-hidden">
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'left' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'left' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`} title="Sola Hizala"><AlignLeft size={14} /></button>
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'center' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'center' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`} title="Ortala"><AlignCenter size={14} /></button>
          <button onClick={() => handleFontUpdate({ ...currentFont, textAlign: 'right' })} className={`p-1.5 transition-colors ${currentFont.textAlign === 'right' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`} title="Sağa Hizala"><AlignRight size={14} /></button>
        </div>

        <Divider />

        {/* DİKEY HİZALAMA */}
        <div className="flex items-center bg-white border border-slate-200 rounded overflow-hidden">
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'top' })} className={`px-2 py-1.5 transition-colors ${currentFont.verticalAlign === 'top' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`} title="Üste Hizala"><span className="text-[10px] font-bold">ÜST</span></button>
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'middle' })} className={`px-2 py-1.5 transition-colors ${currentFont.verticalAlign === 'middle' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`} title="Ortaya Hizala"><span className="text-[10px] font-bold">ORTA</span></button>
          <button onClick={() => handleFontUpdate({ ...currentFont, verticalAlign: 'bottom' })} className={`px-2 py-1.5 transition-colors ${currentFont.verticalAlign === 'bottom' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`} title="Alta Hizala"><span className="text-[10px] font-bold">ALT</span></button>
        </div>

        {/* SADECE FİYAT İÇİN EKSTRALAR */}
        {isPrice && (
          <>
            <Divider />
            {/* KÜSURAT BÜYÜKLÜĞÜ */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded p-1" title="Küsürat Büyüklüğü (%)">
              <span className="text-[10px] text-slate-400 font-bold pl-1">,00</span>
              <input 
                type="number" 
                value={currentFont.decimalScale || 50} 
                onChange={(e) => handleFontUpdate({ ...currentFont, decimalScale: parseInt(e.target.value) || 50 })} 
                className="w-10 text-[11px] font-bold text-slate-700 bg-transparent text-center outline-none" 
              />
              <span className="text-[10px] text-slate-400 font-bold pr-1">%</span>
            </div>

            <Divider />

            {/* FİYAT GENİŞLİK VE YÜKSEKLİK */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded p-1 px-2" title="Fiyat Kutusu Boyutları">
              <div className="flex items-center gap-0.5" title="Genişlik (%)">
                <span className="text-[9px] text-slate-400 font-bold">G:</span>
                <input 
                  type="number" 
                  value={activeSettings.priceWidth || 50} 
                  onChange={(e) => handleSettingUpdate({ priceWidth: parseInt(e.target.value) || 50 })} 
                  className="w-8 text-[11px] font-bold text-slate-700 bg-transparent text-center outline-none" 
                />
              </div>
              <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
              <div className="flex items-center gap-0.5" title="Yükseklik (mm)">
                <span className="text-[9px] text-slate-400 font-bold">Y:</span>
                <input 
                  type="number" 
                  value={activeSettings.priceHeight || 10} 
                  onChange={(e) => handleSettingUpdate({ priceHeight: parseInt(e.target.value) || 10 })} 
                  className="w-8 text-[11px] font-bold text-slate-700 bg-transparent text-center outline-none" 
                />
              </div>
            </div>

            <Divider />

            {/* FİYAT ZEMİN RENGİ */}
            <div className="relative group flex items-center justify-center" onClick={() => setActivePopover(null)}>
              <ColorOpacityPicker 
                color={activeSettings.colors.priceBg.c} 
                opacity={activeSettings.colors.priceBg.o} 
                onChange={(c, o) => handleSettingUpdate({ colors: { ...activeSettings.colors, priceBg: { c, o } } })} 
              />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Fiyat Zemini</span>
            </div>

            <Divider />

            {/* FİYAT KONTURU */}
            <div className="relative group flex items-center justify-center" onClick={() => setActivePopover(null)}>
              <ColorOpacityPicker 
                type="border"
                color={activeSettings.colors.priceBorder?.c || "#ffffff"} 
                opacity={activeSettings.colors.priceBorder?.o ?? 100} 
                thickness={activeSettings.priceBorderWidth ?? 0}
                onChange={(c, o) => handleSettingUpdate({ colors: { ...activeSettings.colors, priceBorder: { c, o } } })} 
                onThicknessChange={(thickness) => handleSettingUpdate({ priceBorderWidth: thickness })}
              />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Fiyat Konturu</span>
            </div>

            {/* FİYAT KÖŞE OVALLİĞİ */}
            <div className="relative">
              <IconButton icon={Square} popoverId="priceRadius" isActive={activePopover === 'priceRadius'} label="Fiyat Köşeleri" />
              {activePopover === 'priceRadius' && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-64 z-50" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fiyat Köşe Ovalliği</span>
                  <BorderRadiusPicker value={activeSettings.radiuses.price} onChange={(val: any) => handleSettingUpdate({ radiuses: { ...activeSettings.radiuses, price: val } })} />
                </div>
              )}
            </div>
          </>
        )}

        <Divider />
        {/* DETAYLI AYARLAR (Koşullu: Custom ise customCell/price, değilse price) */}
        <button 
          onClick={() => {
            if (selectedSlot?.isCustom) {
              setSidebarState("settings", "customCell", "price");
            } else {
              setSidebarState("settings", "price", null);
            }
            setActivePopover(null);
          }}
          className="text-[10px] font-bold bg-slate-200 text-slate-600 hover:bg-slate-300 px-3 py-1.5 rounded transition-colors"
        >
          Detaylı Ayarlar
        </button>
      </div>
    );
  }

  // ==========================================
  // 2. DURUM: STANDART HÜCRE TOOLBARI (Eski Hali)
  // ==========================================
  if (selectedSlotIds.length === 1) {
    return (
      <div ref={barRef} className="h-12 bg-white border-b border-slate-200 flex items-center justify-center px-4 gap-1.5 shrink-0 shadow-sm z-40 relative">
        <div className="flex items-center gap-2 pr-2 mr-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Hücre</span>
        </div>
        <Divider />

        <div className="flex items-center gap-2 relative">
          {/* RESİM AYARLARI */}
          <IconButton icon={ImageIcon} label="Resim Ayarları" popoverId="imageSettings" isActive={activePopover === "imageSettings"} />
          {activePopover === "imageSettings" && selectedSlot && (
            <div className="absolute top-10 left-0 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ürün Görseli Ayarları</span>
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-xs font-bold text-slate-700">Serbest Konum</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={imgEditMode} onChange={(e) => updateSlotImageSettings(selectedPageNum, selectedSlot.id, { editMode: e.target.checked })} />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className={`flex flex-col gap-2 transition-opacity ${!imgEditMode ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Büyütme</span>
                  <span className="text-[10px] font-bold text-blue-600">%{imgScale}</span>
                </div>
                <input type="range" min="10" max="300" value={imgScale} onChange={(e) => updateSlotImageSettings(selectedPageNum, selectedSlot.id, { scale: parseInt(e.target.value) })} className="w-full accent-blue-600" />
              </div>
              <button onClick={() => updateSlotImageSettings(selectedPageNum, selectedSlot.id, { editMode: false, scale: 100, posX: 0, posY: 0 })} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded transition-colors border border-slate-200 shadow-sm mt-1">Konumu ve Boyutu Sıfırla</button>
            </div>
          )}
          
          {/* ZEMİN RENGİ */}
          <div className="relative group flex items-center justify-center" onClick={() => setActivePopover(null)}>
            <ColorOpacityPicker color={activeSettings?.colors?.cellBg?.c || "#ffffff"} opacity={activeSettings?.colors?.cellBg?.o ?? 100} onChange={(c, o) => handleSettingUpdate({ colors: { cellBg: { c, o } } })} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Zemin Rengi</span>
          </div>

          {/* KENARLIK RENGİ VE KALINLIĞI */}
          <div className="relative group flex items-center justify-center" onClick={() => setActivePopover(null)}>
            <ColorOpacityPicker type="border" color={activeSettings?.colors?.cellBorder?.c || "#e2e8f0"} opacity={activeSettings?.colors?.cellBorder?.o ?? 100} thickness={activeSettings?.borderWidth ?? 1} onChange={(c, o) => handleSettingUpdate({ colors: { cellBorder: { c, o } } })} onThicknessChange={(thickness) => handleSettingUpdate({ borderWidth: thickness })} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Kenarlık</span>
          </div>

          {/* KÖŞE OVALLİĞİ POPOVER */}
          <div className="relative">
            <IconButton icon={Square} popoverId="borderRadius" isActive={activePopover === 'borderRadius'} label="Köşe Ovalliği" />
            {activePopover === 'borderRadius' && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-64 z-50 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Köşe Ovalliği {selectedSlot?.isCustom ? "(Özel)" : "(Global)"}</span>
                <BorderRadiusPicker value={{ tl: activeSettings?.radiuses?.cell?.tl ?? 0, tr: activeSettings?.radiuses?.cell?.tr ?? 0, bl: activeSettings?.radiuses?.cell?.bl ?? 0, br: activeSettings?.radiuses?.cell?.br ?? 0, linked: activeSettings?.radiuses?.cell?.linked ?? true }} onChange={(newRadius: any) => handleSettingUpdate({ radiuses: { cell: newRadius } })} />
              </div>
            )}
          </div>

          {/* HÜCRE GÖLGESİ POPOVER */}
          <div className="relative">
            <IconButton icon={Box} label="Hücre Gölgesi" popoverId="boxShadow" isActive={activePopover === 'boxShadow'} />
            {activePopover === 'boxShadow' && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-64 z-50 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hücre Gölgesi {selectedSlot?.isCustom ? "(Özel)" : "(Global)"}</span>
                <ShadowPicker value={activeSettings?.shadows?.cell || { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, active: false }} onChange={(newShadow: any) => handleSettingUpdate({ shadows: { cell: newShadow } })} />
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* STİL KOPYALAMA GRUBU */}
        <div className="flex items-center gap-0.5 relative">
          <IconButton icon={Copy} label="Stili Kopyala" onClick={copySlotSettings} />
          <IconButton icon={ClipboardPaste} label="Stili Yapıştır" onClick={pasteSlotSettings} disabled={!copiedSlotSettings} />
          
          <Divider />

          {selectedSlot?.isCustom ? (
            <IconButton icon={Combine} label="Global Hücre Yap (Genel Tasarıma Bağla)" onClick={clearSlotSettings} isActive={true} />
          ) : (
            <IconButton icon={Wand2} label="Özel Hücre Yap (Sadece Buna Uygula)" onClick={() => toggleSlotCustomSettings(true)} />
          )}

          <IconButton icon={Eraser} label="İçeriği Temizle" onClick={clearSlotSettings} danger />
        </div>

        <Divider /> 

        <button 
          onClick={() => {
            if (selectedSlot?.isCustom) {
              setSidebarState("settings", "customCell", null);
            } else {
              setSidebarState("settings", "cell", null);
            }
            setActivePopover(null);
          }}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded transition-colors flex items-center gap-1.5"
        >
          <Settings2 size={14} strokeWidth={2.5} /> Detaylı Ayarlar
        </button>
      </div>
    );
  }

  // ==========================================
  // 3. DURUM: ARKA PLAN AYARLARI TOOLBARI (YENİ)
  // ==========================================
  if (selectedSlotIds.length === 0) {
    return (
      <div ref={barRef} className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-40 relative">
        <div className="flex flex-row items-center gap-4 w-full">
          {/* 1. Global Kontrol (Sol) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700">Tüm Broşüre Uygula</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!isGlobalApplyActive}
                onChange={(e) => {
                  
                }}
              />
              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <Divider />

          {/* 2. Kapsam Seçimi (Orta-Sol) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700">Düzenleme Kapsamı:</span>
            <select
              className={`text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded p-1.5 outline-none focus:border-indigo-500 cursor-pointer ${isGlobalApplyActive ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
              value={contextualBarFormaId || ""}
              onChange={(e) => {
                const newFormaId = parseInt(e.target.value, 10);
                if (newFormaId) {
                  setActiveFormaId(newFormaId);
                  setContextualBarFormaId(e.target.value);
                  setContextualBarSelectedPages([]); // Forma değiştiğinde sayfa seçimini sıfırla
                }

                const selectedForma = formas.find(f => f.id === newFormaId);
                if (selectedForma && selectedForma.pages.length > 0) {
                  // Sayfaları pageNumber'a göre sırala ve ilkini al
                  const firstPage = selectedForma.pages.slice().sort((a, b) => a.pageNumber - b.pageNumber)[0];
                  const pageElement = document.getElementById(`page-${firstPage.pageNumber}`);
                  if (pageElement) {
                    pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }
              }}
              disabled={isGlobalApplyActive}
            >
              <option value="">Forma Seç</option>
              {formas.map((f) => (
                <option key={f.id} value={f.id.toString()}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Sayfa Seçimi (Orta) */}
          {currentFormaScope && ( // Sadece bir forma seçiliyse Sayfa Seçimi pill'lerini göster
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-700">Sayfa Seçimi:</span>
              <div className={`flex gap-1 ${isGlobalApplyActive || !currentFormaScope ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => {
                    if (currentFormaScope) {
                      if (contextualBarSelectedPages.length === currentFormaScope.pages.length) {
                        setContextualBarSelectedPages([]); // Hepsi seçiliyse temizle
                        selectPages([]); // LayerStore'u da temizle
                      } else {
                        const allNumbers = currentFormaScope.pages.map(p => p.pageNumber);
                        setContextualBarSelectedPages(allNumbers); // Hepsini seç
                        const allIds = currentFormaScope.pages.map(p => p.id);
                        selectPages(allIds); // LayerStore'u da senkronize et
                      }
                    }
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors
                    ${contextualBarSelectedPages.length === currentFormaScope.pages.length
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                  `}
                  disabled={isGlobalApplyActive || !currentFormaScope}
                >
                  Tümü
                </button>
                {currentFormaScope.pages.map((page) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => {
                      const pageElement = document.getElementById(`page-${page.pageNumber}`);
                      if (pageElement) {
                        pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                      const targetForma = formas.find(f => f.pages.some(p => p.pageNumber === page.pageNumber));
                      if (targetForma) {
                        setActiveFormaId(targetForma.id);
                      }
                      const newSelectedPages = contextualBarSelectedPages.includes(page.pageNumber)
                        ? contextualBarSelectedPages.filter((p) => p !== page.pageNumber)
                        : [...contextualBarSelectedPages, page.pageNumber];

                      setContextualBarSelectedPages(newSelectedPages);
                      
                      // LayerStore ile senkronize et
                      if (targetForma) {
                         const layerPageIds = newSelectedPages
                           .map(num => targetForma.pages.find(p => p.pageNumber === num)?.id)
                           .filter(Boolean) as string[];
                         selectPages(layerPageIds);
                      }
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors
                      ${contextualBarSelectedPages.includes(page.pageNumber)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    `}
                    disabled={isGlobalApplyActive || !currentFormaScope}
                  >
                    {page.pageNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Divider />

          {/* Dinamik Durum Metni (Sağ) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
              {displayScopeText()}
            </span>
          </div>

          <Divider />

          {/* Zemin Rengi */}
          <div className="relative group flex items-center justify-center" onClick={() => setActivePopover(null)}>
            <ColorOpacityPicker
              color={initialBackgroundColor?.color || "#ffffff"}
              opacity={initialBackgroundColor?.opacity ?? 100}
              onChange={handleBackgroundColorChange}
            />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">Zemin Rengi</span>
          </div>

          <Divider />

          {/* Formaya Yay (Spread) Butonu */}
          <div className="flex items-center gap-1">
             <IconButton 
                icon={Maximize} 
                label="Formaya Yay (Spread)" 
                isActive={initialBackgroundColor !== null && layers.some(l => l.type === 'solid' && l.mask?.type === 'spread' && l.properties.color === initialBackgroundColor.color)}
                onClick={() => {
                  // Mevcut seçili kapsamdaki layer'ı bul
                  const targetIds = contextualBarSelectedPages.map(num => currentFormaScope?.pages.find(p => p.pageNumber === num)?.id).filter(Boolean) as string[];
                  const pageLayer = layers.find(l => l.type === 'solid' && l.mask?.type === 'page' && JSON.stringify(l.mask.targetIds) === JSON.stringify(targetIds));
                  
                  if (pageLayer && currentFormaScope) {
                    const allFormaPageIds = currentFormaScope.pages.map(p => p.id);
                    setLayerMask(pageLayer.id, { type: 'spread', targetIds: allFormaPageIds });
                    fitLayerToPages(pageLayer.id, allFormaPageIds);
                  }
                }}
                disabled={isGlobalApplyActive || contextualBarSelectedPages.length === 0}
             />
          </div>

          {/* Detaylı Ayarlar Butonu */}
          <button
            onClick={() => {
              setSidebarState("settings", "background", null);
              setActivePopover(null);
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded transition-colors flex items-center gap-1.5"
          >
            <Settings2 size={14} strokeWidth={2.5} /> Detaylı Ayarlar
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // Varsayılan durum: Hiçbir şey seçili değilse
  // ==========================================
  return (
    <div ref={barRef} className="h-12 bg-white border-b border-slate-200 flex items-center justify-center px-4 gap-1.5 shrink-0 shadow-sm z-40 relative">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Bir öğe seçin</span>
    </div>
  );
}
