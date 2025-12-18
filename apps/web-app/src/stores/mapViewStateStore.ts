import type { MapViewState } from "@deck.gl/core"
import { create } from "zustand"

interface MapViewStateStore {
    viewState: MapViewState
    updateViewState: (vs: Partial<MapViewState>) => void
}

export const useMapViewState = create<MapViewStateStore>((set) => ({
    viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 10,
    },
    updateViewState: (newViewState) =>
        set((state) => ({
            viewState: { ...state.viewState, ...newViewState },
        })),
}))
