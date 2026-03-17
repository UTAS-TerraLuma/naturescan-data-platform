import { create } from "zustand"

type BandPresetValue = {
    type: "bands"
    r: number
    g: number
    b: number
}

type ExpressionPresetValue = {
    type: "expression"
    expression: string
    colormap_name: string
    rescale: string
}

export type PresetValue = BandPresetValue | ExpressionPresetValue

type AssetType = "rgb" | "ms"

interface AssetStore {
    selectedAsset: AssetType
    setSelectedAsset: (m: AssetType) => void

    msPreset: Preset
    setMsPreset: (p: Preset) => void
}

export type Preset = {
    label: string
    value: PresetValue
}

export const presets: Preset[] = [
    {
        label: "NIR Red Green (b4,b2,b1)",
        value: { type: "bands", r: 4, g: 2, b: 1 },
    },
    {
        label: "RedEdge NIR Green (b3,b4,b1)",
        value: { type: "bands", r: 3, g: 4, b: 1 },
    },
    {
        label: "NDVI (b4-b2)/(b4+b2)",
        value: {
            type: "expression",
            expression: "(b4-b2)/(b4+b2)",
            colormap_name: "rdylgn",
            rescale: "-1,1",
        },
    },
]

export const useAssetStore = create<AssetStore>((set) => ({
    selectedAsset: "rgb",
    setSelectedAsset: (mode) => set({ selectedAsset: mode }),

    msPreset: presets[0],
    setMsPreset: (msPreset) => set({ msPreset }),
}))
