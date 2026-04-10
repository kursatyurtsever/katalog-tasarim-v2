import re

filename = 'src/store/useBannerStore.ts'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

# Add immer if not exist
if 'import { produce }' not in text:
    text = text.replace('import { create } from "zustand";', 'import { create } from "zustand";\nimport { produce } from "immer";')

# Replace JSON.parse(JSON.stringify) with direct assignments or produce
text = text.replace('JSON.parse(JSON.stringify(state.bannerSettings))', 'state.bannerSettings')
# wait, if state.bannerSettings is used in pastBanners, it must be immutable. Since it's from state, it is immutable unless manually mutated. 
# wait, if they mutate bannerSettings directly, they break Zustand. Assuming they use `set`, then `bannerSettings` is a new object each time.
# But wait! If they do `set((state) => { state.bannerSettings.xxx = yyy; return state })`, that mutates it.
# Let's just wrap the entire store's creator with immer's middleware so we don't have to worry about anything!

# Actually, the user's specific request is switching to immer.
