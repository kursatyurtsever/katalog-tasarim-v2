"use client";

import { useMemo, useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadAction";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { useLayerStore } from "@/store/useLayerStore";
import { useCatalogStore } from "@/store/useCatalogStore";
import { Layer, Page as DocumentPage } from "@/types/document";
import { v4 as uuidv4 } from "uuid";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export function BackgroundSettingsPanel({ isOpen, onToggle }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    selectedPageIds,
    layers,
    addLayer,
    removeLayer,
    updateLayerProperties,
    updateLayerTransform,
    setTargetPagesForMask,
    selectPages: setSelectedPagesInLayerStore,
    selectLayers,
  } = useLayerStore();

  const {
    formas,
    activeTemplate,
    setSelectedPage: setSelectedPageInCatalogStore,
    setActiveFormaId,
    setContextualBarFormaId,
    setContextualBarSelectedPages,
    contextualBarFormaId,
    contextualBarSelectedPages,
  } = useCatalogStore();

  const scopeFormaId = useMemo(
    () => (contextualBarFormaId ? parseInt(contextualBarFormaId) : formas[0]?.id || 1),
    [contextualBarFormaId, formas]
  );

  const activeForma = useMemo(
    () => formas.find((forma) => forma.id === scopeFormaId),
    [formas, scopeFormaId]
  );

  const currentPagesInActiveForma = useMemo(() => {
    return activeForma?.pages || [];
  }, [activeForma]);

  const selectedPageNumbers = useMemo(() => {
    return selectedPageIds.map(pageId => {
      const forma = formas.find(f => f.pages.some(p => p.id === pageId));
      return forma?.pages.find(p => p.id === pageId)?.pageNumber;
    }).filter(Boolean) as number[];
  }, [selectedPageIds, formas]);

  const activeLayers = useMemo(() => {
    return layers.filter(layer =>
      layer.mask?.type === "page" && layer.mask.targetIds.some(id => selectedPageIds.includes(id)) && (layer.type === "solid" || layer.type === "image")
    );
  }, [layers, selectedPageIds]);

  const selectedLayer = useMemo(() => {
    if (activeLayers.length === 1) {
      return activeLayers[0];
    } else if (activeLayers.length > 1) {
      const firstLayerType = activeLayers[0].type;
      const sameTypeLayers = activeLayers.filter(layer => layer.type === firstLayerType);
      return sameTypeLayers.length > 0 ? sameTypeLayers[0] : null;
    }
    return null;
  }, [activeLayers]);

  const hasImage = selectedLayer?.type === "image" && !!selectedLayer.properties?.imageUrl;
  const isScopeSelected = selectedPageIds.length > 0;
  const hasActiveBackgroundLayer = activeLayers.length > 0;

  const activePageHasNoLayer = useMemo(() => {
    return selectedPageIds.every(pageId => !layers.some(layer => layer.mask?.type === "page" && layer.mask.targetIds.includes(pageId)));
  }, [selectedPageIds, layers]);

  const scopeSummaryTitle = useMemo(() => {
    if (selectedPageIds.length === 0) {
      return `Aktif Forma: ${activeForma?.name || "Bilinmiyor"}`;
    } else if (selectedPageIds.length === 1) {
      const pageNumber = formas.flatMap(f => f.pages).find(p => p.id === selectedPageIds[0])?.pageNumber;
      return `Tek Sayfa: ${pageNumber ? `${pageNumber}. Sayfa` : "Bilinmiyor"}`;
    } else {
      return `Çoklu Sayfa: ${selectedPageNumbers.join(", ")}. Sayfalar`;
    }
  }, [selectedPageIds, activeForma, formas, selectedPageNumbers]);

  const scopeSummaryText = useMemo(() => {
    if (selectedPageIds.length === 0) {
      return "Hiçbir sayfa seçilmedi. Ayarlar tüm formaya uygulanacaktır.";
    } else if (selectedPageIds.length === 1) {
      return "Sadece seçili sayfaya uygulanacaktır.";
    } else {
      return "Ayarlar yalnızca seçili sayfalara uygulanacaktır.";
    }
  }, [selectedPageIds]);

  const FORMA_SCOPE_OPTIONS = useMemo(() => {
    return formas.map(forma => ({
      id: forma.id,
      label: forma.name,
      pageIds: forma.pages.map(p => p.id)
    }));
  }, [formas]);

  const currentFormaPageIds = useMemo(() => {
    return activeForma?.pages.map(p => p.id) || [];
  }, [activeForma]);

  const handlePageSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formaId = parseInt(e.target.value);
    const forma = formas.find(f => f.id === formaId);
    if (forma) {
      setSelectedPagesInLayerStore(forma.pages.map(p => p.id));
      setContextualBarSelectedPages(forma.pages.map(p => p.pageNumber));
      setContextualBarFormaId(formaId.toString());
    }
  };

  const handlePagePillClick = (pageId: string, pageNumber: number) => {
    if (selectedPageIds.includes(pageId)) {
      setSelectedPagesInLayerStore(selectedPageIds.filter(id => id !== pageId));
    } else {
      setSelectedPagesInLayerStore([...selectedPageIds, pageId]);
    }
    // Contextual bar için sayfa numaralarını güncelle
    const updatedSelectedPageNumbers = selectedPageIds.includes(pageId)
      ? selectedPageNumbers.filter(num => num !== pageNumber)
      : [...selectedPageNumbers, pageNumber];
    setContextualBarSelectedPages(updatedSelectedPageNumbers);
  };

  const handleAddLayer = (type: Layer['type']) => {
    if (!isScopeSelected) {
      alert("Lütfen zemin eklemek için en az bir sayfa seçin.");
      return;
    }

    selectedPageIds.forEach(pageId => {
      const pageConfig = formas.flatMap(f => f.pages).find(p => p.id === pageId);
      if (!pageConfig) return;

      const newLayer: Layer = {
        id: uuidv4(),
        type: type,
        bounds: { x: 0, y: 0, w: activeTemplate.openWidthMm, h: activeTemplate.openHeightMm },
        transform: { rotation: 0, scale: 100, flipX: false, flipY: false, offsetX: 0, offsetY: 0 },
        mask: { type: "page", targetIds: [pageId] },
        zIndex: 0,
        properties: type === "image"
          ? { imageUrl: null, opacity: 100, fitMode: 'cover', blendMode: 'normal' }
          : { color: "#ffffff", opacity: 100 },
      };
      addLayer(newLayer);
      selectLayers([newLayer.id]); // Yeni eklenen katmanı seç
    });
  };

  const handleRemoveLayer = () => {
    if (selectedLayer) {
      removeLayer(selectedLayer.id);
      selectLayers([]); // Seçimi kaldır
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedLayer) {
      if (!selectedLayer) alert("Lütfen önce bir resim katmanı seçin veya ekleyin.");
      return;
    }

    setIsUploading(true);
    const file = e.target.files[0];
    const extension = file.name.split(".").pop() || "png";
    const scopeName = selectedLayer.mask?.targetIds.join("-") || "unknown";
    const formData = new FormData();

    formData.append("file", file);
    formData.append("filename", `background-${scopeName}-${Date.now()}.${extension}`);

    try {
      const result = await uploadImage(formData);
      if (result.success) {
        updateLayerProperties(selectedLayer.id, {
          imageUrl: `${result.path}?t=${Date.now()}`,
          opacity: 100, // Varsayılan olarak tam saydamlık
        });
      } else {
        alert(`Resim yüklenemedi: ${result.error}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      alert(`Bağlantı hatası: ${message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleSpread = () => {
    if (!selectedLayer || !selectedLayer.mask) return;

    const isCurrentlySpread = selectedLayer.mask.type === 'spread';
    if (isCurrentlySpread) {
      // Yaymayı iptal et: sadece ilk sayfada kalsın
      const firstPageId = selectedLayer.mask.targetIds[0];
      setTargetPagesForMask(selectedLayer.id, [firstPageId]);
    } else {
      // Yaymayı aktifleştir: formadaki tüm sayfaları kapsasın
      setTargetPagesForMask(selectedLayer.id, currentFormaPageIds);
    }
  };

  const isSpreadActive = selectedLayer?.mask?.type === 'spread' && selectedLayer.mask.targetIds.length === currentFormaPageIds.length && currentFormaPageIds.every(id => selectedLayer.mask?.targetIds.includes(id));
  const isSpreadPossible = selectedLayer && currentFormaPageIds.length > 1 && selectedLayer.mask?.type === 'page';

  const canEditLayer = selectedLayer !== null;

  const getTransform = <T extends keyof Layer["transform"]>(key: T, defaultValue: NonNullable<Layer["transform"][T]>) => {
    return selectedLayer?.transform?.[key] ?? defaultValue;
  };

  const getProperty = <T extends keyof Layer["properties"]>(key: T, defaultValue: NonNullable<Layer["properties"][T]>) => {
    return selectedLayer?.properties?.[key] ?? defaultValue;
  };

  return (
    <div className="bg-white rounded-md border border-slate-700 shadow-sm mb-4 relative z-30">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 transition-colors ${
          isOpen ? "rounded-t-md" : "rounded-md"
        }`}
      >
        <span className="text-[11px] font-black text-white uppercase tracking-widest">
          Zemin ve Arka Plan
        </span>
        <span className="text-white text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-700 space-y-4 rounded-b-md">
          <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                Düzenleme Kapsamı
              </label>
              <select
                value={scopeFormaId}
                onChange={handlePageSelectChange}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {FORMA_SCOPE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                Sayfa Seçimi
              </div>
              <div className="flex flex-wrap gap-2">
                {currentPagesInActiveForma.map((page) => {
                  const isSelected = selectedPageIds.includes(page.id);

                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => handlePagePillClick(page.id, page.pageNumber)}
                      className={`min-w-10 rounded-full border px-3 py-1.5 text-[11px] font-black transition-colors ${
                        isSelected
                          ? "border-blue-700 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      {page.pageNumber}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                Sayfa seçilmezse değişiklikler formaya uygulanır. Bir veya daha fazla pill seçildiğinde ayarlar yalnızca seçili sayfalara yazılır.
              </p>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 space-y-1">
              <div className="text-[9px] font-black text-blue-700 uppercase tracking-widest">
                Düzenleme Alanı
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                {scopeSummaryTitle}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {scopeSummaryText}
              </p>
            </div>

            {activePageHasNoLayer && isScopeSelected && (
              <div className="space-y-2">
                <button
                  onClick={() => handleAddLayer("solid")}
                  className="w-full py-2 rounded-md text-[11px] font-black bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Solid Renk Zemin Ekle
                </button>
                <button
                  onClick={() => handleAddLayer("image")}
                  className="w-full py-2 rounded-md text-[11px] font-black bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Resim Zemin Ekle
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 relative z-[60] rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-700">Zemin Rengi</span>
                <p className="text-[9px] text-slate-500 mt-0.5">Renk ve saydamlık birlikte ayarlanır.</p>
              </div>
              <ColorOpacityPicker
                color={getProperty("color", "#ffffff")}
                opacity={getProperty("opacity", 100)}
                onChange={(color, opacity) =>
                  selectedLayer && updateLayerProperties(selectedLayer.id, { color, opacity })
                }
                disabled={!canEditLayer || selectedLayer?.type !== "solid"}
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700">Arka Plan Görseli</span>
              {selectedLayer && (
                <button
                  onClick={handleRemoveLayer}
                  className="px-2.5 py-1 text-[10px] font-bold rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Görseli/Zemini Kaldır
                </button>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Görsel URL
              </span>
              <input
                type="text"
                value={selectedLayer?.properties?.imageUrl || ""}
                disabled={!canEditLayer || selectedLayer?.type !== "image"}
                onChange={(e) => {
                  const imageUrl = e.target.value.trim();
                  selectedLayer && updateLayerProperties(selectedLayer.id, {
                    imageUrl: imageUrl || null,
                  });
                }}
                placeholder="https://... veya /images/..."
                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Dosyadan Yükle
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                id="background-image-upload"
                disabled={!canEditLayer || selectedLayer?.type !== "image"}
                onChange={handleImageUpload}
              />
              <label
                htmlFor="background-image-upload"
                className={`w-full h-10 px-3 rounded-md border border-dashed border-slate-300 bg-white text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center ${
                  !canEditLayer || selectedLayer?.type !== "image"
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "hover:border-blue-400 hover:bg-slate-50 cursor-pointer"
                }`}
              >
                {isUploading
                  ? "Görsel yükleniyor..."
                  : !canEditLayer || selectedLayer?.type !== "image"
                    ? "Lütfen önce bir resim katmanı seçin"
                    : "Bilgisayardan Görsel Seç"}
              </label>
            </div>

            {hasImage && (
              <div className="rounded-md border border-slate-200 bg-white p-2 space-y-2">
                <img
                  src={selectedLayer?.properties?.imageUrl || ""}
                  alt="Arka plan önizleme"
                  className="w-full h-28 object-cover rounded border border-slate-200"
                />
                <div className="text-[9px] text-slate-500 leading-relaxed">
                  Görsel aktifken ölçek, konum ve görsel saydamlığı ayarları aşağıdan yönetilir.
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700">Görsel Ölçeği</span>
                  <span className="text-[10px] font-bold text-blue-700">%{getTransform("scale", 100)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={getTransform("scale", 100)}
                  onChange={(e) => selectedLayer && updateLayerTransform(selectedLayer.id, { scale: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                  disabled={!canEditLayer}
                />
              </div>
              <input
                type="number"
                min="10"
                max="300"
                value={getTransform("scale", 100)}
                onChange={(e) => selectedLayer && updateLayerTransform(selectedLayer.id, { scale: parseInt(e.target.value) })}
                className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
                disabled={!canEditLayer}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700">Pan X</span>
                  <span className="text-[10px] font-bold text-blue-700">{getTransform("offsetX", 0)}px</span>
                </div>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  value={getTransform("offsetX", 0)}
                  onChange={(e) => selectedLayer && updateLayerTransform(selectedLayer.id, { offsetX: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                  disabled={!canEditLayer}
                />
              </div>
              <input
                type="number"
                min="-500"
                max="500"
                value={getTransform("offsetX", 0)}
                onChange={(e) => selectedLayer && updateLayerTransform(selectedLayer.id, { offsetX: parseInt(e.target.value) })}
                className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
                disabled={!canEditLayer}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700">Pan Y</span>
                  <span className="text-[10px] font-bold text-blue-700">{getTransform("offsetY", 0)}px</span>
                </div>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  value={getTransform("offsetY", 0)}
                  onChange={(e) => selectedLayer && updateLayerTransform(selectedLayer.id, { offsetY: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                  disabled={!canEditLayer}
                />
              </div>
              <input
                type="number"
                min="-500"
                max="500"
                value={getTransform("offsetY", 0)}
                  onChange={(e) => selectedLayer && updateLayerTransform(selectedLayer.id, { offsetY: parseInt(e.target.value) })}
                className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
                  disabled={!canEditLayer}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700">Görsel Saydamlığı</span>
                  <span className="text-[10px] font-bold text-blue-700">%{getProperty("opacity", 100)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={getProperty("opacity", 100)}
                  onChange={(e) => selectedLayer && updateLayerProperties(selectedLayer.id, { opacity: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                  disabled={!canEditLayer || selectedLayer?.type !== "image"}
                />
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={getProperty("opacity", 100)}
                onChange={(e) => selectedLayer && updateLayerProperties(selectedLayer.id, { opacity: parseInt(e.target.value) })}
                className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
                disabled={!canEditLayer || selectedLayer?.type !== "image"}
              />
            </div>
          </div>
          
          {/* YENİ GELİŞMİŞ AYARLAR */}
          {hasImage && (
            <div className="space-y-4 border-t border-slate-200 pt-4">
               <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-widest -mb-1">Gelişmiş Görsel Ayarları</h3>

                {/* Görsel Oturtma */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Görsel Oturtma</label>
                    <select
                        value={getProperty("fitMode", "cover")}
                        onChange={(e) => selectedLayer && updateLayerProperties(selectedLayer.id, { fitMode: e.target.value })}
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500"
                        disabled={!canEditLayer || selectedLayer?.type !== "image"}
                    >
                        <option value="cover">Doldur (Cover)</option>
                        <option value="contain">Sığdır (Contain)</option>
                        <option value="repeat">Çoğalt (Repeat)</option>
                        <option value="stretch">Sündür (Stretch)</option>
                    </select>
                </div>

                {/* Döndürme */}
                <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-700">Döndürme</span>
                            <span className="text-[10px] font-bold text-blue-700">{getTransform("rotation", 0)}°</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={getTransform("rotation", 0)}
                            onChange={(e) => selectedLayer && updateLayerTransform(selectedLayer.id, { rotation: parseInt(e.target.value) })}
                            className="w-full accent-blue-600"
                            disabled={!canEditLayer}
                        />
                    </div>
                    <input
                        type="number"
                        min="0"
                        max="360"
                        value={getTransform("rotation", 0)}
                            onChange={(e) => selectedLayer && updateLayerTransform(selectedLayer.id, { rotation: parseInt(e.target.value) })}
                        className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
                        disabled={!canEditLayer}
                    />
                </div>
                
                {/* Aynalama */}
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => selectedLayer && updateLayerTransform(selectedLayer.id, { flipX: !getTransform("flipX", false) })}
                        className={`py-2 rounded-md text-[10px] font-bold transition-colors border ${getTransform("flipX", false) ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                        disabled={!canEditLayer}
                    >
                        Yatay Çevir
                    </button>
                    <button 
                        onClick={() => selectedLayer && updateLayerTransform(selectedLayer.id, { flipY: !getTransform("flipY", false) })}
                        className={`py-2 rounded-md text-[10px] font-bold transition-colors border ${getTransform("flipY", false) ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                        disabled={!canEditLayer}
                    >
                        Dikey Çevir
                    </button>
                </div>

                {/* Karışım Modu */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Karışım Modu</label>
                    <select
                        value={getProperty("blendMode", "normal")}
                        onChange={(e) => selectedLayer && updateLayerProperties(selectedLayer.id, { blendMode: e.target.value })}
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500"
                        disabled={!canEditLayer || selectedLayer?.type !== "image"}
                    >
                        <option value="normal">Normal</option>
                        <option value="multiply">Çoğalt (Multiply)</option>
                        <option value="screen">Ekran (Screen)</option>
                        <option value="overlay">Kaplama (Overlay)</option>
                        <option value="darken">Koyulaştır</option>
                        <option value="lighten">Açıklaştır</option>
                        <option value="color-dodge">Renk Aç</option>
                        <option value="color-burn">Renk Yak</option>
                        <option value="hard-light">Sert Işık</option>
                        <option value="soft-light">Yumuşak Işık</option>
                        <option value="difference">Fark</option>
                        <option value="exclusion">Dışlama</option>
                        <option value="hue">Ton</option>
                        <option value="saturation">Doygunluk</option>
                        <option value="color">Renk</option>
                        <option value="luminosity">Parlaklık</option>
                    </select>
                </div>
            </div>
          )}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <button
              onClick={handleToggleSpread}
              disabled={!isSpreadPossible && !isSpreadActive}
              className={`w-full py-3 rounded-md text-[11px] font-black transition-colors border ${
                isSpreadActive 
                  ? "bg-orange-600 hover:bg-orange-700 border-orange-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white"
              } ${
                (!isSpreadPossible && !isSpreadActive) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSpreadActive ? "Formaya Yaymayı İptal Et" : "Formaya Yay (Spread)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
