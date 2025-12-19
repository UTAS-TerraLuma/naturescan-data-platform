import type { Bounds } from "@/types/spatial"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface RgbCogDataLayer {
    type: "rgb-cog"
    id: string
    cogUrl: string
    bounds: Bounds
}

interface DataLayerStore {
    dataLayers: RgbCogDataLayer[]
    addDataLayer: (dl: RgbCogDataLayer) => void
    removeDataLayer: (id: string) => void
    clearDataLayers: () => void
}

export const useDataLayerStore = create<DataLayerStore>()(
    persist(
        (set) => ({
            dataLayers: [],
            addDataLayer: (dl) =>
                set((state) => {
                    const exists = state.dataLayers.some(
                        (layer) => layer.id === dl.id,
                    )
                    if (exists) {
                        return state
                    }
                    return {
                        dataLayers: [...state.dataLayers, dl],
                    }
                }),
            removeDataLayer: (id) =>
                set((state) => ({
                    dataLayers: state.dataLayers.filter(
                        (layer) => layer.id !== id,
                    ),
                })),
            clearDataLayers: () => set({ dataLayers: [] }),
        }),
        { name: "data-layers" },
    ),
)
