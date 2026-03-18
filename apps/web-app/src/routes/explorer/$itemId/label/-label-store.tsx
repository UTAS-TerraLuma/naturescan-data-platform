import type { Bounds } from "@/lib/spatial-utils"
import { create } from "zustand"
import type { PromptMode } from "./-prompt-types"

interface LabelStore {
    locked: boolean
    toggleLocked: () => void

    bounds: Bounds
    setBounds: (bounds: Bounds) => void

    promptMode: PromptMode
    setPromptMode: (mode: PromptMode) => void

    pvsSimpleMode: boolean
    togglePvsSimpleMode: () => void

    nounPhrase: string
    setNounPhrase: (phrase: string) => void
}

export const useLabelStore = create<LabelStore>((set) => ({
    locked: false,
    toggleLocked: () =>
        set((s) => ({
            locked: !s.locked,
        })),

    bounds: [0, 0, 0, 0],
    setBounds: (bounds) => set({ bounds }),

    promptMode: "pvs",
    setPromptMode: (mode) => set({ promptMode: mode }),

    pvsSimpleMode: true,
    togglePvsSimpleMode: () => set((s) => ({ pvsSimpleMode: !s.pvsSimpleMode })),

    nounPhrase: "",
    setNounPhrase: (phrase) => set({ nounPhrase: phrase }),
}))
