import { createFileRoute, Outlet } from "@tanstack/react-router"
import { FullscreenLayout } from "@/components/layouts/fullscreen-layout"
import { DeckMap } from "@/components/map/deck-map"
import { nsItemsQuery } from "./-stac-queries"

export const Route = createFileRoute("/stacv3")({
    loader: ({ context }) => {
        context.queryClient.prefetchQuery(nsItemsQuery)
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <FullscreenLayout>
            <DeckMap />
            <div className="absolute top-4 left-4 p-4 bg-background">
                <Outlet />
            </div>
        </FullscreenLayout>
    )
}
