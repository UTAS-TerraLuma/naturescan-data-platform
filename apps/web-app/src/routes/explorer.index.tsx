import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getCombinedBounds } from "@/lib/spatial-utils"
import { collectionsQueryOptions } from "@/lib/stac-queries"
import { useMapViewState } from "@/stores/map-view-state-store"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/explorer/")({
    component: RouteComponent,
})

function RouteComponent() {
    const {
        data: { collections },
    } = useSuspenseQuery(collectionsQueryOptions)

    // Fit map to the bounds of all collections
    const fitBounds = useMapViewState((s) => s.fitBounds)

    useEffect(() => {
        const bounds = getCombinedBounds(
            collections.map((c) => c.extent.spatial.bbox[0]),
        )

        fitBounds(bounds)
    }, [collections])

    return (
        <div className="space-y-4 px-4">
            {collections.map((collection) => (
                <Card key={collection.id}>
                    <CardHeader>
                        <CardTitle>
                            <Link
                                to="/explorer/$collectionId"
                                params={{ collectionId: collection.id }}
                                className="hover:underline hover:text-primary"
                            >
                                {collection.title}
                            </Link>
                        </CardTitle>
                        <CardDescription>
                            {collection.description}
                        </CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
    )
}
