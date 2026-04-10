import os
import re

files = [
    'src/store/useBannerStore.ts', 
    'src/store/useLayerStore.ts', 
    'src/store/useHistoryStore.ts', 
    'src/store/useCatalogStore.ts'
]

clone_deep_func = """
const cloneDeep = <T>(value: T): T => ((typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value))) as any);
"""

for filename in files:
    if not os.path.exists(filename): continue
    with open(filename, 'r', encoding='utf-8') as f:
        text = f.read()

    # Replace the existing cloneDeep implementation
    text = re.sub(r'function cloneDeep<T>\(value: T\): T \{\s*return JSON\.parse\(JSON\.stringify\(value\)\);\s*\}', clone_deep_func.strip(), text)
    
    # Let's target the exact string assignments giving errors if we can, 
    # but the user said "acımasızca as any ekle" to set / update objects.
    
    # We will wrap ALL `JSON.parse(JSON.stringify(...))` with `(... as any)`
    # Wait, the typescript errors are happening because when you use `cloneDeep(x)`, it now returns `T`, but internally `structuredClone(x)` returns `any` and `JSON.parse(JSON.stringify(x))` returns `any` but we typecast it to `as any` then the return type of `cloneDeep` is `T`.
    # Wait! If `cloneDeep` returns `T`, there shouldn't be ANY TS errors!
    # Ah, the user's issue might be that `structuredClone` is not recognized by their TS compiler (it requires es2022+ in tsconfig).
    # If `structuredClone` returns type error, then `typeof structuredClone` gives error?
    # Let's add `// @ts-ignore` inside the new `cloneDeep`!

    text = re.sub(r'const cloneDeep = .*?\n', """
// @ts-ignore
const cloneDeep = <T>(value: T): T => ((typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value))) as any);
""", text)

    # Let's also wrap JSON.parse(JSON.stringify) with `(JSON.parse(...) as any)` in the codebase!
    # A simple way is to replace `JSON.parse(JSON.stringify(x))` with `(JSON.parse(JSON.stringify(x)) as any)`
    text = re.sub(r'JSON\.parse\(JSON\.stringify\((.*?)\)\)', r'(JSON.parse(JSON.stringify(\1)) as any)', text)

    # Also for `set({...})`, it might complain about `past`, `future`, etc. because `as any` isn't applied.
    # The safest way is to do `set({ ... } as any)`
    # but let's be extremely careful to only replace `set({` when it's closed correctly, actually python regex is bad at matched parens.
    # We can just ignore the `set` thing and let's see if wrapping JSON.parse and cloneDeep's structuredClone is enough!
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(text)

print("Done")
