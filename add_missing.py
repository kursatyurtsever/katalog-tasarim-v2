import os

filename = 'src/store/useCatalogStore.ts'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

if 'updatePageHeader' not in text:
    text = text.replace('updatePageFooter: (pageNumber: number, data: Partial<{ footerText: string; footerLogo: string | null }>) => void;', 'updatePageFooter: (pageNumber: number, data: Partial<{ footerText: string; footerLogo: string | null }>) => void;\n  updatePageHeader: (pageNumber: number, data: Partial<{ logoUrl: string; title: string; date: string; no: string }>) => void;')
    text = text.replace('headerData?: {\n    logoUrl: string;\n    title: string;\n    date: string;\n    no: string;\n  };', '')
    text = text.replace('footerLogo: string | null;', 'footerLogo: string | null;\n  headerData?: { logoUrl: string; title: string; date: string; no: string };')
    
    text = text.replace('updateSelectedSlotsImageSettings: (settings: any) => void;', 'updateSelectedSlotsImageSettings: (settings: any) => void;\n  updateSlotModuleData: (pageNumber: number, slotId: string, updates: any) => void;')
    
    update_header_func = """
      updatePageHeader: (pageNum, data) => {
          const { getActivePages, setActivePages } = get();
          const newPages = getActivePages().map((p) => p.pageNumber === pageNum ? { 
            ...p, 
            headerData: { ...(p.headerData || { logoUrl: "", title: "SELBSTABHOLER - ANGEBOT", date: "", no: "41" }), ...data } 
          } : p);
          setActivePages(newPages as any);
      },
"""
    text = text.replace('setProductPool: (products) => set({ productPool: products } as any),', update_header_func + '\n      setProductPool: (products) => set({ productPool: products } as any),')
    
    update_module_data_func = """
      updateSlotModuleData: (pageNumber, slotId, updates) => {
        const { getActivePages, setActivePages } = get();
        const newPages = getActivePages().map((p) => p.pageNumber === pageNumber ? {
          ...p,
          slots: p.slots.map(s => s.id === slotId ? {
            ...s,
            moduleData: typeof updates === "object" && updates !== null ? { ...(s.moduleData || {}), ...updates } : updates
          } : s)
        } : p);
        setActivePages(newPages as any);
      },
"""
    text = text.replace('revertToGlobalGrid: (pageNumber) => {', update_module_data_func + '\n      revertToGlobalGrid: (pageNumber) => {')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(text)

print("Added missing funcs")
