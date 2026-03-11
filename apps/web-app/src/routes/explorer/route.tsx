import { createFileRoute, Outlet } from "@tanstack/react-router"
import { FullscreenLayout } from "@/components/layouts/fullscreen-layout"
import { DeckMap } from "@/components/map/deck-map"
import { nsItemsQuery } from "./-stac-queries"
import { OverlayHeader } from "@/components/overlays/overlay-header"
import { BreadCrumbs } from "./-breadcrumbs"
import { ViewStateDebug } from "@/components/map/view-state-debug"

export const Route = createFileRoute("/explorer")({
    loader: ({ context }) => {
        context.queryClient.prefetchQuery(nsItemsQuery)
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <FullscreenLayout>
            <DeckMap />
            <div className="absolute top-0 left-0 w-1/3 p-2">
                <div className="bg-background p-2 space-y-2">
                    <OverlayHeader />
                    <BreadCrumbs />
                    <Outlet />
                </div>
            </div>
            <div className="absolute bottom-0 left-0">
                <ViewStateDebug />
            </div>
        </FullscreenLayout>
    )
}
