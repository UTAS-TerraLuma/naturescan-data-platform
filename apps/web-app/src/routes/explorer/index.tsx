import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { nsItemsQuery } from "./-stac-queries"
import { fitBounds, useDeck, useDeckLayer } from "@/stores/deck-store"

import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import type { StacItem } from "./-stac-schema"
import { getCombinedBounds } from "@/lib/spatial-utils"
import { useEffect } from "react"
import { ItemCard } from "./-item-card"

export const Route = createFileRoute("/explorer/")({
    component: RouteComponent,
})

const ITEMS_SCATTER_ID = "items-scatter"
const ITEMS_POLYGON_ID = "items-polygon"

function RouteComponent() {
    const {
        data: { features: items },
    } = useSuspenseQuery(nsItemsQuery)

    const navigate = useNavigate()
    const { zoom } = useDeck((s) => s.viewState)
    const isDeckReady = useDeck((s) => s.isLoaded)

    useEffect(() => {
        if (isDeckReady) {
            fitBounds(getCombinedBounds(items.map((i) => i.bbox)))
        }
    }, [items, isDeckReady])

    useDeckLayer({
        [ITEMS_SCATTER_ID]: new ScatterplotLayer<StacItem>({
            id: ITEMS_SCATTER_ID,
            data: items,
            getPosition: ({ bbox }) => [
                (bbox[0] + bbox[2]) / 2,
                (bbox[1] + bbox[3]) / 2,
            ],
            getRadius: 10,
            getFillColor: [255, 0, 0],
            radiusUnits: "pixels",

            pickable: true,
            onClick: (info) => {
                if (!info.object) return

                const item: StacItem = info.object

                navigate({
                    to: "/explorer/$itemId",
                    params: { itemId: item.id },
                })
            },

            visible: zoom < 12.5,
        }),
        [ITEMS_POLYGON_ID]: new PolygonLayer<StacItem>({
            id: "items-polygons",
            data: items,
            getPolygon: (d) => d.geometry.coordinates,
            filled: true,
            getFillColor: [255, 0, 0, 100],
            stroked: true,
            getLineColor: [255, 0, 0],

            pickable: true,
            onClick: (info) => {
                if (!info.object) return

                const item: StacItem = info.object

                navigate({
                    to: "/explorer/$itemId",
                    params: { itemId: item.id },
                })
            },

            visible: zoom >= 12.5,
        }),
    })

    return (
        // TODO - Give a max height and make a scroll area
        <div className="space-y-2">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    )
}
