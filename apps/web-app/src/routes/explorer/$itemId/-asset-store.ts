import { create } from "zustand"

interface BandIndexes {
    r: number
    g: number
    b: number
}

interface AssetStore {
    showRgb: boolean
    setShowRgb: (show: boolean) => void

    showMs: boolean
    setShowMs: (show: boolean) => void

    bandIndexes: BandIndexes
    setBandIndexes: (bands: Partial<BandIndexes>) => void
}

export const useAssetStore = create<AssetStore>((set) => ({
    showRgb: true,
    setShowRgb: (show) => set({ showRgb: show, showMs: !show }),

    showMs: false,
    setShowMs: (show) => set({ showMs: show, showRgb: !show }),

    bandIndexes: { r: 4, g: 2, b: 1 },
    setBandIndexes: (bands) =>
        set((state) => ({
            bandIndexes: { ...state.bandIndexes, ...bands },
        })),
}))
