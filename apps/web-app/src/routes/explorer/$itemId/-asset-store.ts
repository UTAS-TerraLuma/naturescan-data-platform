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

    msPreset: Preset
    setMsPreset: (p: Preset) => void
}

export type Preset = {
    label: string
    value: BandIndexes
}

export const presets: Preset[] = [
    { label: "NIR Red Green (4,2,1)", value: { r: 4, g: 2, b: 1 } },
    { label: "RedEdge NIR Green (3,4,1)", value: { r: 3, g: 4, b: 1 } },
]

export const useAssetStore = create<AssetStore>((set) => ({
    selectedAsset: "rgb",
    setSelectedAsset: (mode) => set({ selectedAsset: mode }),

    bandIndexes: { r: 4, g: 4, b: 4 },
    setBandIndexes: (bands) =>
        set((state) => ({
            bandIndexes: { ...state.bandIndexes, ...bands },
        })),

    msPreset: presets[0],
    setMsPreset: (msPreset) => set({ msPreset }),
}))
