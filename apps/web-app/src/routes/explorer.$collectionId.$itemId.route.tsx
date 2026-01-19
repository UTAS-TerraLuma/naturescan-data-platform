import { RGBCog } from "@/components/deck/RGBCog"
import { MSCog } from "@/components/deck/MSCog"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { collectionItemQueryOptions } from "@/lib/stac-queries"
import { useMapViewState } from "@/stores/map-view-state-store"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/explorer/$collectionId/$itemId")({
    loader: ({ context: { queryClient }, params: { collectionId, itemId } }) =>
        queryClient.ensureQueryData(
            collectionItemQueryOptions(collectionId, itemId),
        ),

    component: RouteComponent,
})

function RouteComponent() {
    const { collectionId, itemId } = Route.useParams()

    const { data: item } = useSuspenseQuery(
        collectionItemQueryOptions(collectionId, itemId),
    )

    const fitBounds = useMapViewState((s) => s.fitBounds)

    useEffect(() => {
        fitBounds(item.bbox)
    }, [item])

    return (
        <>
            <div className="px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{item.properties.title}</CardTitle>
                        <CardDescription>
                            {item.properties.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {item.properties["naturescan:data_product"] ==
                            "rgb" && <RGBCog item={item} />}
                        {item.properties["naturescan:data_product"] == "ms" && (
                            <MSCog item={item} />
                        )}
                    </CardContent>

                    <CardContent className="max-h-[20vw] overflow-auto">
                        <Link
                            to="/explorer/$collectionId/$itemId/label"
                            params={{ collectionId, itemId }}
                            className="underline text-primary"
                        >
                            Label this image
                        </Link>
                    </CardContent>
                </Card>
            </div>
            <Outlet></Outlet>
        </>
    )
}
