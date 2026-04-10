"use client";

import { useRef, useState } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { ColorOpacityPicker } from "../ColorOpacityPicker";
import { TypographyPicker } from "../TypographyPicker";
import { SpacingPicker } from "../SpacingPicker";
import { Info } from "@phosphor-icons/react";

export function FooterSettingsPanel() {
  const { selection, toggleElementSelection, contextualBarSelectedPages } = useUIStore();
  const { 
    globalSettings, getActivePages, setPageFooterMode, 
    updateFooterSettings, updateFooterCellStore, 
    mergeFooterCellsStore, unmergeFooterCellStore 
  } = useCatalogStore();

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aktif sayfa bağlamını belirle (Seçili hücreden veya contextual bardan)
  let pageNumber = 1;
  if (selection.type === 'footerCell' && selection.parentId?.startsWith('page-')) {
    pageNumber = parseInt(selection.parentId.split('-')[1]);
  } else if (contextualBarSelectedPages.length > 0) {
    pageNumber = contextualBarSelectedPages[0];
  }

  const pages = getActivePages();
  const page = pages.find(p => p.pageNumber === pageNumber) || pages[0];
  if (!page) return null;

  const footerMode = page.footerMode || 'global';
  const scope = footerMode === 'global' ? 'global' : pageNumber;
  
  const activeFooter = footerMode === 'custom' && page.customFooter 
    ? page.customFooter 
    : globalSettings.footer;

  const cells = activeFooter?.cells || [];
  const selectedFooterCellIds = selection.type === 'footerCell' ? selection.ids : [];
  const selectedCells = cells.filter(c => selectedFooterCellIds.includes(c.id));
  const refCell = selectedCells.length > 0 ? selectedCells[0] : null;

  const handleModeChange = (mode: 'global' | 'custom' | 'hidden') => {
    setPageFooterMode(page.pageNumber, mode);
    useUIStore.getState().clearSelection();
  };

  const updateSelectedCells = (updates: any) => {
    selectedFooterCellIds.forEach(id => updateFooterCellStore(scope, id, updates));
  };

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
        updateFooterCellStore(scope, refCell.id, { image: `${data.path}?t=${Date.now()}` });
      }
    } catch(err) {
      alert("Hata: " + err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 shadow-sm">
        <span className="text-[10px] font-black text-slate-700">Sayfa {page.pageNumber} Footer</span>
        <div className="flex gap-1 bg-white p-1 rounded border border-slate-200">
          <button onClick={() => handleModeChange('global')} className={`px-2 py-1 text-[9px] font-bold rounded ${footerMode === 'global' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>Global</button>
          <button onClick={() => handleModeChange('custom')} className={`px-2 py-1 text-[9px] font-bold rounded ${footerMode === 'custom' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>Özel</button>
          <button onClick={() => handleModeChange('hidden')} className={`px-2 py-1 text-[9px] font-bold rounded ${footerMode === 'hidden' ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-100'}`}>Gizle</button>
        </div>
      </div>

      {footerMode === 'hidden' ? (
        <div className="p-3 bg-amber-50 text-amber-700 text-[10px] rounded border border-amber-200 font-bold flex gap-2 items-center">
          <Info size={16} weight="fill" className="shrink-0" />
          Bu sayfada footer gizlendi. Ürün ızgarası sayfanın en altına kadar uzanacaktır.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm">
            <span className="text-[9px] font-bold text-slate-600">Yükseklik</span>
            <input type="range" min="10" max="50" value={activeFooter.heightMm} onChange={(e) => updateFooterSettings(scope, { heightMm: parseInt(e.target.value) })} className="flex-1 accent-blue-600" />
            <span className="text-[10px] font-bold text-slate-700 w-8 text-right">{activeFooter.heightMm}mm</span>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold text-slate-700">1x5 Hücre Izgarası</span>
              <span className="text-[8px] text-slate-500">Çoklu Seçim: Ctrl/Shift</span>
            </div>
            <div className="grid grid-cols-5 gap-px bg-slate-200 border border-slate-200 p-px rounded-sm">
              {cells.filter(c => !c.hidden).map(cell => (
                <div
                  key={cell.id}
                  onClick={(e) => toggleElementSelection('footerCell', cell.id, e.ctrlKey || e.shiftKey, `page-${pageNumber}`)}
                  style={{ gridColumn: `span ${cell.colSpan}` }}
                  className={`h-6 flex items-center justify-center text-[8px] cursor-pointer transition-colors overflow-hidden ${selectedFooterCellIds.includes(cell.id) ? "bg-blue-100 ring-1 ring-inset ring-blue-500 text-blue-700 font-bold" : "bg-white hover:bg-slate-100 text-slate-500"}`}
                >
                  {cell.image ? "Resim" : (cell.text ? cell.text.substring(0, 5) + "..." : "Boş")}
                </div>
              ))}
            </div>
          </div>

          {selectedFooterCellIds.length > 0 && (
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-4">
              <div className="flex gap-2">
                <button onClick={() => mergeFooterCellsStore(scope, selectedFooterCellIds)} disabled={selectedFooterCellIds.length < 2} className={`flex-1 py-1.5 rounded text-[9px] font-bold transition-colors ${selectedFooterCellIds.length >= 2 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Birleştir</button>
                <button onClick={() => refCell && unmergeFooterCellStore(scope, refCell.id)} disabled={!refCell || refCell.colSpan === 1} className={`flex-1 py-1.5 rounded text-[9px] font-bold transition-colors ${refCell && refCell.colSpan > 1 ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Ayır</button>
              </div>

              {selectedFooterCellIds.length === 1 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500">Metin</span>
                    <textarea rows={2} value={refCell!.text} onChange={(e) => updateFooterCellStore(scope, refCell!.id, { text: e.target.value })} className="w-full text-[10px] font-bold text-slate-700 border border-slate-200 rounded p-1.5 outline-none focus:border-blue-500 resize-none" placeholder="Metin girin..." />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500">Resim / Logo</span>
                    <input type="file" accept="image/*" className="hidden" id="footer-img-upload" ref={fileInputRef} onChange={handleImageUpload} />
                    <div className="flex gap-1">
                      <label htmlFor="footer-img-upload" className="flex-1 h-7 flex items-center justify-center text-[9px] font-bold text-slate-600 border border-slate-200 rounded cursor-pointer hover:border-blue-400">{isUploading ? "Yükleniyor..." : "Resim Seç"}</label>
                      {refCell!.image && <button onClick={() => updateFooterCellStore(scope, refCell!.id, { image: null })} className="px-2 h-7 bg-red-50 text-red-600 text-[9px] font-bold border border-red-200 rounded">Sil</button>}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600">Arka Plan Rengi</span>
                <ColorOpacityPicker color={refCell!.bgColor.c} opacity={refCell!.bgColor.o} onChange={(c, o) => updateSelectedCells({ bgColor: { c, o } })} />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <TypographyPicker title="Font Ayarları" value={refCell!.font} onChange={(val) => updateSelectedCells({ font: val })} />
              </div>
              
              <div className="pt-2 border-t border-slate-100">
                <SpacingPicker title="İç Boşluk (Padding)" value={refCell!.padding} onChange={(val) => updateSelectedCells({ padding: val })} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}