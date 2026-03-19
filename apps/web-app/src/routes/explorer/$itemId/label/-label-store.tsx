import type { Bounds } from "@/lib/spatial-utils"
import { create } from "zustand"
import type { BBoxPrompt, PointPrompt, PromptMode } from "./-prompt-types"
import type { SegmentationFeature } from "./-segment-result-schema"

interface LabelStore {
    locked: boolean
    toggleLocked: () => void

    imageUrl: string | null
    setImageUrl: (imageUrl: string | null) => void

    bounds: Bounds
    setBounds: (bounds: Bounds) => void

    promptMode: PromptMode
    setPromptMode: (mode: PromptMode) => void

    pvsSimpleMode: boolean
    togglePvsSimpleMode: () => void

    nounPhrase: string
    setNounPhrase: (phrase: string) => void

    points: PointPrompt[]
    addPoint: (p: PointPrompt) => void

    bbox: BBoxPrompt | null
    setBBox: (b: BBoxPrompt) => void

    exemplars: BBoxPrompt[]
    addExemplar: (e: BBoxPrompt) => void

    clearPrompts: () => void

    segmentationFeatures: SegmentationFeature[]
    addSegmentationFeatures: (s: SegmentationFeature[]) => void
    deleteSegmentationFeature: (id: string) => void
}

export const useLabelStore = create<LabelStore>((set) => ({
    locked: false,
    toggleLocked: () =>
        set((s) => ({
            locked: !s.locked,
        })),

    imageUrl: null,
    setImageUrl: (imageUrl) => set({ imageUrl }),

    bounds: [0, 0, 0, 0],
    setBounds: (bounds) => set({ bounds }),

    promptMode: "pvs",
    setPromptMode: (mode) => set({ promptMode: mode }),

    pvsSimpleMode: false,
    togglePvsSimpleMode: () =>
        set((s) => ({ pvsSimpleMode: !s.pvsSimpleMode })),

    nounPhrase: "",
    setNounPhrase: (phrase) => set({ nounPhrase: phrase }),

    points: [],
    addPoint: (p) => set((s) => ({ points: [...s.points, p] })),

    bbox: null,
    setBBox: (b) => set({ bbox: b }),

    exemplars: [],
    addExemplar: (e) => set((s) => ({ exemplars: [...s.exemplars, e] })),

    clearPrompts: () => set({ points: [], bbox: null, exemplars: [] }),

    segmentationFeatures: [],
    addSegmentationFeatures: (sf) =>
        set((state) => ({
            segmentationFeatures: [...state.segmentationFeatures, ...sf],
        })),

    deleteSegmentationFeature: (id) => {
        set((state) => ({
            segmentationFeatures: state.segmentationFeatures.filter(
                (s) => s.properties.id !== id,
            ),
        }))
    },
}))
