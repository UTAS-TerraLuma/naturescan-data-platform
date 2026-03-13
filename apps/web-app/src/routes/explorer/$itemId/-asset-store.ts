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

const presets = ["4,2,1", "3,4,1"] as const

const presetCombinations: Record<Preset, BandIndexes> = {
    "3,4,1": { r: 3, g: 4, b: 1 },
    "4,2,1": { r: 4, g: 2, b: 1 },
}

type Preset = (typeof presets)[number]

export const useAssetStore = create<AssetStore>((set) => ({
    selectedAsset: "rgb",
    setSelectedAsset: (mode) => set({ selectedAsset: mode }),

    bandIndexes: { r: 4, g: 4, b: 4 },
    setBandIndexes: (bands) =>
        set((state) => ({
            bandIndexes: { ...state.bandIndexes, ...bands },
        })),
}))
