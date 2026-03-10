import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { nsItemsQuery } from "./-stac-queries"
import { fitBounds, useDeck, useDeckLayer } from "@/stores/deck-store"

import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import type { StacItem } from "./-stac-schema"
import { getCombinedBounds } from "@/lib/spatial-utils"
import { useEffect } from "react"
import { ItemCard } from "@/components/overlays/item-card"

export const Route = createFileRoute("/explorer/")({
    component: RouteComponent,
})

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

    useDeckLayer(
        new ScatterplotLayer<StacItem>({
            id: "items-scatter",
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
    )

    useDeckLayer(
        new PolygonLayer<StacItem>({
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
    )

    return (
        // TODO - Give a max height and make a scroll area
        <div className="space-y-2">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    )
}
