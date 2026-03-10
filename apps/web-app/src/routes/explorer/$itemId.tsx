import { createFileRoute } from "@tanstack/react-router"
import { nsItemByIdQuery } from "./-stac-queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { fitBounds, useDeck, useDeckLayer } from "@/stores/deck-store"
import { useEffect, useMemo, useState } from "react"
import { BitmapLayer, PolygonLayer } from "@deck.gl/layers"
import type { StacItem } from "./-stac-schema"
import { getTilesUrl } from "@/lib/titiler"
import { TileLayer } from "@deck.gl/geo-layers"
import { Eye, EyeClosed } from "lucide-react"

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

    const [mode, setMode] = useState<"rgb" | "ms">("rgb")

    const rgbUrl = getTilesUrl(item.assets.rgb.href)
    const msUrl = useMemo(() => {
        const { href, bands } = item.assets.ms

        const c1 = bands[4 - 1]
        const c2 = bands[2 - 1]
        const c3 = bands[1 - 1]

        return getTilesUrl(href, {
            bidx: [4, 2, 1],
            rescale: [
                `${c1.statistics.mean - 2 * c1.statistics.stddev},${c1.statistics.mean + 2 * c1.statistics.stddev}`,
                `${c2.statistics.mean - 2 * c2.statistics.stddev},${c2.statistics.mean + 2 * c2.statistics.stddev}`,
                `${c3.statistics.mean - 2 * c3.statistics.stddev},${c3.statistics.mean + 2 * c3.statistics.stddev}`,
            ],
        })
    }, [item])

    useDeckLayer(
        new TileLayer({
            id: `${item.id}-rgb`,
            visible: mode == "rgb",
            extent: item.bbox,
            data: rgbUrl,
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
        }),
    )

    useDeckLayer(
        new TileLayer({
            id: `${item.id}-ms`,
            visible: mode == "ms",
            extent: item.bbox,
            data: msUrl,
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
        }),
    )

    useDeckLayer(
        new PolygonLayer<StacItem>({
            id: `${item.id}-outline`,
            data: [item],
            getPolygon: (d) => d.geometry.coordinates,
            filled: false,

            stroked: true,
            getLineColor: [0, 0, 0],
            getLineWidth: 1,
            lineWidthUnits: "pixels",
        }),
    )

    return (
        <>
            <div className="p-3">
                <img
                    className="h-48 w-full object-contain"
                    src={item.assets.thumbnail.href}
                />
                <p className="text-foreground/75 pt-2">
                    {item.properties.description}
                </p>
            </div>
            <div>
                <div className="bg-muted p-2 space-y-2">
                    <h2 className="text-sm pl-2 font-medium text-foreground/75">
                        Assets
                    </h2>
                    <div className="bg-white rounded-sm ring ring-foreground/10 p-3 relative">
                        <button
                            className="absolute inset-0"
                            onClick={() => setMode("rgb")}
                        ></button>
                        <div className="flex justify-between">
                            <h3>RGB Orthomosaic</h3>
                            {mode == "rgb" ? (
                                <Eye />
                            ) : (
                                <EyeClosed className="text-foreground/50" />
                            )}
                        </div>
                    </div>
                    <div className="bg-white rounded-sm ring ring-foreground/10 p-3 relative">
                        <button
                            className="absolute inset-0"
                            onClick={() => setMode("ms")}
                        ></button>
                        <div className="flex justify-between">
                            <h3>Multispectral Orthomosaic</h3>
                            {mode == "ms" ? (
                                <Eye />
                            ) : (
                                <EyeClosed className="text-foreground/50" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
