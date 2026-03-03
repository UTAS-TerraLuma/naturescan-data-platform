import { collectionItemQueryOptions } from "@/lib/stac-queries"
import { useDeck } from "@/stores/deck-store"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { PolygonLayer } from "@deck.gl/layers"
import { WebMercatorViewport } from "@deck.gl/core"
import { createTitilerUrl } from "@/lib/titiler"

export const Route = createFileRoute("/explorer/$collectionId/$itemId/label")({
    component: RouteComponent,
})

const BOX_SCALE = 1

type Box = {
    xmin: number
    ymin: number
    xmax: number
    ymax: number
}

function RouteComponent() {
    const { collectionId, itemId } = Route.useParams()
    const { data: item } = useSuspenseQuery(
        collectionItemQueryOptions(collectionId, itemId),
    )

    const deck = useDeck((s) => s.deck)
    const deckIsLoaded = useDeck((s) => s.isLoaded)
    const updateLayer = useDeck((s) => s.updateLayer)
    const viewState = useDeck((s) => s.viewState)

    const [wgs84box, setWgs84box] = useState<Box | null>(null)
    // const [altbox, setAltbox] = useState<Box | null>(null)

    const imageUrl = wgs84box
        ? createTitilerUrl(
              `/cog/bbox/${wgs84box.xmin},${wgs84box.ymin},${wgs84box.xmax},${wgs84box.ymax}/1036x1036.png`,
              {
                  url: item.assets.main.href,
              },
          )
        : null

    useEffect(() => {
        if (!deck || !deckIsLoaded) return

        // Get bounds of viewport in longitude and latitude
        const viewport = deck.getViewports()[0] as WebMercatorViewport

        const { width, height } = viewport
        const size = Math.min(width, height) * BOX_SCALE

        const xOffset = 0.5 * (width - size)
        const yOffset = 0.5 * (height - size)

        const [xmin, ymin] = viewport.unproject([xOffset, yOffset + size])
        const [xmax, ymax] = viewport.unproject([xOffset + size, yOffset])

        setWgs84box({ xmin, ymin, xmax, ymax })
    }, [viewState, deck, deckIsLoaded])

    // useEffect(() => {
    //     if (!wgs84box) return
    //     const viewport = new WebMercatorViewport({
    //         width: 1036,
    //         height: 1036,
    //     }).fitBounds(
    //         [
    //             [wgs84box.xmin, wgs84box.ymin],
    //             [wgs84box.xmax, wgs84box.ymax],
    //         ],
    //         { padding: 0, maxZoom: 26 },
    //     )

    //     const [xmin, ymin] = viewport.unproject([0, 0])
    //     const [xmax, ymax] = viewport.unproject([1036, 1036])

    //     setAltbox({ xmin, ymin, xmax, ymax })
    // }, [wgs84box])

    useEffect(() => {
        const layer = new PolygonLayer<Box>({
            id: "wgs-84-box",
            data: wgs84box ? [wgs84box] : [],
            getPolygon: ({ xmin, ymin, xmax, ymax }) => [
                [xmin, ymin],
                [xmin, ymax],
                [xmax, ymax],
                [xmax, ymin],
                [xmin, ymin],
            ],

            stroked: true,
            // In order to be pickable must be filled
            // but it can be transparent
            filled: true,
            getFillColor: [0, 0, 0, 25],
            getLineColor: [255, 255, 0],

            getLineWidth: 2,
            lineWidthUnits: "pixels",
        })

        return updateLayer(layer)
    }, [wgs84box, updateLayer])

    // useEffect(() => {
    //     const layer = new PolygonLayer<Box>({
    //         id: "alt-box",
    //         data: altbox ? [altbox] : [],
    //         getPolygon: ({ xmin, ymin, xmax, ymax }) => [
    //             [xmin, ymin],
    //             [xmin, ymax],
    //             [xmax, ymax],
    //             [xmax, ymin],
    //             [xmin, ymin],
    //         ],

    //         stroked: true,
    //         // In order to be pickable must be filled
    //         // but it can be transparent
    //         filled: true,
    //         getFillColor: [0, 255, 0, 25],
    //         getLineColor: [255, 0, 0],

    //         getLineWidth: 2,
    //         lineWidthUnits: "pixels",
    //     })

    //     return updateLayer(layer)
    // }, [altbox, updateLayer])

    return (
        <div className="px-4 space-y-2">
            {imageUrl && (
                <Link
                    to="/labeller"
                    search={{
                        imageUrl,
                    }}
                    className="underline text-primary"
                >
                    Label This Subset
                </Link>
            )}
        </div>
    )
}
