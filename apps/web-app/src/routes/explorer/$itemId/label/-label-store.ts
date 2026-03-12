import { boundsToCorners, type Bounds } from "@/lib/spatial-utils"
import { MAX_ZOOM } from "@/stores/deck-store"
import { WebMercatorViewport } from "@deck.gl/core"
import { create } from "zustand"

export const IMAGE_SIZE = 1036

interface LabelStore {
    bounds: Bounds | null
    setBounds: (b: Bounds | null) => void
    boundsPending: boolean
    setBoundsPending: (b: boolean) => void

    viewport: WebMercatorViewport | null
}

export const useLabelStore = create<LabelStore>((set, _get) => ({
    bounds: null,
    setBounds: (bounds) => {
        if (bounds) {
            const viewport = new WebMercatorViewport({
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
            }).fitBounds(boundsToCorners(bounds), { maxZoom: MAX_ZOOM })
            set({ bounds, viewport })
        } else {
            set({ bounds: null, viewport: null })
        }
    },
    viewport: null,

    boundsPending: false,
    setBoundsPending: (boundsPending) => set({ boundsPending }),
}))
