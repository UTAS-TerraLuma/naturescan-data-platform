import { collectionItemQueryOptions } from "@/lib/stac-queries"
import { useDeckLayers } from "@/stores/deck-layer-store"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import { GeoJsonLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import { Button } from "@/components/ui/button"
import { predictSegment } from "@/lib/segment"
import type { Point2D } from "@/types/spatial"
import { useMapViewState } from "@/stores/map-view-state-store"
import { WebMercatorViewport } from "@deck.gl/core"
import { createTitilerUrl } from "@/lib/titiler"

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

    const [predictPoint, setPredictPoint] = useState<Point2D | null>(null)

    const [segments, setSegments] = useState<any[]>([])

    const updateSegments = useCallback(
        (segment: any) => setSegments((s) => [...s, segment]),
        [setSegments],
    )

    useEffect(() => {
        const id = "predict-point"

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

    // async function onPredict(point: Point2D) {
    //     const segment = await predictSegment(point, item.assets.main.href)
    //     updateSegments(segment)
    //     setPredictPoint(null)
    // }

    async function onPredict(pointLngLat: Point2D) {
        const { viewState, canvasSize } = useMapViewState.getState()
        const { width, height } = canvasSize

        // TODO - Force pitch to be 0 ?
        const { latitude, longitude, zoom, pitch, bearing } = viewState
        const predictionViewport = new WebMercatorViewport({
            longitude,
            latitude,
            zoom,
            width,
            height,
            pitch,
            bearing,
        })

        const [minLng, maxLat] = predictionViewport.unproject([0, 0])
        const [maxLng, minLat] = predictionViewport.unproject([width, height])

        const imageUrl = createTitilerUrl(
            `/cog/bbox/${minLng},${minLat},${maxLng},${maxLat}/${width}x${height}.png`,
            {
                url: item.assets.main.href,
            },
        )

        const pointXY = predictionViewport.project(pointLngLat) as Point2D

        const { polygons: polygonsXY } = await predictSegment(pointXY, imageUrl)

        if (polygonsXY.length == 0) {
            console.warn("No predictions found")
            return
        }

        const polygonsLngLat = polygonsXY.map((polygonXY) =>
            polygonXY.map((ringXY) =>
                ringXY.map(
                    (pointXY) =>
                        predictionViewport.unproject(pointXY) as [
                            number,
                            number,
                        ],
                ),
            ),
        )

        const properties = { imageUrl: imageUrl, point: pointLngLat }

        const feature = {
            type: "Feature",
            properties,
            geometry: {
                type: "MultiPolygon",
                coordinates: polygonsLngLat,
            },
        }

        console.log(feature)

        updateSegments(feature)
        setPredictPoint(null)
    }

    return (
        <div className="px-4 space-y-2">
            <p>Click on the map to add a point</p>
            {predictPoint && (
                <Button onClick={() => onPredict(predictPoint)}>Predict</Button>
            )}
        </div>
    )
}
