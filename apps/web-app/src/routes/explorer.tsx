import { MapLayout } from "@/components/layouts/map-layout"
import { ExplorerMap } from "@/components/map/explorer-map"
import { ViewStateDebug } from "@/components/map/view-state-debug"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/explorer")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <MapLayout
            header={<h1>Explorer</h1>}
            overlay={
                <>
                    <div className="absolute top-2 left-2 w-xs space-y-2"></div>
                    <ViewStateDebug />
                </>
            }
        >
            <ExplorerMap />
        </MapLayout>
    )
}
