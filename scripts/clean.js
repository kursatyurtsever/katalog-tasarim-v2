const fs = require('fs'); 
const file = 'src/store/useCatalogStore.ts'; 
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/toggleZoom:\s*\(\)\s*=>\s*set/g, `updatePageFooter: (pageNum, data) => set((state) => ({
        formas: setActivePages(
          state,
          getActivePages(state).map((p) => p.pageNumber === pageNum ? { ...p, ...data } : p)
        )
      })),
      
      toggleZoom: () => set`);

content = content.replace(/globalBackground:\s*cloneDeep\(defaultBackground\),/g, '');
content = content.replace(/isGlobalBackgroundActive:\s*false,/g, '');
content = content.replace(/background:\s*normalizeBackgroundSettings\(defaultBackground, page\.background\),/g, '');
content = content.replace(/globalBackground:\s*normalizeBackgroundSettings\(defaultBackground, forma\.globalBackground\),/g, '');
content = content.replace(/isGlobalBackgroundActive:\s*typeof forma\.isGlobalBackgroundActive === ["']boolean["'] \? forma\.isGlobalBackgroundActive : false,/g, '');
content = content.replace(/isGlobalActive:\s*false,/g, '');

content = content.replace(/globalBackground:\s*normalizeBackgroundSettings\([\s\S]*?\),/g, '');
content = content.replace(/isGlobalBackgroundActive:[\s\S]*?,/g, '');

fs.writeFileSync(file, content);
