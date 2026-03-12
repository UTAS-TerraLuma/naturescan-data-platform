import type { Bounds } from "@/lib/spatial-utils"
import { useDeck } from "@/stores/deck-store"
import { WebMercatorViewport } from "@deck.gl/core"
import { useDebouncedValue } from "@tanstack/react-pacer"
import { useMemo } from "react"

/**
 * Finds the WGS84 bounds of the largest square possible in
 * available / visisble screen space. Note, this is hardcoded
 * to use the right 2/3 of the screen.
 */
export function useScreenSquareBounds() {
    const viewState = useDeck((s) => s.viewState)
    const size = useDeck((s) => s.size)
    const { width, height } = size
    const { longitude, latitude, zoom } = viewState

    const bounds = useMemo<Bounds>(() => {
        const viewport = new WebMercatorViewport({
            width,
            height,
            longitude,
            latitude,
            zoom,
        })

        // Define box in px coordinate space
        const maxBoxWidth = (2 / 3) * width
        const maxBoxHeight = height

        const boxSize = Math.min(maxBoxWidth, maxBoxHeight) * 1
        const xOffset = (1 / 3) * width + 0.5 * (maxBoxWidth - boxSize) - 4
        const yOffset = 0.5 * (maxBoxHeight - boxSize)

        const [lngMin, latMin] = viewport.unproject([
            xOffset,
            yOffset + boxSize,
        ])
        const [lngMax, latMax] = viewport.unproject([
            xOffset + boxSize,
            yOffset,
        ])

        return [lngMin, latMin, lngMax, latMax]
    }, [width, height, longitude, latitude, zoom])

    return bounds
}

/**
 * Debounced screen square bounds are calculated after a user
 * has stopped moving around the map
 */
export function useDebouncedScreenSquareBounds(): [Bounds, boolean] {
    const previewBounds = useScreenSquareBounds()
    const [bounds, boundsDebouncer] = useDebouncedValue(
        previewBounds,
        { wait: 300 },
        (state) => ({ isStale: state.isPending }),
    )
    const isStale = boundsDebouncer.state.isStale

    return [bounds, isStale]
}
