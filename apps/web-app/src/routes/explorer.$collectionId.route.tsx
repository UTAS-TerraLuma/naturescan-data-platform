import { collectionItemsQueryOptions } from "@/lib/stac-queries"
import type { StacItem } from "@/lib/stac-schemas"
import { useDeckLayers } from "@/stores/deck-layer-store"
import { PolygonLayer } from "@deck.gl/layers"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/explorer/$collectionId")({
    loader: ({ context: { queryClient }, params: { collectionId } }) =>
        queryClient.ensureQueryData(collectionItemsQueryOptions(collectionId)),
    component: RouteComponent,
})

function RouteComponent() {
    const { collectionId } = Route.useParams()
    const { data } = useSuspenseQuery(collectionItemsQueryOptions(collectionId))

    const updateLayer = useDeckLayers((s) => s.updateLayer)

    useEffect(() => {
        const itemsLayer = new PolygonLayer<StacItem>({
            id: "items",
            data: data?.features || [],
            getPolygon: (item) => item.geometry.coordinates[0],

            filled: false,
            getLineColor: [0, 0, 255],
            lineWidthUnits: "pixels",
            lineWidthScale: 2,
        })

        updateLayer(itemsLayer)
    }, [data])

    return <Outlet />
}
