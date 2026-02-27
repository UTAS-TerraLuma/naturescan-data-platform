import { collectionItemQueryOptions } from "@/lib/stac-queries"
import { useDeck } from "@/stores/deck-store"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { PolygonLayer, TextLayer } from "@deck.gl/layers"
import { COORDINATE_SYSTEM, WebMercatorViewport } from "@deck.gl/core"

import { format } from "d3-format"

const coordFormat = format(",.2f")

import { Proj4Projection } from "@/lib/projections"
import { createTitilerUrl } from "@/lib/titiler"

export const Route = createFileRoute("/explorer/$collectionId/$itemId/label")({
    component: RouteComponent,
})

const BOX_SCALE = 0.75

function RouteComponent() {
    const { collectionId, itemId } = Route.useParams()
    const { data: item } = useSuspenseQuery(
        collectionItemQueryOptions(collectionId, itemId),
    )

    const crsCode = item.properties["proj:code"]

    const projection = new Proj4Projection({ from: "EPSG:4326", to: crsCode })

    const [size, setSize] = useState(50)

    const deckIsLoaded = useDeck((s) => s.isLoaded)
    const updateLayer = useDeck((s) => s.updateLayer)
    const removeLayer = useDeck((s) => s.removeLayer)

    const viewState = useDeck((s) => s.viewState)

    const deck = useDeck((s) => s.deck)

    useEffect(() => {
        const boxID = "bbox"
        const textID = "bbox-text"

        const { longitude, latitude } = viewState
        const offset = size / 2

        const polygonLayer = new PolygonLayer({
            id: boxID,
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            coordinateOrigin: [longitude, latitude, 1],
            data: [
                {
                    polygon: [
                        [-offset, -offset],
                        [-offset, offset],
                        [offset, offset],
                        [offset, -offset],
                        [-offset, -offset],
                    ],
                },
            ],
            getPolygon: (d) => d.polygon,
            stroked: true,
            // In order to be pickable must be filled
            // but it can be transparent
            filled: true,
            getFillColor: [0, 0, 0, 25],
            getLineColor: [255, 0, 0],

            getLineWidth: 2,
            lineWidthUnits: "pixels",
        })

        const [x, y] = projection.project([longitude, latitude])

        const textLayer = new TextLayer({
            id: textID,
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            coordinateOrigin: [longitude, latitude, 1],
            data: [
                {
                    text: `Center (${crsCode}): ${coordFormat(x)} E ${coordFormat(y)} N | Box size: ${size.toFixed(1)} m`,
                    position: [-offset, -offset],
                },
            ],
            getPosition: (d) => d.position,
            getText: (d) => d.text,
            getColor: [255, 0, 0],
            getSize: 24,
            backgroundPadding: [5, 5, 5, 5],
            getPixelOffset: [5, 5],
            getAlignmentBaseline: "top",
            getTextAnchor: "start",
            background: true,
            getBackgroundColor: [0, 0, 0, 200],
        })

        updateLayer(polygonLayer)
        updateLayer(textLayer)

        return () => {
            removeLayer(boxID)
            removeLayer(textID)
        }
    }, [updateLayer, removeLayer, viewState, size, crsCode])

    useEffect(() => {
        if (!deck || !deckIsLoaded) return

        // Get bounds of viewport in longitude and latitude
        const viewport = deck.getViewports()[0] as WebMercatorViewport
        const [lngmin, latmin, lngmax, latmax] = viewport.getBounds()

        // Convert to projected coordinate space in metres
        const [xmin, ymin] = projection.project([lngmin, latmin])
        const [xmax, ymax] = projection.project([lngmax, latmax])

        // Get size of bounding box
        const width = xmax - xmin
        const height = ymax - ymin
        const size = Math.min(width, height) * BOX_SCALE
        setSize(size)
    }, [viewState, deck, deckIsLoaded, setSize])

    const imageUrl = useMemo(() => {
        const { longitude, latitude } = viewState
        const offset = size / 2
        const [x, y] = projection.project([longitude, latitude])

        const [minx, miny, maxx, maxy] = [
            x - offset,
            y - offset,
            x + offset,
            y + offset,
        ]

        const apiRoute = `/cog/bbox/${minx},${miny},${maxx},${maxy}/1036x1036.png`

        return createTitilerUrl(apiRoute, {
            url: item.assets.main.href,
            coord_crs: crsCode,
        })
    }, [viewState, size, item, crsCode])

    return (
        <div className="px-4 space-y-2">
            <Link
                to="/labeller"
                search={{
                    imageUrl,
                }}
                className="underline text-primary"
            >
                Label This Subset
            </Link>
        </div>
    )
}
