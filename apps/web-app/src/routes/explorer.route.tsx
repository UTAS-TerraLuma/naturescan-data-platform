import { FullscreenLayout } from "@/components/layouts/fullscreen-layout"
import { DeckMap } from "@/components/map/deck-map"
import { ViewStateDebug } from "@/components/map/view-state-debug"
import { collectionsQueryOptions } from "@/lib/stac-queries"
import type { StacCollection } from "@/lib/stac-schemas"
import { useDeckLayers } from "@/stores/deck-layer-store"
import { PolygonLayer } from "@deck.gl/layers"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"
import { OverlayHeader } from "@/components/overlays/overlay-header"
import { polygonFromBounds } from "@/lib/spatial-utils"

export const Route = createFileRoute("/explorer")({
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(collectionsQueryOptions),
    component: ExplorerRouteComponent,
})

function ExplorerRouteComponent() {
    const { data } = useQuery(collectionsQueryOptions)

    // Add collections to map
    const updateLayer = useDeckLayers((s) => s.updateLayer)
    useEffect(() => {
        const collectionsLayer = new PolygonLayer<StacCollection>({
            id: "collections",
            data: data?.collections,
            getPolygon: (collection) =>
                polygonFromBounds(collection.extent.spatial.bbox[0]),

            filled: false,
            getLineColor: [255, 0, 0],
            lineWidthUnits: "pixels",
            lineWidthScale: 2,
            // pickable: true,
            // autoHighlight: true,
            // highlightColor: [255, 0, 0, 50],
        })

        updateLayer(collectionsLayer)
    }, [data])

    return (
        <FullscreenLayout>
            <DeckMap />
            <div className="absolute top-2 left-2 bg-background space-y-4 text-foreground max-w-[30vw] pt-2 pb-4 rounded-lg">
                <OverlayHeader />
                <Outlet />
            </div>
            <ViewStateDebug />
        </FullscreenLayout>
    )
}
