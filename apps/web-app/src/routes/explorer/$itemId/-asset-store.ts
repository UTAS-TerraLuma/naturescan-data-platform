import { create } from "zustand"

interface BandIndexes {
    r: number
    g: number
    b: number
}

type AssetType = "rgb" | "ms"

interface AssetStore {
    selectedAsset: AssetType
    setSelectedAsset: (m: AssetType) => void

    bandIndexes: BandIndexes
    setBandIndexes: (bands: Partial<BandIndexes>) => void
}

export const useAssetStore = create<AssetStore>((set) => ({
    selectedAsset: "rgb",
    setSelectedAsset: (mode) => set({ selectedAsset: mode }),

    bandIndexes: { r: 4, g: 2, b: 1 },
    setBandIndexes: (bands) =>
        set((state) => ({
            bandIndexes: { ...state.bandIndexes, ...bands },
        })),
}))
