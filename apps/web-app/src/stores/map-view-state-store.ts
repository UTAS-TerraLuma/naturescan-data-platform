import type { MapViewState } from "@deck.gl/core"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface MapViewStateStore {
    viewState: MapViewState
    updateViewState: (vs: Partial<MapViewState>) => void
}

export const useMapViewState = create<MapViewStateStore>()(
    persist(
        (set) => ({
            viewState: {
                longitude: 146.72470583325884,
                latitude: -42.182031003074464,
                zoom: 7.5,
            },
            updateViewState: (newViewState) =>
                set((state) => ({
                    viewState: { ...state.viewState, ...newViewState },
                })),
        }),
        { name: "map-view-state" },
    ),
)
