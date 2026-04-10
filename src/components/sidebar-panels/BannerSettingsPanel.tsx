"use client";

import { useRef, useState } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { SpacingPicker } from "../SpacingPicker";
import { defaultTypography, defaultSpacing } from "@/store/useCatalogStore";

export function BannerSettingsPanel() {
  const { selection, toggleElementSelection, setSelection } = useUIStore();
  const { getActivePages, updateSlotModuleData } = useCatalogStore();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Slot ve Banner Data bulma
  let slotId = null;
  if (selection.type === 'slot' && selection.ids.length > 0) slotId = selection.ids[0];
  if (selection.type === 'bannerCell' && selection.parentId) slotId = selection.parentId;

  let instanceData: any = null;
  let pageNumber: number | null = null;

  if (slotId) {
    const pages = getActivePages();
    for (const page of pages) {
      const slot = page.slots.find((s) => s.id === slotId);
      if (slot && slot.role === 'free' && slot.moduleData?.type === 'banner') {
        instanceData = slot.moduleData;
        pageNumber = page.pageNumber;
        break;
      }
    }
  }

  if (!instanceData) return <div className="p-4 text-xs text-slate-500">Lütfen bir banner modülü seçin.</div>;

  const cells = instanceData.cells || [];
  const selectedBannerCellIds = selection.type === 'bannerCell' && selection.parentId === slotId ? selection.ids : [];
  
  const selectedCells = cells.filter((c: any) => selectedBannerCellIds.includes(c.id));
  const refCell = selectedCells.length > 0 ? selectedCells[0] : null;

  // --- LOCAL ACTIONS ---
  const updateBannerCell = (cellId: string, updates: any) => {
    if (!slotId || pageNumber === null) return;
    const newCells = cells.map((c: any) => c.id === cellId ? { ...c, ...updates } : c);
    updateSlotModuleData(pageNumber, slotId, { cells: newCells });
  };

  const updateSelectedBannerCells = (updates: any) => {
    if (!slotId || pageNumber === null) return;
    const newCells = cells.map((c: any) => selectedBannerCellIds.includes(c.id) ? { ...c, ...updates } : c);
    updateSlotModuleData(pageNumber, slotId, { cells: newCells });
  };

  const toggleBannerCellSelection = (id: string, isMulti: boolean) => {
    toggleElementSelection('bannerCell', id, isMulti, slotId);
  };

  const mergeBannerCells = () => {
    if (selectedBannerCellIds.length < 2) return { success: false, error: "En az 2 hücre seçmelisiniz." };

    const grid: (string | null)[][] = [];
    const coords: Record<string, { r: number; c: number; w: number; h: number }> = {};
    let r = 0, c = 0;
    
    cells.filter((cell: any) => !cell.hidden).forEach((cell: any) => {
      let placed = false;
      while (!placed) {
        if (!grid[r]) grid[r] = Array(8).fill(null);
        if (grid[r][c] === null) {
          for (let ir = 0; ir < cell.rowSpan; ir++) {
            if (!grid[r + ir]) grid[r + ir] = Array(8).fill(null);
            for (let ic = 0; ic < cell.colSpan; ic++) grid[r + ir][c + ic] = cell.id;
          }
          coords[cell.id] = { r, c, w: cell.colSpan, h: cell.rowSpan };
          placed = true;
        }
        if (!placed) { c++; if (c >= 8) { c = 0; r++; } }
      }
    });

    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity, totalArea = 0;
    selectedBannerCellIds.forEach(id => {
      const ci = coords[id];
      if (ci) { 
        minR = Math.min(minR, ci.r); maxR = Math.max(maxR, ci.r + ci.h - 1); 
        minC = Math.min(minC, ci.c); maxC = Math.max(maxC, ci.c + ci.w - 1); 
        totalArea += (ci.w * ci.h);
      }
    });

    const expectedArea = (maxR - minR + 1) * (maxC - minC + 1);
    if (totalArea !== expectedArea) return { success: false, error: "Hatalı Seçim: Yalnızca kare veya dikdörtgen formunda birleştirme yapabilirsiniz." };

    const survivorId = grid[minR][minC];
    if (!survivorId || !selectedBannerCellIds.includes(survivorId)) return { success: false, error: "Hücre yerleşimi hesaplanamadı." };

    const newCells = [...cells];
    const survivorIdx = newCells.findIndex(cell => cell.id === survivorId);
    
    newCells[survivorIdx] = { ...newCells[survivorIdx], colSpan: maxC - minC + 1, rowSpan: maxR - minR + 1 };

    selectedBannerCellIds.filter(id => id !== survivorId).forEach(id => {
      const idx = newCells.findIndex(cell => cell.id === id);
      newCells[idx] = { ...newCells[idx], hidden: true, mergedInto: survivorId, text: "", image: null };
    });

    if (pageNumber && slotId) {
      updateSlotModuleData(pageNumber, slotId, { cells: newCells });
      setSelection({ ids: [survivorId] });
    }
    return { success: true };
  };

  const handleMerge = () => {
    const result = mergeBannerCells();
    if (!result.success) alert(result.error);
  };

  const handleUnmerge = () => {
    if (!refCell || refCell.colSpan === 1 && refCell.rowSpan === 1) return;
    const newCells = [...cells];
    const survivorIdx = newCells.findIndex(c => c.id === refCell.id);
    if (survivorIdx === -1) return;

    newCells[survivorIdx] = { ...newCells[survivorIdx], colSpan: 1, rowSpan: 1 };
    newCells.forEach((c, i) => { if (c.mergedInto === refCell.id) newCells[i] = { ...c, hidden: false, mergedInto: null }; });

    if (pageNumber && slotId) {
      updateSlotModuleData(pageNumber, slotId, { cells: newCells });
    }
  };

  const resetSelectedBannerCells = () => {
    if (selectedBannerCellIds.length === 0 || !pageNumber || !slotId) return;
    const newCells = cells.map((c: any) => 
      selectedBannerCellIds.includes(c.id) ? {
        ...c,
        text: "", 
        image: null, 
        font: { ...defaultTypography, fontSize: 14, fontWeight: "700", color: "#1e293b" },
        padding: { ...defaultSpacing },
        bgColor: { c: "#ffffff", o: 0 },
        border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" }
      } : c
    );
    updateSlotModuleData(pageNumber, slotId, { cells: newCells });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCells.length !== 1 || !e.target.files || !e.target.files[0]) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", `banner-${refCell!.id}-${Date.now()}.png`);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const result = await res.json();
        updateBannerCell(refCell!.id, { image: `${result.path}?t=${Date.now()}` });
      } else {
        alert(`Resim yüklenemedi`);
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
          {cells.filter((c: any) => !c.hidden).map((cell: any) => (
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