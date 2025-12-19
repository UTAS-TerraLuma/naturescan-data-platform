import { MapLayout } from "@/components/layouts/map-layout"
import { ViewStateDebug } from "@/components/map/view-state-debug"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/explorer")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <MapLayout header={<h1>Explorer</h1>} overlay={<ViewStateDebug />}>
            Explorer
        </MapLayout>
    )
}
