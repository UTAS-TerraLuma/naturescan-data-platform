import { polygonFromBounds, type Bounds } from "@/lib/spatial-utils"
import { useDeck, useDeckLayer } from "@/stores/deck-store"
import { WebMercatorViewport } from "@deck.gl/core"
import { PolygonLayer } from "@deck.gl/layers"
import { useEffect, useState } from "react"

const BOX_ID = "wgs84-screen-box"

export function ImageBoundsLayer() {
    const viewState = useDeck((s) => s.viewState)
    const size = useDeck((s) => s.size)

    const [bounds, setBounds] = useState<Bounds>([0, 0, 0, 0])

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

        setBounds([lngMin, latMin, lngMax, latMax])
    }, [viewState, size])

    useDeckLayer({
        [BOX_ID]: new PolygonLayer<Bounds>({
            id: BOX_ID,
            data: [bounds],
            getPolygon: (d) => polygonFromBounds(d),

            filled: false,
            stroked: true,

            getLineColor: [0, 0, 0],
            getLineWidth: 2,
            lineWidthUnits: "pixels",
        }),
    })

    return null
}
