"use client";

import { useMemo, useRef, useState } from "react";
import {
  defaultBackground,
  type BackgroundSettings,
  useCatalogStore,
} from "@/store/useCatalogStore";
import { uploadImage } from "@/lib/uploadAction";
import { ColorOpacityPicker } from "../ColorOpacityPicker";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const FORMA_SCOPE_OPTIONS: Array<{ id: number; label: string; pageNumbers: number[] }> = [
  { id: 1, label: "Forma 1 (Kapaklar)", pageNumbers: [1, 5, 6] },
  { id: 2, label: "Forma 2 (İç Sayfalar)", pageNumbers: [2, 3, 4] },
];

export function BackgroundSettingsPanel({ isOpen, onToggle }: Props) {
  const {
    formas,
    activeFormaId,
    globalSettings,
    isGlobalActive,
    setGlobalActive,
    updateGlobalBackground,
    updatePageBackgrounds,
    updateFormaBackground,
    applyBackgroundToAllFormas,
    setActiveFormaId,
  } = useCatalogStore();

  const {
    contextualBarFormaId,
    contextualBarSelectedPages,
    setContextualBarFormaId,
    setContextualBarSelectedPages,
  } = useCatalogStore();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scopeFormaId = useMemo(
    () => (contextualBarFormaId ? parseInt(contextualBarFormaId) : activeFormaId),
    [contextualBarFormaId, activeFormaId]
  );
  const selectedScopePageNumbers = contextualBarSelectedPages;

  const activeForma = useMemo(
    () => formas.find((forma) => forma.id === activeFormaId),
    [formas, activeFormaId]
  );

  const selectedPage = useMemo(() => {
    if (selectedScopePageNumbers.length === 0) return null;
    const forma = formas.find((f) => f.pages.some((p) => p.pageNumber === selectedScopePageNumbers[0]));
    return forma?.pages.find((p) => p.pageNumber === selectedScopePageNumbers[0]) || null;
  }, [formas, selectedScopePageNumbers]);


  // 1. Derived State (Türetilmiş Durum) Doğru Hesaplanmalı
  const currentBg = useMemo((): BackgroundSettings => {
    if (isGlobalActive) {
      return { ...defaultBackground, ...globalSettings.globalBackground };
    }
    if (selectedPage) {
      return { ...defaultBackground, ...selectedPage.background };
    }
    if (activeForma) {
      return { ...defaultBackground, ...activeForma.globalBackground };
    }
    return defaultBackground;
  }, [isGlobalActive, globalSettings.globalBackground, selectedPage, activeForma]);

  const hasImage = !!currentBg.imageUrl;

  // Kapsam seçili mi? (Global veya en az 1 sayfa)
  const isScopeSelected = isGlobalActive || selectedScopePageNumbers.length > 0;

  const updateBackground = (updates: Partial<BackgroundSettings>) => {
    if (isGlobalActive) {
      updateGlobalBackground(updates);
      return;
    }

    if (selectedScopePageNumbers.length > 0) {
      updatePageBackgrounds(selectedScopePageNumbers, updates);
      return;
    }

    if (activeForma) {
      updateFormaBackground(activeForma.id, { globalBackground: updates });
    }
  };

  // Miras alınan zemini ezme (override) mantığı
  const showOverrideButton = useMemo(() => {
    if (selectedScopePageNumbers.length !== 1) return false;

    const pageNum = selectedScopePageNumbers[0];
    const forma = formas.find(f => f.pages.some(p => p.pageNumber === pageNum));
    const page = forma?.pages.find(p => p.pageNumber === pageNum);

    if (!page) return false;

    const pageBg = page.background;
    // Sayfanın kendine ait bir zemini var mı? (Default beyaz/transparan ve resimsiz durumlar hariç)
    const hasPageBg = !!(pageBg?.imageUrl || (pageBg?.color && pageBg.color.toLowerCase() !== '#ffffff' && pageBg.color.toLowerCase() !== 'transparent'));

    const formaBg = forma?.globalBackground;
    // Formanın bir zemini var mı?
    const hasFormaBg = !!(formaBg?.imageUrl || (formaBg?.color && formaBg.color.toLowerCase() !== '#ffffff' && formaBg.color.toLowerCase() !== 'transparent'));

    // Sayfanın kendi zemini yoksa ama formanın varsa, ezme butonu gösterilir.
    return !hasPageBg && hasFormaBg;
  }, [selectedScopePageNumbers, formas]);

  const handleOverride = () => {
    if (selectedScopePageNumbers.length === 1) {
      updatePageBackgrounds(selectedScopePageNumbers, { ...defaultBackground, color: 'transparent', imageUrl: null, type: 'color' });
    }
  };


  const editingForma = useMemo(() => formas.find((forma) => forma.id === scopeFormaId) || null, [formas, scopeFormaId]);
  const isGlobalBackgroundActiveForForma = editingForma?.isGlobalBackgroundActive ?? false;

  const scopeConfig = useMemo(
    () => FORMA_SCOPE_OPTIONS.find((option) => option.id === scopeFormaId) || FORMA_SCOPE_OPTIONS[0],
    [scopeFormaId]
  );
  const availablePageNumbers = useMemo(
    () =>
      scopeConfig.pageNumbers.filter((pageNumber) =>
        editingForma?.pages.some((page) => page.pageNumber === pageNumber)
      ),
    [editingForma, scopeConfig]
  );
  const selectedPages = useMemo(
    () =>
      availablePageNumbers
        .filter((pageNumber) => selectedScopePageNumbers.includes(pageNumber))
        .map((pageNumber) => editingForma?.pages.find((page) => page.pageNumber === pageNumber))
        .filter((page): page is NonNullable<typeof page> => Boolean(page)),
    [availablePageNumbers, editingForma, selectedScopePageNumbers]
  );

  const isEditingPages = selectedPages.length > 0;

  const scopeSummaryTitle = isGlobalBackgroundActiveForForma
    ? `${editingForma?.name || "Aktif forma"} için global zemin düzenleniyor`
    : isEditingPages
      ? `Seçili sayfalar düzenleniyor: ${selectedScopePageNumbers.join(", ")}`
      : `${editingForma?.name || "Aktif forma"} düzenleniyor`;

  const scopeSummaryText = isGlobalBackgroundActiveForForma
    ? "Alt kontroller bu forma için tek zemin katmanını günceller. Sayfa kapsam seçimleri geçici olarak pasiftir."
    : isEditingPages
      ? "Bir veya daha fazla sayfa seçildiği için yaptığınız değişiklikler yalnızca seçili sayfalara uygulanır."
      : "Hiçbir sayfa pill'i seçili değilken değişiklikler doğrudan seçili formanın zeminine yazılır.";


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // SEÇİM ZORUNLULUĞU: Kapsam seçili değilse yükleme yapma
    if (!e.target.files || !e.target.files[0] || !isScopeSelected) {
      if (!isScopeSelected) alert("Lütfen zemin eklemek için bir düzenleme kapsamı (Global veya en az bir sayfa) seçin.");
      return;
    }

    setIsUploading(true);
    const file = e.target.files[0];
    const extension = file.name.split(".").pop() || "png";
    const scopeName = isGlobalBackgroundActiveForForma
      ? `forma-${editingForma?.id}-global`
      : selectedScopePageNumbers.length > 0
        ? `pages-${selectedScopePageNumbers.join("-")}`
        : `forma-${editingForma?.id}`;
    const formData = new FormData();

    formData.append("file", file);
    formData.append("filename", `background-${scopeName}-${Date.now()}.${extension}`);

    try {
      const result = await uploadImage(formData);
      if (result.success) {
        const shouldAutoSpread = isGlobalActive || selectedScopePageNumbers.length > 1 || (selectedScopePageNumbers.length === 0 && !isGlobalBackgroundActiveForForma);

        updateBackground({
          imageUrl: `${result.path}?t=${Date.now()}`,
          type: "image",
          isSpread: shouldAutoSpread
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

  const handleApplySpread = () => {
    updateBackground({ isSpread: !currentBg.isSpread });
  };

  const handleApplyToBrochure = () => {
    if (isGlobalBackgroundActiveForForma) return; 
    applyBackgroundToAllFormas(currentBg);
  };

  const isSpreadDisabled = !hasImage || (!isGlobalActive && selectedScopePageNumbers.length <= 1 && (selectedScopePageNumbers.length !== 0 || isGlobalBackgroundActiveForForma));
  const isApplyToBrochureDisabled = formas.length === 0 || isGlobalBackgroundActiveForForma;

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
            <div className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="space-y-1">
                <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Tüm Broşüre Uygula (Global)
                </div>
                <div className="text-[12px] font-black text-slate-800">
                  Genel Broşür Zemini
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Açıkken alt kontroller global arka planı düzenler ve forma/sayfa kapsam seçimleri pasifleşir.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isGlobalActive}
                onClick={() => setGlobalActive(!isGlobalActive)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
                  isGlobalActive
                    ? "border-blue-700 bg-blue-600"
                    : "border-slate-300 bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    isGlobalActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div
              className={`space-y-3 rounded-md border px-3 py-3 transition-opacity ${
                isGlobalActive
                  ? "border-slate-200 bg-slate-50 opacity-40 pointer-events-none"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Düzenleme Kapsamı
                </label>
                  <select
                    value={scopeFormaId}
                    disabled={isGlobalActive}
onChange={(e) => {
    const newFormaId = parseInt(e.target.value, 10);
    setActiveFormaId(newFormaId);
    setContextualBarFormaId(e.target.value);
    setContextualBarSelectedPages([]);

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
                  {availablePageNumbers.map((pageNumber) => {
                    const isSelected = selectedScopePageNumbers.includes(pageNumber);

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        disabled={isGlobalActive}
                        onClick={() => {
                          const pageElement = document.getElementById(`page-${pageNumber}`);
                          if (pageElement) {
                            pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
                          }
                          const targetForma = formas.find(f => f.pages.some(p => p.pageNumber === pageNumber));
                          if (targetForma) {
                            setActiveFormaId(targetForma.id);
                          }
                          setContextualBarSelectedPages(
                            selectedScopePageNumbers.includes(pageNumber)
                              ? selectedScopePageNumbers.filter((value) => value !== pageNumber)
                              : [...selectedScopePageNumbers, pageNumber].sort((a, b) => a - b)
                          );
                        }}
                        className={`min-w-10 rounded-full border px-3 py-1.5 text-[11px] font-black transition-colors ${
                          isSelected
                            ? "border-blue-700 bg-blue-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                        } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Sayfa seçilmezse değişiklikler formaya uygulanır. Bir veya daha fazla pill seçildiğinde ayarlar yalnızca seçili sayfalara yazılır.
                </p>
              </div>
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
          </div>

          <div className="space-y-2 relative z-[60] rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-700">Zemin Rengi</span>
                <p className="text-[9px] text-slate-500 mt-0.5">Renk ve saydamlık birlikte ayarlanır.</p>
              </div>
              <ColorOpacityPicker
                color={currentBg.color ?? "#ffffff"}
                opacity={currentBg.opacity ?? 100}
                onChange={(color, opacity) =>
                  updateBackground({ color, opacity, type: "color" })
                }
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700">Arka Plan Görseli</span>
              {hasImage && (
                <button
                  onClick={() => updateBackground({ imageUrl: null, type: "color" })}
                  className="px-2.5 py-1 text-[10px] font-bold rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Görseli Kaldır
                </button>
              )}
            </div>

            {showOverrideButton && (
              <div className="p-2 rounded-md border border-amber-300 bg-amber-50">
                <p className="text-[10px] text-amber-800 font-medium mb-2">Bu sayfa, forma zeminini kullanıyor. Sayfaya özel bir zemin atamak için aşağıdaki butonu kullanabilirsiniz.</p>
                <button
                  onClick={handleOverride}
                  className="w-full text-center px-2.5 py-1.5 text-[10px] font-bold rounded border border-amber-400 bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors"
                >
                  Formadan Gelen Zemini Kaldır/Ez
                </button>
              </div>
            )}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Görsel URL
              </span>
              <input
                type="text"
                value={currentBg.imageUrl || ""}
                disabled={!isScopeSelected}
                onChange={(e) => {
                  const imageUrl = e.target.value.trim();
                  updateBackground({
                    imageUrl: imageUrl || null,
                    type: imageUrl ? "image" : "color",
                  });
                }}
                placeholder="https://... veya /images/..."
                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-[11px] font-medium text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
                disabled={!isScopeSelected}
                onChange={handleImageUpload}
              />
              <label
                htmlFor="background-image-upload"
                className={`w-full h-10 px-3 rounded-md border border-dashed border-slate-300 bg-white text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center ${
                  !isScopeSelected
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "hover:border-blue-400 hover:bg-slate-50 cursor-pointer"
                }`}
              >
                {isUploading
                  ? "Görsel yükleniyor..."
                  : !isScopeSelected
                    ? "Kapsam Seçilmedi"
                    : "Bilgisayardan Görsel Seç"}
              </label>
            </div>

            {hasImage && (
              <div className="rounded-md border border-slate-200 bg-white p-2 space-y-2">
                <img
                  src={currentBg.imageUrl || ""}
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
                  <span className="text-[10px] font-bold text-blue-700">%{currentBg.scale ?? 100}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={currentBg.scale ?? 100}
                  onChange={(e) => updateBackground({ scale: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <input
                type="number"
                min="10"
                max="300"
                value={currentBg.scale ?? 100}
                onChange={(e) => updateBackground({ scale: parseInt(e.target.value) })}
                className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700">Pan X</span>
                  <span className="text-[10px] font-bold text-blue-700">{currentBg.offsetX ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  value={currentBg.offsetX ?? 0}
                  onChange={(e) => updateBackground({ offsetX: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <input
                type="number"
                min="-500"
                max="500"
                value={currentBg.offsetX ?? 0}
                onChange={(e) => updateBackground({ offsetX: parseInt(e.target.value) })}
                className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700">Pan Y</span>
                  <span className="text-[10px] font-bold text-blue-700">{currentBg.offsetY ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  value={currentBg.offsetY ?? 0}
                  onChange={(e) => updateBackground({ offsetY: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <input
                type="number"
                min="-500"
                max="500"
                value={currentBg.offsetY ?? 0}
                onChange={(e) => updateBackground({ offsetY: parseInt(e.target.value) })}
                className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700">Görsel Saydamlığı</span>
                  <span className="text-[10px] font-bold text-blue-700">%{currentBg.imageOpacity ?? 100}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentBg.imageOpacity ?? 100}
                  onChange={(e) => updateBackground({ imageOpacity: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={currentBg.imageOpacity ?? 100}
                onChange={(e) => updateBackground({ imageOpacity: parseInt(e.target.value) })}
                className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
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
                        value={currentBg.fitMode || 'cover'}
                        onChange={(e) => updateBackground({ fitMode: e.target.value as BackgroundSettings['fitMode'] })}
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500"
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
                            <span className="text-[10px] font-bold text-blue-700">{currentBg.rotation ?? 0}°</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={currentBg.rotation ?? 0}
                            onChange={(e) => updateBackground({ rotation: parseInt(e.target.value) })}
                            className="w-full accent-blue-600"
                        />
                    </div>
                    <input
                        type="number"
                        min="0"
                        max="360"
                        value={currentBg.rotation ?? 0}
                        onChange={(e) => updateBackground({ rotation: parseInt(e.target.value) })}
                        className="w-20 h-9 px-2 rounded-md border border-slate-300 bg-white text-[11px] font-bold text-center text-slate-700 outline-none focus:border-blue-500"
                    />
                </div>
                
                {/* Aynalama */}
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => updateBackground({ flipX: !currentBg.flipX })}
                        className={`py-2 rounded-md text-[10px] font-bold transition-colors border ${currentBg.flipX ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                    >
                        Yatay Çevir
                    </button>
                    <button 
                        onClick={() => updateBackground({ flipY: !currentBg.flipY })}
                        className={`py-2 rounded-md text-[10px] font-bold transition-colors border ${currentBg.flipY ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                    >
                        Dikey Çevir
                    </button>
                </div>

                {/* Karışım Modu */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Karışım Modu</label>
                    <select
                        value={currentBg.blendMode || 'normal'}
                        onChange={(e) => updateBackground({ blendMode: e.target.value })}
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500"
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
              onClick={handleApplySpread}
              disabled={isSpreadDisabled}
              className={`w-full py-3 rounded-md text-[11px] font-black transition-colors border ${
                !isSpreadDisabled
                  ? currentBg.isSpread 
                    ? "bg-orange-600 hover:bg-orange-700 border-orange-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {currentBg.isSpread ? "Yaymayı İptal Et" : "Bu Resmi Yay"}
            </button>
            <button
              onClick={handleApplyToBrochure}
              disabled={isApplyToBrochureDisabled}
              className={`w-full py-3 rounded-md text-[11px] font-black transition-colors border ${
                !isApplyToBrochureDisabled
                  ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Tüm Broşüre Uygula (Global)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
