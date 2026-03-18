import type { Bounds } from "@/lib/spatial-utils"
import { create } from "zustand"

interface LabelStore {
    locked: boolean
    toggleLocked: () => void

    bounds: Bounds
    setBounds: (bounds: Bounds) => void
}

export const useLabelStore = create<LabelStore>((set) => ({
    locked: false,
    toggleLocked: () =>
        set((s) => ({
            locked: !s.locked,
        })),

    bounds: [0, 0, 0, 0],
    setBounds: (bounds) => set({ bounds }),
}))
