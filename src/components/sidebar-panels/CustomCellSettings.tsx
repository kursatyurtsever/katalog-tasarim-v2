"use client";

import { useState } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { BorderRadiusPicker } from "../BorderRadiusPicker";
import { SpacingPicker } from "../SpacingPicker";
import { ShadowPicker } from "../ShadowPicker";

interface Props { isOpen: boolean; onToggle: () => void; }

export function CustomCellSettings({ isOpen, onToggle }: Props) {
  const { pages, globalSettings, selectedSlotIds, toggleSlotCustomSettings, updateSlotCustomSettings, copySlotSettings, pasteSlotSettings, copiedSlotSettings, clearSlotSettings } = useCatalogStore();
  
  const [activeTab, setActiveTab] = useState<string | null>("cell");

  let globalNumberCounter = 0;
  let selectedGlobalNumber: number | null = null;
  let selectedSlot: any = null;
  
  pages.forEach(p => {
    let startIdx = p.pageNumber === 1 ? 4 : p.pageNumber === 6 ? 8 : 0;
    p.slots.forEach((s, idx) => {
      if (idx >= startIdx && !s.hidden) {
        globalNumberCounter++;
        if (selectedSlotIds.length === 1 && s.id === selectedSlotIds[0]) {
          selectedGlobalNumber = globalNumberCounter;
          selectedSlot = s;
        }
      }
    });
  });

  const isCustomActive = selectedSlot?.isCustom || false;
  const customSettings = selectedSlot?.customSettings || globalSettings;

  return (
    <div className="bg-white rounded-md border border-purple-200 shadow-sm mb-4 relative z-30">
      <button onClick={onToggle} className={`w-full flex items-center justify-between p-3 bg-purple-700 hover:bg-purple-600 transition-colors ${isOpen ? "rounded-t-md" : "rounded-md"}`}>
        <span className="text-[11px] font-black text-white uppercase tracking-widest">Özel Hücre Ayarları</span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-purple-50 border-t border-purple-200 space-y-4 rounded-b-md">
          {selectedSlotIds.length !== 1 ? (
            <div className="text-[10px] text-center text-slate-500 font-bold p-4 bg-white rounded border border-slate-200 shadow-sm">
              Lütfen tablodan sadece BİR adet hücre seçin.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-slate-600">Seçili Hücre: #{selectedGlobalNumber}</span>
              </div>
              
              <div className="flex gap-1 bg-white p-2 rounded border border-slate-200 shadow-sm">
                <button onClick={copySlotSettings} className="flex-1 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[9px] font-bold hover:bg-blue-100 transition-colors">
                  Kopyala
                </button>
                <button 
                  onClick={pasteSlotSettings} 
                  disabled={!copiedSlotSettings} 
                  className={`flex-1 py-1.5 rounded text-[9px] font-bold border transition-colors ${copiedSlotSettings ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                >
                  Yapıştır
                </button>
                <button onClick={clearSlotSettings} className="flex-1 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-[9px] font-bold hover:bg-red-100 transition-colors">
                  Temizle
                </button>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded border border-purple-300 shadow-sm mt-4">
                <span className="text-[10px] font-black text-purple-700">Bu Hücreyi Özelleştir</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isCustomActive} onChange={(e) => toggleSlotCustomSettings(e.target.checked)} />
                  <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
                </label>
              </div>

              <div className={`space-y-2 transition-all duration-300 ${isCustomActive ? "opacity-100" : "opacity-30 pointer-events-none blur-[1px]"}`}>
                
                {/* 1. HÜCRE TASARIMI */}
                <div className={`bg-white rounded border border-purple-200 shadow-sm relative z-[60] ${activeTab === 'cell' ? 'overflow-visible' : 'overflow-hidden'}`}>
                  <button onClick={() => setActiveTab(activeTab === 'cell' ? null : 'cell')} className="w-full flex items-center justify-between p-2.5 bg-purple-50 hover:bg-purple-100 transition-colors border-b border-purple-100">
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">1. Hücre Tasarımı</span>
                    <span className="text-purple-500 font-bold">{activeTab === 'cell' ? "▼" : "▶"}</span>
                  </button>
                  {activeTab === 'cell' && (
                    <div className="p-3 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
                          <ColorOpacityPicker color={customSettings.colors?.cellBg?.c || "#fff"} opacity={customSettings.colors?.cellBg?.o || 100} onChange={(c, o) => updateSlotCustomSettings({ colors: { cellBg: { c, o } } })} />
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-purple-50">
                          <span className="text-[10px] font-bold text-slate-600">Kenarlık Rengi</span>
                          <ColorOpacityPicker color={customSettings.colors?.cellBorder?.c || "#000"} opacity={customSettings.colors?.cellBorder?.o || 100} onChange={(c, o) => updateSlotCustomSettings({ colors: { cellBorder: { c, o } } })} />
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-50">
                          <span className="text-[9px] font-medium text-slate-500 w-16">Kalınlık</span>
                          <input type="range" min="0" max="10" step="0.5" value={customSettings.borderWidth || 0} onChange={(e) => updateSlotCustomSettings({ borderWidth: parseFloat(e.target.value) })} className="flex-1 accent-purple-600" />
                          <div className="flex items-center gap-1">
                            <input type="number" value={customSettings.borderWidth || 0} onChange={(e) => updateSlotCustomSettings({ borderWidth: parseFloat(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
                            <span className="text-[9px] text-slate-400">px</span>
                          </div>
                        </div>
                      </div>
                      <BorderRadiusPicker title="Hücre Köşe Ovalliği" value={customSettings.radiuses?.cell!} onChange={(val) => updateSlotCustomSettings({ radiuses: { cell: val } })} />
                      <SpacingPicker title="Hücre İç Boşluğu" value={customSettings.spacings?.cell!} onChange={(val) => updateSlotCustomSettings({ spacings: { cell: val } })} />
                      <ShadowPicker title="Hücre Gölgesi" value={customSettings.shadows?.cell!} onChange={(val) => updateSlotCustomSettings({ shadows: { cell: val } })} />
                    </div>
                  )}
                </div>

                {/* 2. ÜRÜN GÖRSELİ */}
                <div className={`bg-white rounded border border-blue-200 shadow-sm relative z-[50] ${activeTab === 'image' ? 'overflow-visible' : 'overflow-hidden'}`}>
                  <button onClick={() => setActiveTab(activeTab === 'image' ? null : 'image')} className="w-full flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100 transition-colors border-b border-blue-100">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">2. Ürün Görseli</span>
                    <span className="text-blue-500 font-bold">{activeTab === 'image' ? "▼" : "▶"}</span>
                  </button>
                  {activeTab === 'image' && (
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 shadow-inner">
                        <span className="text-[10px] font-bold text-slate-700">Serbest Konum</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={customSettings.imageEditMode || false} onChange={(e) => updateSlotCustomSettings({ imageEditMode: e.target.checked })} />
                          <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                        </label>
                      </div>

                      <div className={`space-y-3 transition-all duration-300 ${customSettings.imageEditMode ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-medium text-slate-500 w-16">Büyütme</span>
                          <input type="range" min="50" max="300" value={customSettings.imageScale || 100} onChange={(e) => updateSlotCustomSettings({ imageScale: parseInt(e.target.value) })} className="flex-1 accent-blue-600" />
                          <div className="flex items-center gap-1">
                            <input type="number" value={customSettings.imageScale || 100} onChange={(e) => updateSlotCustomSettings({ imageScale: parseInt(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
                            <span className="text-[9px] text-slate-400">%</span>
                          </div>
                        </div>

                        <button onClick={() => updateSlotCustomSettings({ imageScale: 100, imagePosX: 0, imagePosY: 0 })} className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold rounded border border-slate-200 transition-colors">
                          Konumu ve Boyutu Sıfırla
                        </button>
                        <p className="text-[8px] text-slate-400 text-center leading-tight">Serbest Konum açıkken hücredeki resmi farenizle sürükleyerek kaydırabilirsiniz.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. ÜRÜN İSMİ */}
                <div className={`bg-white rounded border border-indigo-200 shadow-sm relative z-[40] ${activeTab === 'name' ? 'overflow-visible' : 'overflow-hidden'}`}>
                  <button onClick={() => setActiveTab(activeTab === 'name' ? null : 'name')} className="w-full flex items-center justify-between p-2.5 bg-indigo-50 hover:bg-indigo-100 transition-colors border-b border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">3. Ürün İsmi</span>
                    <span className="text-indigo-500 font-bold">{activeTab === 'name' ? "▼" : "▶"}</span>
                  </button>
                  {activeTab === 'name' && (
                    <div className="p-3">
                      <TypographyPicker title="Ürün İsmi Fontu" value={customSettings.fonts?.productName!} onChange={(val) => updateSlotCustomSettings({ fonts: { productName: val } })} />
                    </div>
                  )}
                </div>

                {/* 4. FİYAT KUTUSU */}
                <div className={`bg-white rounded border border-orange-200 shadow-sm relative z-[30] ${activeTab === 'price' ? 'overflow-visible' : 'overflow-hidden'}`}>
                  <button onClick={() => setActiveTab(activeTab === 'price' ? null : 'price')} className="w-full flex items-center justify-between p-2.5 bg-orange-50 hover:bg-orange-100 transition-colors border-b border-orange-100">
                    <span className="text-[10px] font-black text-orange-700 uppercase tracking-wider">4. Fiyat Kutusu</span>
                    <span className="text-orange-500 font-bold">{activeTab === 'price' ? "▼" : "▶"}</span>
                  </button>
                  {activeTab === 'price' && (
                    <div className="p-3 space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 block">Fiyat Kutusu Konumu</span>
                        <div className="flex bg-slate-50 rounded p-1 gap-1 border border-slate-100">
                          {['left', 'center', 'right'].map((pos) => (
                            <button 
                              key={pos} 
                              onClick={() => updateSlotCustomSettings({ pricePosition: pos as any })} 
                              className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${customSettings.pricePosition === pos ? 'bg-white shadow border border-slate-200 text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              {pos === 'left' ? 'Sol' : pos === 'center' ? 'Orta' : 'Sağ'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-orange-50">
                        <span className="text-[9px] font-medium text-slate-500 w-16">Genişlik</span>
                        <input type="range" min="10" max="100" value={customSettings.priceWidth || 50} onChange={(e) => updateSlotCustomSettings({ priceWidth: parseInt(e.target.value) })} className="flex-1 accent-orange-600" />
                        <div className="flex items-center gap-1">
                          <input type="number" value={customSettings.priceWidth || 50} onChange={(e) => updateSlotCustomSettings({ priceWidth: parseInt(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
                          <span className="text-[9px] text-slate-400">%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[9px] font-medium text-slate-500 w-16">Yükseklik</span>
                        <input type="range" min="5" max="30" value={customSettings.priceHeight || 10} onChange={(e) => updateSlotCustomSettings({ priceHeight: parseInt(e.target.value) })} className="flex-1 accent-orange-600" />
                        <div className="flex items-center gap-1">
                          <input type="number" value={customSettings.priceHeight || 10} onChange={(e) => updateSlotCustomSettings({ priceHeight: parseInt(e.target.value) || 0 })} className="w-12 text-[10px] font-bold text-slate-600 text-right border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
                          <span className="text-[9px] text-slate-400">mm</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-orange-50">
                        <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
                        <ColorOpacityPicker color={customSettings.colors?.priceBg?.c || "#e60000"} opacity={customSettings.colors?.priceBg?.o || 100} onChange={(c, o) => updateSlotCustomSettings({ colors: { priceBg: { c, o } } })} />
                      </div>

                      <div className="pt-2 border-t border-orange-50">
                        <BorderRadiusPicker title="Fiyat Kutusu Ovalliği" value={customSettings.radiuses?.price!} onChange={(val) => updateSlotCustomSettings({ radiuses: { price: val } })} />
                      </div>

                      <div className="pt-2 border-t border-orange-50">
                        <TypographyPicker title="Fiyat Fontu" value={customSettings.fonts?.price!} onChange={(val) => updateSlotCustomSettings({ fonts: { price: val } })} />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. PROMOSYON ETİKETİ */}
                <div className={`bg-white rounded border border-green-200 shadow-sm relative z-[20] ${activeTab === 'badge' ? 'overflow-visible' : 'overflow-hidden'}`}>
                  <button onClick={() => setActiveTab(activeTab === 'badge' ? null : 'badge')} className="w-full flex items-center justify-between p-2.5 bg-green-50 hover:bg-green-100 transition-colors border-b border-green-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">5. Promosyon Etiketi</span>
                      {customSettings.badge?.active && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                    </div>
                    <span className="text-green-500 font-bold">{activeTab === 'badge' ? "▼" : "▶"}</span>
                  </button>
                  {activeTab === 'badge' && (
                    <div className="p-3 space-y-4">
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 shadow-inner">
                        <span className="text-[10px] font-bold text-slate-700">Etiketi Göster</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={customSettings.badge?.active || false} onChange={(e) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, active: e.target.checked } })} />
                          <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-600 shadow-inner"></div>
                        </label>
                      </div>

                      <div className={`space-y-3 transition-all duration-300 ${customSettings.badge?.active ? 'opacity-100' : 'opacity-40 pointer-events-none hidden'}`}>
                        
                        <div className="bg-slate-50 p-2 rounded border border-slate-200 shadow-inner space-y-3 mb-3 relative z-[9]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-700">Serbest Konum</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={customSettings.badge?.isFreePosition || false} onChange={(e) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, isFreePosition: e.target.checked } })} />
                              <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-600 shadow-inner"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
                            <span className="text-[9px] font-medium text-slate-500 w-12">Boyut</span>
                            <input type="range" min="50" max="250" value={customSettings.badge?.size || 100} onChange={(e) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, size: parseInt(e.target.value) } })} className="flex-1 accent-green-600" />
                            <span className="text-[9px] font-bold text-green-600 w-8 text-right">%{customSettings.badge?.size || 100}</span>
                          </div>
                          
                          {customSettings.badge?.isFreePosition && (
                            <button onClick={() => updateSlotCustomSettings({ badge: { ...customSettings.badge!, size: 100, posX: 0, posY: 0 } })} className="w-full py-1.5 mt-1 bg-white hover:bg-slate-100 text-slate-600 text-[9px] font-bold rounded border border-slate-200 transition-colors">
                              Konumu Sıfırla
                            </button>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500">Etiket Metni</span>
                          <textarea rows={2} value={customSettings.badge?.text || ""} onChange={(e) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, text: e.target.value } })} className="w-full text-[10px] font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-green-500 resize-none" placeholder={"Örn: ŞOK\nFİYAT"} />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500">Konum (Sabitken)</span>
                          <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded border border-slate-100">
                            {[
                              { id: 'top-left', label: 'Sol Üst' }, { id: 'top-right', label: 'Sağ Üst' },
                              { id: 'bottom-left', label: 'Sol Alt' }, { id: 'bottom-right', label: 'Sağ Alt' }
                            ].map((pos) => (
                              <button key={pos.id} onClick={() => updateSlotCustomSettings({ badge: { ...customSettings.badge!, position: pos.id as any } })} className={`py-1 text-[9px] font-bold rounded transition-all ${customSettings.badge?.position === pos.id ? 'bg-white shadow border border-slate-200 text-green-600' : 'text-slate-500 hover:text-slate-700'}`}>
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-green-50">
                          <span className="text-[10px] font-bold text-slate-600">Zemin Rengi</span>
                          <ColorOpacityPicker color={customSettings.badge?.bgColor || "#e60000"} opacity={100} onChange={(c, o) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, bgColor: c } })} />
                        </div>
                        
                        <div className="flex items-center justify-between pt-1 border-b border-green-100 pb-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-600">Yazı Rengi</span>
                          <ColorOpacityPicker color={customSettings.badge?.textColor || "#ffffff"} opacity={100} onChange={(c, o) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, textColor: c } })} />
                        </div>

                        <div className="space-y-1 pt-2 border-t border-green-50">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Etiket Şekli</span>
                          <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded border border-slate-100">
                            {[
                              { id: 'rectangle', label: 'Klasik' }, { id: 'pill', label: 'Oval (Pill)' },
                              { id: 'circle', label: 'Daire' },
                              { id: 'banner', label: 'Bayrak' }, { id: 'burst', label: 'Patlama' }, { id: 'flama', label: 'Flama' }
                            ].map((shape) => (
                              <button key={shape.id} onClick={() => updateSlotCustomSettings({ badge: { ...customSettings.badge!, shape: shape.id as any } })} className={`py-1 text-[9px] font-bold rounded transition-all ${customSettings.badge?.shape === shape.id ? 'bg-white shadow border border-slate-200 text-green-600' : 'text-slate-500 hover:text-slate-700'}`}>
                                {shape.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-2 mt-3 shadow-inner relative z-[8]">
                          <h4 className="text-[10px] font-black text-green-700 border-b border-green-100 pb-1 mb-2 uppercase tracking-wider">Kenarlık (Kontur)</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-600">Kenarlık Rengi</span>
                            <ColorOpacityPicker color={customSettings.badge?.borderColor || "#ffffff"} opacity={100} onChange={(c, o) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, borderColor: c } })} />
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-green-50">
                            <span className="text-[9px] font-medium text-slate-500 w-16">Kalınlık</span>
                            <input type="range" min="0" max="10" step="1" value={customSettings.badge?.borderWidth || 2} onChange={(e) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, borderWidth: parseInt(e.target.value) } })} className="flex-1 accent-green-600" />
                            <span className="text-[9px] font-bold text-slate-600 w-8 text-right">{customSettings.badge?.borderWidth || 2}px</span>
                          </div>
                        </div>

                        {customSettings.badge && (
                          <div className="pt-3 border-t border-green-100 space-y-2">
                            <TypographyPicker 
                              title="Etiket Fontu" 
                              value={customSettings.badge.font || globalSettings.badge?.font || globalSettings.fonts.price} 
                              onChange={(val) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, font: val, textColor: val.color } })} 
                            />
                            <ShadowPicker 
                              title="Etiket Gölgesi" 
                              value={customSettings.badge.shadow || globalSettings.badge?.shadow || { active: false, x: 0, y: 0, blur: 0, spread: 0, color: "#000000", opacity: 50 }} 
                              onChange={(val) => updateSlotCustomSettings({ badge: { ...customSettings.badge!, shadow: val } })} 
                            />
                          </div>
                        )}

                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}