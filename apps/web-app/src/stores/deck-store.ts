import type {
    Deck,
    Layer,
    MapViewState,
    WebMercatorViewport,
} from "@deck.gl/core"
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

type Size = {
    width: number
    height: number
}

interface DeckStore {
    deck: Deck | null
    setDeck: (d: Deck | null) => void
    isLoaded: boolean
    setIsLoaded: (b: boolean) => void

    size: Size
    setSize: (size: Size) => void

    viewState: MapViewState
    updateViewState: (vs: Partial<MapViewState>) => void
    fitBounds: (bounds: Bounds) => void

    layers: Layer[]
    updateLayer: (layer: Layer) => void
    removeLayer: (id: string) => void
    clearLayers: () => void
}

export const useDeck = create<DeckStore>()(
    persist(
        (set, get) => ({
            deck: null,
            setDeck: (deck) => set({ deck }),
            isLoaded: false,
            setIsLoaded: (isLoaded) => set({ isLoaded }),

            size: { width: 1, height: 1 },
            setSize: (size) => set({ size }),

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
            fitBounds: ([xmin, ymin, xmax, ymax]: Bounds) => {
                const { deck, updateViewState, isLoaded } = get()

                if (!deck || !isLoaded) return

                // Sometimes this can still fail if deck
                // hasn't fully initialised yet
                const viewport = deck.getViewports()[0] as WebMercatorViewport
                const { longitude, latitude, zoom } = viewport.fitBounds([
                    [xmin, ymin],
                    [xmax, ymax],
                ])
                updateViewState({ longitude, latitude, zoom })
            },

            layers: [],
            updateLayer: (layer) => {
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
                })

                return () => get().removeLayer(layer.id)
            },

            removeLayer: (id) =>
                set((state) => ({
                    layers: state.layers.filter((l) => l.id !== id),
                })),

            clearLayers: () => set({ layers: [] }),
        }),
        {
            name: "deck",
            // Only need to persist viewState
            partialize: (state) => ({ viewState: state.viewState }),
        },
    ),
)
