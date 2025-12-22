import { CogLoader } from "@/components/cog-loader"
import { MapLayout } from "@/components/layouts/map-layout"
import { DeckMap } from "@/components/map/deck-map"
import { ViewStateDebug } from "@/components/map/view-state-debug"
import { DataLayerOverlay } from "@/components/overlays/data-layer"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/labeller")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <MapLayout
            header={<h1>Labeller</h1>}
            overlay={
                <>
                    <div className="absolute top-2 left-2 w-xs space-y-2">
                        <CogLoader />
                        <DataLayerOverlay />
                    </div>
                    <ViewStateDebug />
                </>
            }
        >
            <DeckMap />
        </MapLayout>
    )
}
