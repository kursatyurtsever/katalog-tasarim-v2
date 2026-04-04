
"use client";

import { useMemo, useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadAction";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { useLayerStore } from "@/store/useLayerStore";
import { useCatalogStore } from "@/store/useCatalogStore";
import { Layer } from "@/types/document";
import { 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  Palette, 
  Trash2, 
  Maximize, 
  Combine, 
  Split, 
  Layers,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";

export function BackgroundSettingsPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    selectedPageIds,
    layers,
    removeLayer,
    updateLayerProperties,
    updateLayerTransform,
    selectPages: setSelectedPagesInLayerStore,
    syncGroupBackground,
  } = useLayerStore();

  const {
    formas,
    activeFormaId,
    mergePages,
    unmergePages,
  } = useCatalogStore();

  // 1. DATA SELECTORS & HELPERS
  const activeForma = useMemo(
    () => formas.find((f) => f.id === activeFormaId),
    [formas, activeFormaId]
  );

  const currentGroups = useMemo(() => activeForma?.pageMergeGroups || [], [activeForma]);

  /** 
   * KESİN ÇÖZÜM: "Target Clusters" (Groups + Singletons)
   * Seçili sayfaların her birini kapsayan grupları veya tekil sayfaları bulur.
   */
  const targetGroups = useMemo(() => {
    if (selectedPageIds.length === 0) return [];
    
    const clusters: string[][] = [];
    const handled = new Set<string>();

    selectedPageIds.forEach(id => {
      if (handled.has(id)) return;

      // Bu sayfa birleşmiş bir gruba dahil mi?
      const foundGroup = currentGroups.find(g => g.includes(id));
      if (foundGroup && foundGroup.length > 1) {
        // Birleşmiş grup — tüm grup üyelerini birlikte işle
        clusters.push(foundGroup);
        foundGroup.forEach(gid => handled.add(gid));
      } else {
        // Tekil sayfa (singleton fallback) — grupsuz da çalışır
        clusters.push([id]);
        handled.add(id);
      }
    });
    
    return clusters;
  }, [selectedPageIds, currentGroups]);

  /** 
   * Seçili grupların aktif katmanlarını bul 
   * (Birden fazla grup varsa, ilk grubun verilerini "başlangıç değeri" olarak kullanırız)
   */
  const groupLayers = useMemo(() => {
    if (targetGroups.length === 0) return { base: null, overlay: null };
    
    // İlk grubun verilerini referans al
    const firstGroup = targetGroups[0];
    const matches = (l: Layer, group: string[]) => 
      l.mask?.targetIds?.length === group.length && 
      l.mask.targetIds.every(id => group.includes(id));

    return {
      base: layers.find(l => matches(l, firstGroup) && l.type === 'solid') || null,
      overlay: layers.find(l => matches(l, firstGroup) && l.type === 'image') || null,
    };
  }, [layers, targetGroups]);

  // 2. ACTIONS
  const handleMerge = () => {
    if (selectedPageIds.length < 2) return;
    
    // İlk sayfanın özelliklerini al (Temsilci olarak)
    const firstId = selectedPageIds[0];
    const baseLayer = layers.find(l => l.type === 'solid' && l.mask?.targetIds?.length === 1 && l.mask.targetIds.includes(firstId));
    const overlayLayer = layers.find(l => l.type === 'image' && l.mask?.targetIds?.length === 1 && l.mask.targetIds.includes(firstId));

    mergePages(selectedPageIds);

    // Yeni gruba bunları uygula
    if (baseLayer) syncGroupBackground(selectedPageIds, 'base', baseLayer.properties);
    if (overlayLayer) syncGroupBackground(selectedPageIds, 'overlay', overlayLayer.properties);

    // Eski tekil katmanları temizle
    selectedPageIds.forEach(id => {
       const b = layers.find(l => l.type === 'solid' && l.mask?.targetIds?.length === 1 && l.mask.targetIds.includes(id));
       const o = layers.find(l => l.type === 'image' && l.mask?.targetIds?.length === 1 && l.mask.targetIds.includes(id));
       if (b) removeLayer(b.id);
       if (o) removeLayer(o.id);
    });
  };

  const handleSplit = () => {
    if (targetGroups.length === 0) return;
    targetGroups.forEach(group => {
       if (group.length > 1) {
           // Gruptaki layer özelliklerini bul
           const baseLayer = layers.find(l => l.type === 'solid' && l.mask?.targetIds?.length === group.length && l.mask.targetIds.every(id => group.includes(id)));
           const overlayLayer = layers.find(l => l.type === 'image' && l.mask?.targetIds?.length === group.length && l.mask.targetIds.every(id => group.includes(id)));

           unmergePages(group);

           // Yeni ayrılan her sayfaya eski özellikleri kopyala
           group.forEach(id => {
               if (baseLayer) syncGroupBackground([id], 'base', baseLayer.properties);
               if (overlayLayer) syncGroupBackground([id], 'overlay', overlayLayer.properties);
           });

           // Eski birleşik katmanları sil (Hayalet katmanları temizle)
           if (baseLayer) removeLayer(baseLayer.id);
           if (overlayLayer) removeLayer(overlayLayer.id);
       }
    });
  };

  const handleBaseColorChange = (color: string, opacity: number) => {
    if (targetGroups.length === 0) return;
    // Batch Apply: Seçili tüm gruplara uygula
    targetGroups.forEach(group => {
      syncGroupBackground(group, 'base', { color, opacity, gradient: null });
    });
  };

  const handleBaseGradientChange = (gradient: string | null) => {
    if (targetGroups.length === 0) return;
    targetGroups.forEach(group => {
      syncGroupBackground(group, 'base', { gradient });
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || targetGroups.length === 0) return;

    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", `overlay-${Date.now()}.${file.name.split(".").pop()}`);

    try {
      const result = await uploadImage(formData);
      if (result.success) {
        // Batch Apply Resim: Seçili tüm gruplara aynı resmi yay
        targetGroups.forEach(group => {
          syncGroupBackground(group, 'overlay', {
            imageUrl: `${result.path}?t=${Date.now()}`,
            opacity: 100,
            fitMode: 'cover',
            blendMode: 'normal'
          });
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeOverlay = () => {
    if (targetGroups.length === 0) return;
    targetGroups.forEach(group => {
        const matches = (l: Layer) => 
            l.mask?.targetIds?.length === group.length && 
            l.mask.targetIds.every(id => group.includes(id));
        const overlay = layers.find(l => matches(l) && l.type === 'image');
        if (overlay) removeLayer(overlay.id);
    });
  };

  // 3. UI RENDERERS
  return (
    <div className="space-y-4">
          
          {/* A. HÜCRE BİRLEŞTİRME (EXCEL MANTIĞI) */}
          <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 flex items-center gap-1.5">
                <Combine className="w-3 h-3" /> Sayfa Birleştirme
              </label>
              <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Forma {activeForma?.id}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeForma?.pages.map((page) => {
                const isSelected = selectedPageIds.includes(page.id);
                const group = currentGroups.find(g => g.includes(page.id));
                const isMerged = group && group.length > 1;

                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      if (selectedPageIds.includes(page.id)) {
                        setSelectedPagesInLayerStore(selectedPageIds.filter(id => id !== page.id));
                      } else {
                        setSelectedPagesInLayerStore([...selectedPageIds, page.id]);
                      }
                    }}
                    className={`relative min-w-[40px] h-10 rounded border text-[11px] font-black transition-all flex items-center justify-center ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white shadow-md z-10 scale-105"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {page.pageNumber}
                    {isMerged && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white" title="Merged" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleMerge}
                disabled={selectedPageIds.length < 2}
                className="flex items-center justify-center gap-2 py-2 rounded bg-slate-800 text-white text-[10px] font-black uppercase hover:bg-slate-900 disabled:opacity-30 transition-all font-sans"
              >
                <Combine className="w-3.5 h-3.5" /> Seçili Sayfaları Birleştir
              </button>
              <button
                onClick={handleSplit}
                disabled={targetGroups.length === 0 || !targetGroups.some(g => g.length > 1)}
                className="flex items-center justify-center gap-2 py-2 rounded border border-slate-300 bg-white text-slate-700 text-[10px] font-black uppercase hover:bg-slate-50 disabled:opacity-30 transition-all font-sans"
              >
                <Split className="w-3.5 h-3.5" /> Grubu Ayır
              </button>
            </div>

            {/* SELECTION SUMMARY UI */}
            {targetGroups.length > 0 && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 p-2.5 rounded animate-in fade-in slide-in-from-top-1 duration-300">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-emerald-800 uppercase tracking-tighter">
                    {targetGroups.length} TASARIM HÜCRESİ SEÇİLDİ
                  </div>
                  <div className="text-[9px] text-emerald-700 leading-tight">
                    Yapacağınız değişiklikler toplam <strong>{selectedPageIds.length} sayfayı</strong> etkileyecek.
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* B. AKILLI ZEMİN İSTİFLEME (BACKGROUND POOL) */}
          <section className="space-y-4">
            
            {/* SLOT 1: BASE LAYER (SOLID / GRADIENT) */}
            <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-[11px] font-black text-slate-700 uppercase">Zemin Rengi (Base)</span>
                    <p className="text-[9px] text-slate-400 font-medium">Temel dolgu veya gradyan</p>
                  </div>
                </div>
                <ColorOpacityPicker
                  key={`base-picker-${targetGroups.map(g => g.join(',')).join('|') || 'none'}`}
                  color={groupLayers.base?.properties?.color || "#ffffff"}
                  opacity={groupLayers.base?.properties?.opacity || 100}
                  onChange={handleBaseColorChange}
                  disabled={targetGroups.length === 0}
                />
              </div>

              {/* GRADIENT PRESETS */}
              <div className="space-y-2 pt-1 border-t border-slate-100 mt-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gradyan Efekti</span>
                <div className="flex gap-2">
                   <button 
                      onClick={() => handleBaseGradientChange(null)}
                      className={`w-6 h-6 rounded-full border-2 ${!groupLayers.base?.properties?.gradient ? 'border-blue-500' : 'border-slate-200'} bg-white`}
                      title="Düz Renk"
                   />
                   <button 
                      onClick={() => handleBaseGradientChange('linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)')}
                      className={`w-6 h-6 rounded-full border-2 ${groupLayers.base?.properties?.gradient?.includes('#f5f7fa') ? 'border-blue-500' : 'border-slate-200'}`}
                      style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}
                      title="Cloudy"
                   />
                   <button 
                      onClick={() => handleBaseGradientChange('linear-gradient(to right, #4facfe 0%, #00f2fe 100%)')}
                      className={`w-6 h-6 rounded-full border-2 ${groupLayers.base?.properties?.gradient?.includes('#4facfe') ? 'border-blue-500' : 'border-slate-200'}`}
                      style={{ background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'}}
                      title="Skyline"
                   />
                   <button 
                      onClick={() => handleBaseGradientChange('linear-gradient(to top, #30cfd0 0%, #330867 100%)')}
                      className={`w-6 h-6 rounded-full border-2 ${groupLayers.base?.properties?.gradient?.includes('#30cfd0') ? 'border-blue-500' : 'border-slate-200'}`}
                      style={{ background: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)'}}
                      title="Deep Blue"
                   />
                </div>
              </div>
            </div>

            {/* SLOT 2: OVERLAY LAYER (IMAGE) */}
            <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <div>
                    <span className="text-[11px] font-black text-slate-700 uppercase">Doku & Görsel (Overlay)</span>
                    <p className="text-[9px] text-slate-400 font-medium">Renk üzerine binen katman</p>
                  </div>
                </div>
                {groupLayers.overlay && (
                  <button onClick={removeOverlay} className="p-1.5 rounded hover:bg-rose-50 text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {!groupLayers.overlay ? (
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="overlay-upload"
                    disabled={targetGroups.length === 0}
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="overlay-upload"
                    className={`w-full h-16 rounded border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${targetGroups.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      {isUploading ? "YÜKLENİYOR..." : "GÖRSEL VEYA DOKU YÜKLE"}
                    </span>
                    <span className="text-[9px] text-slate-400">PNG, JPG veya SVG</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative group rounded overflow-hidden border border-slate-200">
                    <img 
                      src={groupLayers.overlay.properties.imageUrl} 
                      className="w-full h-24 object-cover" 
                      alt="Overlay Preview" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <label htmlFor="overlay-upload" className="px-3 py-1.5 bg-white rounded text-[10px] font-black text-slate-800 cursor-pointer shadow-xl">DEĞİŞTİR</label>
                    </div>
                  </div>

                  {/* OVERLAY CONTROLS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600">Harmanlama Opaklığı</span>
                      <span className="text-[10px] font-black text-blue-600">%{groupLayers.overlay.properties.opacity}</span>
                    </div>
                    <input 
                      type="range"
                      min="0" max="100"
                      value={groupLayers.overlay.properties.opacity}
                      onChange={(e) => {
                        targetGroups.forEach(group => {
                            const matches = (l: Layer) => 
                                l.mask?.targetIds?.length === group.length && 
                                l.mask.targetIds.every(id => group.includes(id));
                            const overlay = layers.find(l => matches(l) && l.type === 'image');
                            if (overlay) updateLayerProperties(overlay.id, { opacity: parseInt(e.target.value) });
                        });
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-bold text-slate-600">Karışım Modu (Blend)</label>
                      <select
                        value={groupLayers.overlay.properties.blendMode || 'normal'}
                        onChange={(e) => {
                             targetGroups.forEach(group => {
                                const matches = (l: Layer) => 
                                    l.mask?.targetIds?.length === group.length && 
                                    l.mask.targetIds.every(id => group.includes(id));
                                const overlay = layers.find(l => matches(l) && l.type === 'image');
                                if (overlay) updateLayerProperties(overlay.id, { blendMode: e.target.value });
                            });
                        }}
                        className="w-full h-9 rounded border border-slate-300 text-[11px] font-bold px-2 outline-none focus:border-blue-600"
                      >
                        <option value="normal">Normal</option>
                        <option value="multiply">Çoğalt (Multiply)</option>
                        <option value="screen">Ekran (Screen)</option>
                        <option value="overlay">Kaplama (Overlay)</option>
                        <option value="darken">Koyulaştır</option>
                        <option value="color-burn">Renk Yak</option>
                        <option value="soft-light">Yumuşak Işık</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* C. ADVANCED TOOLS & SNAPS */}
          <div className="pt-2">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-600 outline-none"
            >
              <Sparkles size={12} /> {showAdvanced ? "GELİŞMİŞ AYARLARI GİZLE" : "GELİŞMİŞ AYARLARI GÖSTER"}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3 bg-white border border-slate-200 rounded-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* TRANSFORM CONTROLS FOR OVERLAY */}
                {groupLayers.overlay && (
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Görsel Transform</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500">Ölçek: %{groupLayers.overlay.transform.scale}</span>
                        <input 
                          type="range" min="10" max="300" 
                          value={groupLayers.overlay.transform.scale}
                          onChange={(e) => {
                             targetGroups.forEach(group => {
                                const matches = (l: Layer) => 
                                    l.mask?.targetIds?.length === group.length && 
                                    l.mask.targetIds.every(id => group.includes(id));
                                const overlay = layers.find(l => matches(l) && l.type === 'image');
                                if (overlay) updateLayerTransform(overlay.id, { scale: parseInt(e.target.value) });
                            });
                          }}
                          className="w-full accent-blue-600 hover:accent-blue-700"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500">Döndürme: {groupLayers.overlay.transform.rotation}°</span>
                        <input 
                          type="range" min="0" max="360" 
                          value={groupLayers.overlay.transform.rotation}
                          onChange={(e) => {
                            targetGroups.forEach(group => {
                               const matches = (l: Layer) => 
                                   l.mask?.targetIds?.length === group.length && 
                                   l.mask.targetIds.every(id => group.includes(id));
                               const overlay = layers.find(l => matches(l) && l.type === 'image');
                               if (overlay) updateLayerTransform(overlay.id, { rotation: parseInt(e.target.value) });
                           });
                          }}
                          className="w-full accent-blue-600 hover:accent-blue-700"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        targetGroups.forEach(group => {
                            const matches = (l: Layer) => 
                                l.mask?.targetIds?.length === group.length && 
                                l.mask.targetIds.every(id => group.includes(id));
                            const overlay = layers.find(l => matches(l) && l.type === 'image');
                            if (overlay) {
                                updateLayerProperties(overlay.id, { fitMode: 'cover' });
                                updateLayerTransform(overlay.id, { scale: 100, rotation: 0, offsetX: 0, offsetY: 0 });
                            }
                        });
                      }}
                      className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black border border-emerald-100 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors"
                    >
                      <Maximize size={12} /> Görseli Sığdır
                    </button>
                  </div>
                )}

                <div className="p-2 rounded bg-amber-50 border border-amber-100 text-[9px] text-amber-700 font-bold flex gap-2">
                  <Info size={14} className="flex-shrink-0" />
                  Gelişmiş modda görselleri milimetrik olarak kaydırabilir ve döndürebilirsiniz.
                </div>
              </div>
            )}
            </div>
    </div>
  );
}
