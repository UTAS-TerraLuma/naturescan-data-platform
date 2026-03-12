import {
    createFileRoute,
    Link,
    Outlet,
    useMatchRoute,
} from "@tanstack/react-router"
import { nsItemByIdQuery } from "../-stac-queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { fitBounds, useDeck } from "@/stores/deck-store"
import { useEffect } from "react"
import { Assets } from "./-assets"
import { ItemSummary } from "./-item-summary"
import { ItemProvider } from "./-item-provider"

export const Route = createFileRoute("/explorer/$itemId")({
    loader: ({ context, params: { itemId } }) =>
        context.queryClient.ensureQueryData(nsItemByIdQuery(itemId)),

    component: RouteComponent,
})

function RouteComponent() {
    const { itemId } = Route.useParams()

    const { data: item } = useSuspenseQuery(nsItemByIdQuery(itemId))

    const isDeckReady = useDeck((s) => s.isLoaded)
    useEffect(() => {
        if (isDeckReady) {
            fitBounds(item.bbox)
        }
    }, [item, isDeckReady])

    const matchRoute = useMatchRoute()
    const isExactMatch = matchRoute({ to: "/explorer/$itemId", fuzzy: false })

    return (
        <ItemProvider item={item}>
            <ItemSummary />
            <Assets />
            {isExactMatch && (
                <Link
                    to="/explorer/$itemId/label"
                    params={{ itemId }}
                    className="underline text-primary"
                >
                    Add Labels
                </Link>
            )}
            <Outlet />
        </ItemProvider>
    )
}
