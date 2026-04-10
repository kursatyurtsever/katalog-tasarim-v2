import os
import re

files = [
    'src/store/useBannerStore.ts', 
    'src/store/useLayerStore.ts', 
    'src/store/useHistoryStore.ts', 
    'src/store/useCatalogStore.ts'
]

clone_deep_func = """
const cloneDeep = <T>(value: T): T => (typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value))) as any;
"""

for filename in files:
    if not os.path.exists(filename): continue
    with open(filename, 'r', encoding='utf-8') as f:
        text = f.read()

    # Replace the existing cloneDeep implementation
    text = re.sub(r'function cloneDeep<T>\(value: T\): T \{\s*return JSON\.parse\(JSON\.stringify\(value\)\);\s*\}', clone_deep_func.strip(), text)
    
    # In useCatalogStore.ts, they have a lot of `set({ ... })`. Just append `as any` inside them if they cause TS errors.
    # The user says: o değişkenlerin veya objelerin sonuna acımasızca `as any` ekle.
    
    # For every `set({ ... })` call, let's cast the argument to `as any` to avoid any issue.
    # Actually, `set({...})` or `set((state) => ({...}))`
    text = re.sub(r'set\(\{(.*?)\}\)', r'set({\1} as any)', text)
    text = re.sub(r'set\(\(state\) => \(\{(.*?)\}\)\)', r'set((state) => ({\1} as any))', text)

    # Some cases are set((state) => { ... })
    # We can cast JSON.parse(JSON.stringify(...)) to `as any` if there are any remaining.
    text = text.replace('JSON.parse(JSON.stringify', '(JSON.parse(JSON.stringify')
    text = text.replace('globalSettings));', 'globalSettings)) as any);')
    text = text.replace('copiedSlotSettings));', 'copiedSlotSettings)) as any);')
    text = text.replace('get().globalSettings));', 'get().globalSettings)) as any);')
    text = text.replace('currentPages)));', 'currentPages))) as any);')
    text = text.replace('currentPages));', 'currentPages)) as any);')

    # Add `as any` to ...state.pastBanners.slice(-20) just in case
    text = text.replace('pastBanners: [', 'pastBanners: [') # we don't know exactly where, but let's try just doing the `as any` on the big set calls which we already did via regex `set({...} as any)`.

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(text)

print("Done")