import type { Deck, Layer, MapViewState } from "@deck.gl/core"
import type { Bounds } from "@/types/spatial"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const MAX_ZOOM = 26 // Increased max zoom

const INITIAL_VIEW_STATE: MapViewState = {
    longitude: 146.72470583325884,
    latitude: -42.182031003074464,
    bearing: 0,
    pitch: 0,
    zoom: 7.5,
    maxZoom: MAX_ZOOM,
}

interface DeckStore {
    deck?: Deck,
    setDeck: (d: Deck) => void

    viewState: MapViewState,
    updateViewState: (vs: Partial<MapViewState>) => void
    fitBounds: (bounds: Bounds) => void

    layers: Layer[],
    updateLayer: (layer: Layer) => void
    removeLayer: (id: string) => void
    clearLayers: () => void
}



export const useDeck = create<DeckStore>()(persist(
    (set, _get) => ({
        // deck undefined on init
        setDeck: (deck) => set({ deck }),

        viewState: INITIAL_VIEW_STATE,
        updateViewState: (newViewState) =>
            set((state) => ({
                viewState: {
                    ...state.viewState,
                    ...newViewState,
                    // Force bearing and pitch to be 0
                    bearing: 0,
                    pitch: 0,
                    maxZoom: MAX_ZOOM,
                },
            })),
        fitBounds: (bounds) => {
            console.log(bounds)
        },

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
    }),
    {
        name: "deck",
        // Only need to persist viewState
        partialize: state => ({ viewState: state.viewState })
    },
))
