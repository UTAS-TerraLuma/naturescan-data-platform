import { create } from "zustand"
import { Layer } from "@deck.gl/core"

interface DeckLayerStore {
    layers: Layer[]
    updateLayer: (layer: Layer) => void
    removeLayer: (id: string) => void
    clearLayers: () => void
}

export const useDeckLayers = create<DeckLayerStore>((set) => ({
    layers: [],
    updateLayer: (layer) =>
        set((state) => {
            // Check if layer already exists
            const existingIndex = state.layers.findIndex(
                (l) => l.id === layer.id,
            )

            if (existingIndex !== -1) {
                // Replace existing layer
                const newLayers = [...state.layers]
                newLayers[existingIndex] = layer
                return { layers: newLayers }
            } else {
                return { layers: [...state.layers, layer] }
            }
        }),

    removeLayer: (id) =>
        set((state) => ({
            layers: state.layers.filter((l) => l.id !== id),
        })),

    clearLayers: () => set({ layers: [] }),
}))
