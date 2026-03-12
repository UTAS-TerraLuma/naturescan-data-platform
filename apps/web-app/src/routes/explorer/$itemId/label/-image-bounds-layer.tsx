import { polygonFromBounds, type Bounds } from "@/lib/spatial-utils"
import { useDeck, useDeckLayer } from "@/stores/deck-store"
import { WebMercatorViewport } from "@deck.gl/core"
import { PolygonLayer } from "@deck.gl/layers"
import { useEffect, useState } from "react"
import { useDebouncer } from "@tanstack/react-pacer"
import { useLabelStore } from "./-label-store"

const BOX_ID = "wgs84-screen-box"

export function ImageBoundsLayer() {
    const viewState = useDeck((s) => s.viewState)
    const size = useDeck((s) => s.size)
    const [previewBounds, setPreviewBounds] = useState<Bounds | null>(null)
    const setBounds = useLabelStore((s) => s.setBounds)
    const setBoundsIsPending = useLabelStore((s) => s.setBoundsPending)

    const boundsDebouncer = useDebouncer(
        (bounds: Bounds) => setBounds(bounds),
        { wait: 300 },
        (state) => ({ isPending: state.isPending }),
    )

    const isPending = boundsDebouncer.state.isPending

    useEffect(() => {
        if (previewBounds) {
            boundsDebouncer.maybeExecute(previewBounds)
        }
    }, [previewBounds])

    useEffect(() => {
        setBoundsIsPending(isPending)
    }, [isPending])

    useEffect(() => {
        // Get current viewport
        const { width, height } = size
        const { longitude, latitude, zoom } = viewState
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

        setPreviewBounds([lngMin, latMin, lngMax, latMax])
    }, [viewState, size])

    useDeckLayer({
        [BOX_ID]: new PolygonLayer<Bounds>({
            id: BOX_ID,
            data: [previewBounds],
            getPolygon: (d) => polygonFromBounds(d),

            filled: false,
            stroked: true,

            getLineColor: isPending ? [250, 250, 0] : [0, 0, 0],
            getLineWidth: 2,
            lineWidthUnits: "pixels",
        }),
    })

    return null
}
