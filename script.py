import re

filename = 'src/store/useCatalogStore.ts'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

if 'import { produce }' not in text:
    text = text.replace('import { create } from "zustand";', 'import { create } from "zustand";\nimport { produce } from "immer";')

text = text.replace('saveState(cloneDeep(currentPages));', 'saveState(currentPages);')
text = text.replace('saveState(cloneDeep(get().getActivePages()));', 'saveState(get().getActivePages());')
text = text.replace('saveState(JSON.parse(JSON.stringify(currentPages)));', 'saveState(currentPages);')

# Now replacing "const newPages = cloneDeep(currentPages);" with "const newPages = produce(currentPages, (newPages) => {"
# and replacing "setActivePages(newPages);" with "});\n        setActivePages(newPages);"

# We will just do a regex replace to catch this exact pattern!
import re

pattern = re.compile(r'const newPages = cloneDeep\(currentPages\);(.*?)setActivePages\(newPages\);', re.DOTALL)
def replacer(match):
    body = match.group(1)
    # the body mutates newPages
    return f'const newPages = produce(currentPages, (newPages) => {{{body}}});\n        setActivePages(newPages);'

text = pattern.sub(replacer, text)

# For newFormas = cloneDeep(formas); -> const newFormas = produce(formas, (newFormas) => { ... }); set({ formas: newFormas });
pattern2 = re.compile(r'const newFormas = cloneDeep\(formas\);(.*?)set\(\{ formas: newFormas \}\);', re.DOTALL)
def replacer2(match):
    body = match.group(1)
    return f'const newFormas = produce(formas, (newFormas) => {{{body}}});\n        set({{ formas: newFormas }});'

text = pattern2.sub(replacer2, text)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(text)
