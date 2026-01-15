import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { collectionItemQueryOptions } from "@/lib/stac-queries"
import { getTilesUrl } from "@/lib/titiler"
import { useDeckLayers } from "@/stores/deck-layer-store"
import { useMapViewState } from "@/stores/map-view-state-store"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
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

    const updateLayer = useDeckLayers((s) => s.updateLayer)
    const removeLayer = useDeckLayers((s) => s.removeLayer)

    useEffect(() => {
        const id = item.id

        if (item.properties["naturescan:data_product"] == "rgb") {
            const xyzUrl = getTilesUrl(item.assets.main.href)

            const itemLayer = new TileLayer({
                id,
                extent: item.bbox,
                data: xyzUrl,
                minZoom: 18,
                renderSubLayers: (props) => {
                    const { boundingBox } = props.tile

                    return new BitmapLayer(props, {
                        data: undefined,
                        image: props.data,
                        bounds: [
                            boundingBox[0][0],
                            boundingBox[0][1],
                            boundingBox[1][0],
                            boundingBox[1][1],
                        ],
                        textureParameters: {
                            minFilter: "nearest",
                            magFilter: "nearest",
                        },
                    })
                },
            })

            updateLayer(itemLayer)
        } else if (item.properties["naturescan:data_product"] == "ms") {
            const bands = item.assets.main.bands
            const [b1, b2, _, b4] = bands

            const xyzUrl = getTilesUrl(item.assets.main.href, {
                bidx: [4, 2, 1],
                rescale: [
                    `${b4.statistics.mean - 2 * b4.statistics.stddev},${b4.statistics.mean + 2 * b4.statistics.stddev}`,
                    `${b2.statistics.mean - 2 * b2.statistics.stddev},${b2.statistics.mean + 2 * b2.statistics.stddev}`,
                    `${b1.statistics.mean - 2 * b1.statistics.stddev},${b1.statistics.mean + 2 * b1.statistics.stddev}`,
                ],
            })

            const itemLayer = new TileLayer({
                id,
                extent: item.bbox,
                data: xyzUrl,
                minZoom: 18,
                renderSubLayers: (props) => {
                    const { boundingBox } = props.tile

                    return new BitmapLayer(props, {
                        data: undefined,
                        image: props.data,
                        bounds: [
                            boundingBox[0][0],
                            boundingBox[0][1],
                            boundingBox[1][0],
                            boundingBox[1][1],
                        ],
                        textureParameters: {
                            minFilter: "nearest",
                            magFilter: "nearest",
                        },
                    })
                },
            })

            updateLayer(itemLayer)
        } else {
            console.error("Unsupported product")
        }

        // const itemLayer = new

        return () => removeLayer(id)
    }, [item])

    return (
        <div className="px-4">
            <Card>
                <img src={item.assets.thumbnail.href} />
                <CardHeader>
                    <CardTitle>{item.properties.title}</CardTitle>
                    <CardDescription>
                        {item.properties.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[20vw] overflow-auto">
                    <pre>{JSON.stringify(item, null, 2)}</pre>
                </CardContent>
            </Card>
        </div>
    )
}
