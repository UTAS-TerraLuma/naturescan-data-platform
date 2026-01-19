import { collectionItemQueryOptions } from "@/lib/stac-queries"
import { useDeckLayers } from "@/stores/deck-layer-store"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import { GeoJsonLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import { Button } from "@/components/ui/button"
import { predictSegment } from "@/lib/segment"

export const Route = createFileRoute("/explorer/$collectionId/$itemId/label")({
    component: RouteComponent,
})

function RouteComponent() {
    const { collectionId, itemId } = Route.useParams()
    const { data: item } = useSuspenseQuery(
        collectionItemQueryOptions(collectionId, itemId),
    )

    const updateLayer = useDeckLayers((s) => s.updateLayer)
    const removeLayer = useDeckLayers((s) => s.removeLayer)

    const [predictPoint, setPredictPoint] = useState<[number, number] | null>(
        null,
    )

    const [segments, setSegments] = useState<any[]>([])

    const updateSegments = useCallback(
        (segment: any) => setSegments((s) => [...s, segment]),
        [setSegments],
    )

    useEffect(() => {
        const id = "predict-point"

        console.log(predictPoint)

        const layer = new ScatterplotLayer({
            id,
            data: [{ point: predictPoint }],
            getPosition: (d) => d.point,
            radiusUnits: "pixels",
            getRadius: 6,
            getColor: [255, 0, 0],
        })

        updateLayer(layer)

        return () => {
            removeLayer(id)
        }
    }, [predictPoint, updateLayer, removeLayer])

    useEffect(() => {
        const id = "clickable-area"

        const polygonLayer = new PolygonLayer({
            id,
            data: [
                {
                    polygon: item.geometry.coordinates,
                },
            ],
            getPolygon: (d) => d.polygon,

            stroked: false,
            // In order to be pickable must be filled
            // but it can be transparent
            filled: true,
            getFillColor: [255, 0, 0, 0],

            pickable: true,
            onClick: (info) => {
                if (!info.coordinate) return

                const [lng, lat] = info.coordinate
                setPredictPoint([lng, lat])
            },
        })

        updateLayer(polygonLayer)

        return () => {
            removeLayer(id)
        }
    }, [item, updateLayer, removeLayer])

    useEffect(() => {
        const id = "segments"

        const layer = new GeoJsonLayer({
            id,
            data: segments,
            stroked: true,
            filled: true,
            getFillColor: [255, 0, 0, 128],
            getLineColor: [255, 0, 0, 255],
            lineWidthUnits: "pixels",
            getLineWidth: 2,
        })

        updateLayer(layer)

        return () => {
            removeLayer(id)
        }
    }, [segments, updateLayer, removeLayer])

    useEffect(() => {
        const id = "segment-points"

        const layer = new ScatterplotLayer({
            id,
            data: segments,
            getPosition: (d) => d.properties.prompt_points[0],
            radiusUnits: "pixels",
            getRadius: 5,
            getFillColor: [0, 0, 0],
        })

        updateLayer(layer)

        return () => {
            removeLayer(id)
        }
    }, [segments, updateLayer, removeLayer])

    return (
        <div className="px-4 space-y-2">
            <p>Click on the map to add a point</p>
            {predictPoint && (
                <Button
                    onClick={async () => {
                        const segment = await predictSegment(
                            predictPoint,
                            item.assets.main.href,
                        )
                        updateSegments(segment)
                        setPredictPoint(null)
                    }}
                >
                    Predict
                </Button>
            )}
        </div>
    )
}
