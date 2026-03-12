import type {
    Deck,
    Layer,
    MapViewState,
    WebMercatorViewport,
} from "@deck.gl/core"
import type { Bounds } from "@/lib/spatial-utils"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect } from "react"

export const MAX_ZOOM = 26 // Increased max zoom

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

type LayersObject = Record<string, Layer | null>

interface DeckStore {
    deck: Deck | null
    setDeck: (d: Deck | null) => void
    isLoaded: boolean
    setIsLoaded: (b: boolean) => void

    size: Size
    setSize: (size: Size) => void

    viewState: MapViewState
    updateViewState: (vs: Partial<MapViewState>) => void

    layers: LayersObject
    upsertLayers: (layers: LayersObject) => void
    removeLayers: (id: string | string[]) => void
    clearLayers: () => void
}

export const useDeck = create<DeckStore>()(
    persist(
        (set, _get) => ({
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

            layers: {},
            upsertLayers: (newLayers) =>
                set((state) => ({
                    layers: {
                        ...state.layers,
                        ...newLayers,
                    },
                })),

            removeLayers: (id) => {
                const ids = new Set([id].flat())
                set((state) => ({
                    layers: Object.fromEntries(
                        Object.entries(state.layers).filter(
                            ([key]) => !ids.has(key),
                        ),
                    ),
                }))
            },

            clearLayers: () => set({ layers: {} }),
        }),
        {
            name: "deck",
            // Only need to persist viewState
            partialize: (state) => ({ viewState: state.viewState }),
        },
    ),
)

export function useDeckLayer(layers: LayersObject) {
    const upsertLayers = useDeck((s) => s.upsertLayers)
    const removeLayers = useDeck((s) => s.removeLayers)
    // Update layers when the object change
    useEffect(() => {
        upsertLayers(layers)
    }, [layers])
    // Only remove layers on unmount
    useEffect(() => () => removeLayers(Object.keys(layers)), [])
}

export function fitBounds([xmin, ymin, xmax, ymax]: Bounds) {
    const { deck, updateViewState, isLoaded } = useDeck.getState()

    if (!deck || !isLoaded) return

    // Sometimes this can still fail if deck
    // hasn't fully initialised yet
    const viewport = deck.getViewports()[0] as WebMercatorViewport | undefined
    if (!viewport) return

    const { width } = viewport

    const { longitude, latitude, zoom } = viewport.fitBounds(
        [
            [xmin, ymin],
            [xmax, ymax],
        ],
        {
            padding: {
                top: 40,
                bottom: 40,
                right: 20,
                left: width / 3 + 20,
            },
        },
    )
    updateViewState({ longitude, latitude, zoom })
}

export function useLayers() {
    const layerObject = useDeck((s) => s.layers)
    return Object.values(layerObject)
}
