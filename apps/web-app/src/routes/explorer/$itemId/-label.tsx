import { polygonFromBounds, type Bounds } from "@/lib/spatial-utils"
import { useDeck, useDeckLayer } from "@/stores/deck-store"
import type { WebMercatorViewport } from "@deck.gl/core"
import { PolygonLayer } from "@deck.gl/layers"
import { useEffect, useState } from "react"

const WGS_BOX_ID = "wgs-84-box"

export function LabelComponent() {
    const [wgs84box, setWgs84Box] = useState<Bounds | null>(null)

    const deck = useDeck((s) => s.deck)
    const deckIsLoaded = useDeck((s) => s.isLoaded)
    const viewstate = useDeck((s) => s.viewState)
    const canvasSize = useDeck((s) => s.size)

    useEffect(() => {
        if (!deckIsLoaded || !deck) return

        const viewport = deck.getViewports()[0] as
            | WebMercatorViewport
            | undefined
        if (!viewport) return
        const { width: canvasWidth, height } = canvasSize

        const leftOffset = (1 / 3) * canvasWidth
        const width = (2 / 3) * canvasWidth
        const size = Math.min(width, height) * 0.98
        const xOffset = 0.5 * (width - size) + leftOffset
        const yOffset = 0.5 * (height - size)

        const [xmin, ymin] = viewport.unproject([xOffset, yOffset + size])
        const [xmax, ymax] = viewport.unproject([xOffset + size, yOffset])

        setWgs84Box([xmin, ymin, xmax, ymax])
    }, [viewstate, deck, deckIsLoaded, canvasSize])

    useDeckLayer({
        [WGS_BOX_ID]: new PolygonLayer<Bounds>({
            id: WGS_BOX_ID,
            data: wgs84box ? [wgs84box] : [],
            getPolygon: (bounds) => polygonFromBounds(bounds),
            stroked: true,
            // In order to be pickable must be filled
            // but it can be transparent
            filled: true,
            getFillColor: [0, 0, 0, 25],
            getLineColor: [255, 255, 0],

            getLineWidth: 2,
            lineWidthUnits: "pixels",
        }),
    })

    return null
}
