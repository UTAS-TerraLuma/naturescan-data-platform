import { CogLoader } from "@/components/cog-loader"
import { MapLayout } from "@/components/layouts/map-layout"
import { DeckMap } from "@/components/map/deck-map"
import { ViewStateDebug } from "@/components/map/view-state-debug"
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
                    <CogLoader />
                    <ViewStateDebug />
                </>
            }
        >
            <DeckMap />
        </MapLayout>
    )
}
