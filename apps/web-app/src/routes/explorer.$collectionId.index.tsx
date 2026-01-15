import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import {
    collectionItemsQueryOptions,
    collectionQueryOptions,
} from "@/lib/stac-queries"
import { useMapViewState } from "@/stores/map-view-state-store"

import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/explorer/$collectionId/")({
    component: RouteComponent,
})

function RouteComponent() {
    const { collectionId } = Route.useParams()

    const { data: collection } = useSuspenseQuery(
        collectionQueryOptions(collectionId),
    )

    const {
        data: { features },
    } = useSuspenseQuery(collectionItemsQueryOptions(collectionId))

    const fitBounds = useMapViewState((s) => s.fitBounds)

    useEffect(() => {
        fitBounds(collection.extent.spatial.bbox[0])
    }, [collection])

    return (
        <div className="space-y-4 max-h-[50vh] px-4 py-1 overflow-auto">
            {features.map((item) => (
                <Card key={item.id}>
                    <CardHeader>
                        <CardTitle>
                            <Link
                                to="/explorer/$collectionId/$itemId"
                                params={{
                                    collectionId: collectionId,
                                    itemId: item.id,
                                }}
                                className="hover:underline hover:text-primary"
                            >
                                {item.properties.title}
                            </Link>
                        </CardTitle>
                        <CardDescription>
                            {item.properties.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <img
                            // className="h-32 w-auto"
                            src={item.assets.thumbnail.href}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
