import type { Bounds } from "@/types/spatial"
import { WebMercatorViewport, type MapViewState } from "@deck.gl/core"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface MapViewStateStore {
    // It's not included in the types but deck
    // passes width and height as part of viewState
    viewState: MapViewState & { width?: number; height?: number }
    updateViewState: (vs: Partial<MapViewState>) => void
}

export const useMapViewState = create<MapViewStateStore>()(
    persist(
        (set) => ({
            viewState: {
                longitude: 146.72470583325884,
                latitude: -42.182031003074464,
                zoom: 7.5,

                // Increase default maxZoom
                maxZoom: 24,
            },
            updateViewState: (newViewState) =>
                set((state) => ({
                    viewState: {
                        ...state.viewState,
                        ...newViewState,
                        maxZoom: 24,
                    },
                })),
        }),
        { name: "map-view-state" },
    ),
)

export function fitBounds(bounds: Bounds) {
    const [xMin, yMin, xMax, yMax] = bounds
    const { viewState, updateViewState } = useMapViewState.getState()
    const { width, height } = viewState

    // If we don't have the size of the viewport
    // we can't fit the boudns. Instead just center it
    if (!(width && height)) {
        const longitude = (xMin + xMax) / 2
        const latitude = (yMin + yMax) / 2
        updateViewState({ longitude, latitude })
    }

    const viewport = new WebMercatorViewport({
        width,
        height,
    })

    const { longitude, latitude, zoom } = viewport.fitBounds([
        [xMin, yMin],
        [xMax, yMax],
    ])

    updateViewState({ longitude, latitude, zoom })
}
