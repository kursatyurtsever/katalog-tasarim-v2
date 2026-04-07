
"use client";

import { useRef, useState } from "react";
import { useBannerStore } from "@/store/useBannerStore";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { SpacingPicker } from "../SpacingPicker";
import { uploadImage } from "@/lib/uploadAction";

export function BannerSettingsPanel() {
  const { 
    bannerSettings, selectedBannerCellIds, 
    updateBannerCell, updateSelectedBannerCells, 
    toggleBannerCellSelection, mergeBannerCells, unmergeBannerCell,
    resetSelectedBannerCells // YENİ FONKSİYONU ÇAĞIRDIK
  } = useBannerStore();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCells = bannerSettings.cells.filter(c => selectedBannerCellIds.includes(c.id));
  const refCell = selectedCells.length > 0 ? selectedCells[0] : null;

  const handleMerge = () => {
    const result = mergeBannerCells();
    if (!result.success) alert(result.error);
  };

  const handleUnmerge = () => {
    if (refCell && (refCell.colSpan > 1 || refCell.rowSpan > 1)) {
      unmergeBannerCell(refCell.id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCells.length !== 1 || !e.target.files || !e.target.files[0]) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", `banner-${refCell!.id}-${Date.now()}.png`);

    try {
      const result = await uploadImage(formData);
      if (result.success) {
        updateBannerCell(refCell!.id, { image: `${result.path}?t=${Date.now()}` });
      } else {
        alert(`Resim yüklenemedi: ${result.error}`);
      }
    } catch (err: any) {
      alert("Bağlantı hatası: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBorderChange = (side: string, value: number) => {
    if (!refCell) return;
    if (side === 'all') {
      updateSelectedBannerCells({ border: { t: value, r: value, b: value, l: value } });
    } else if (side === 'linked') {
      updateSelectedBannerCells({ border: { linked: !!value } });
    } else {
      updateSelectedBannerCells({ border: { [side]: value } as any });
    }
  };

  return (
    <div className="space-y-4">
      
      <div className="bg-slate-50 p-2 rounded border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-bold text-slate-700">Banner Izgarası (8x4)</span>
          <span className="text-[8px] text-slate-500">Çoklu seçim: Ctrl veya Shift</span>
        </div>
        
        <div className="grid grid-cols-8 gap-px bg-slate-200 border border-slate-200 p-px rounded-sm">
          {bannerSettings.cells.filter(c => !c.hidden).map(cell => (
            <div
              key={cell.id}
              onClick={(e) => toggleBannerCellSelection(cell.id, e.ctrlKey || e.shiftKey)}
              style={{ gridColumn: `span ${cell.colSpan}`, gridRow: `span ${cell.rowSpan}` }}
              className={`min-h-6 flex items-center justify-center text-[8px] cursor-pointer transition-colors overflow-hidden ${
                selectedBannerCellIds.includes(cell.id) 
                  ? "bg-blue-100 ring-1 ring-inset ring-blue-500 text-blue-700 font-bold" 
                  : "bg-white hover:bg-slate-100 text-slate-500"
              }`}
            >
              {cell.image ? "🖼️" : (cell.text ? cell.text.substring(0, 5) + "..." : "Boş")}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 mt-3">
        {selectedBannerCellIds.length === 0 ? (
          <div className="text-[10px] text-center text-slate-500 font-bold p-4 bg-slate-50 rounded border border-slate-200 shadow-sm">
            Izgaradan düzenlemek istediğiniz hücre(ler)i seçin.
          </div>
        ) : (
          <div className="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex gap-2">
              <button onClick={handleMerge} disabled={selectedBannerCellIds.length < 2} className={`flex-1 py-2 rounded text-[10px] font-bold transition-colors ${selectedBannerCellIds.length >= 2 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                Seçilileri Birleştir
              </button>
              <button onClick={handleUnmerge} disabled={!refCell || (refCell.colSpan === 1 && refCell.rowSpan === 1)} className={`flex-1 py-2 rounded text-[10px] font-bold transition-colors ${refCell && (refCell.colSpan > 1 || refCell.rowSpan > 1) ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                Hücreyi Ayır
              </button>
            </div>

            {selectedBannerCellIds.length === 1 && (
              <>
                <div className="space-y-1 border-t border-slate-200 pt-3 relative z-70">
                  <span className="text-[9px] font-bold text-slate-500">Hücre Metni</span>
                  <textarea rows={2} value={refCell!.text} onChange={(e) => updateBannerCell(refCell!.id, { text: e.target.value })} className="w-full text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500 resize-none" placeholder="Hücreye yazılacak metin..." />
                </div>
                <div className="space-y-1 border-t border-slate-200 pt-3 relative z-60">
                  <span className="text-[9px] font-bold text-slate-500">Resim Ekle</span>
                  <input type="file" accept="image/*" className="hidden" id="banner-image-upload" ref={fileInputRef} onChange={handleImageUpload} />
                  <div className="flex gap-1">
                    <label htmlFor="banner-image-upload" className="flex-1 h-7.5 flex items-center justify-center text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-blue-400 rounded cursor-pointer transition-all">
                      {isUploading ? "Yükleniyor..." : (refCell!.image ? "Resmi Değiştir" : "Bilgisayardan Seç")}
                    </label>
                    {refCell!.image && <button onClick={() => updateBannerCell(refCell!.id, { image: null })} className="h-7.5 px-3 bg-red-50 text-red-600 border border-red-200 rounded text-[10px] font-bold hover:bg-red-100 transition-colors">Sil</button>}
                  </div>
                </div>
              </>
            )}

            {selectedBannerCellIds.length > 1 && (
              <div className="text-[10px] text-center text-blue-600 font-bold p-2 bg-blue-50 rounded border border-blue-200">
                💡 Çoklu seçim modundasınız. Yapacağınız her stil değişikliği (Renk, Çerçeve, Font) seçili {selectedBannerCellIds.length} hücreye anında uygulanır.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 relative z-50">
              <span className="text-[10px] font-bold text-slate-700">Hücre Dolgu Rengi</span>
              <ColorOpacityPicker color={refCell!.bgColor.c} opacity={refCell!.bgColor.o} onChange={(c, o) => updateSelectedBannerCells({ bgColor: { c, o } })} />
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2 relative z-40">
              <span className="text-[10px] font-bold text-slate-700">Hücre Çerçevesi (Border)</span>
              <div className="flex items-center justify-between">
                <ColorOpacityPicker color={refCell!.border.color.c} opacity={refCell!.border.color.o} onChange={(c, o) => updateSelectedBannerCells({ border: { color: { c, o } } })} />
                <select value={refCell!.border.style} onChange={(e) => updateSelectedBannerCells({ border: { style: e.target.value as any } })} className="text-[10px] text-slate-700 bg-white border border-slate-200 rounded p-1 outline-none">
                  <option value="solid">Düz</option>
                  <option value="dashed">Kesik</option>
                  <option value="dotted">Noktalı</option>
                </select>
              </div>
              
              <div className="grid grid-cols-5 gap-1 bg-white p-1.5 rounded border border-slate-200">
                <button onClick={() => handleBorderChange('linked', refCell!.border.linked ? 0 : 1)} className={`flex items-center justify-center p-1 rounded text-[10px] ${refCell!.border.linked ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`} title={refCell!.border.linked ? "Kenarlar Bağlı" : "Kenarlar Bağımsız"}>
                  {refCell!.border.linked ? "🔗" : "🔓"}
                </button>
                {['t', 'r', 'b', 'l'].map(side => (
                  <div key={side} className="flex flex-col items-center relative z-30">
                    <span className="text-[8px] text-slate-500">{side === 't' ? 'Üst' : side === 'b' ? 'Alt' : side === 'r' ? 'Sağ' : 'Sol'}</span>
                    <input type="number" min="0" max="20" value={refCell!.border[side as 't' | 'r' | 'b' | 'l']} onChange={(e) => { const val = parseInt(e.target.value) || 0; if (refCell!.border.linked) { handleBorderChange('all', val); } else { handleBorderChange(side, val); } }} className="w-full text-[10px] text-center bg-slate-50 text-slate-700 border border-slate-200 rounded p-0.5 outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 relative z-20">
              <TypographyPicker title="Font ve Hizalama" value={refCell!.font} onChange={(val) => updateSelectedBannerCells({ font: val })} />
            </div>

            <div className="border-t border-slate-200 pt-3 relative z-10">
              <SpacingPicker title="Hücre İç Boşluğu (Padding)" value={refCell!.padding} onChange={(val) => updateSelectedBannerCells({ padding: val })} />
            </div>

            {/* YENİ: SIFIRLAMA BUTONU EKLENDİ */}
            <div className="border-t border-slate-200 pt-3 relative z-5">
              <button 
                onClick={() => {
                  if (window.confirm("Seçili hücrelerin tüm tasarım ayarlarını (resim ve metin dahil) varsayılan haline döndürmek istediğinize emin misiniz?")) {
                    resetSelectedBannerCells();
                  }
                }} 
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[10px] font-bold transition-colors shadow-sm"
              >
                Hücre Ayarlarını Sıfırla
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
