import { collectionItemQueryOptions } from "@/lib/stac-queries"
import { useDeck } from "@/stores/deck-store"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { PolygonLayer } from "@deck.gl/layers"
import { COORDINATE_SYSTEM } from "@deck.gl/core"

import { Proj4Projection } from "@math.gl/proj4"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

Proj4Projection.defineProjectionAliases({
    "EPSG:7855":
        "+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
})

const projection = new Proj4Projection({ from: "EPSG:4326", to: "EPSG:7855" })

export const Route = createFileRoute("/explorer/$collectionId/$itemId/label")({
    component: RouteComponent,
})

function RouteComponent() {
    const { collectionId, itemId } = Route.useParams()
    const { data: item } = useSuspenseQuery(
        collectionItemQueryOptions(collectionId, itemId),
    )

    const [size, setSize] = useState(50)

    const updateLayer = useDeck((s) => s.updateLayer)
    const removeLayer = useDeck((s) => s.removeLayer)

    const viewState = useDeck((s) => s.viewState)



    useEffect(() => {
        const id = "bbox"

        const { longitude, latitude } = viewState

        const d = size / 2

        const polygonLayer = new PolygonLayer({
            id,
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            coordinateOrigin: [longitude, latitude, 1],
            data: [
                {
                    polygon: [
                        [-d, -d],
                        [-d, d],
                        [d, d],
                        [d, -d],
                        [-d, -d],
                    ],
                },
            ],
            getPolygon: (d) => d.polygon,
            stroked: true,
            // In order to be pickable must be filled
            // but it can be transparent
            filled: true,
            getFillColor: [0, 0, 0, 25],
            getLineColor: [255, 0, 0],

            getLineWidth: 2,
            lineWidthUnits: "pixels",
        })

        updateLayer(polygonLayer)

        return () => {
            removeLayer(id)
        }
    }, [
        updateLayer,
        removeLayer,
        viewState.longitude,
        viewState.latitude,
        size,
    ])

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
                console.log({ lng, lat })
            },
        })

        updateLayer(polygonLayer)

        return () => {
            removeLayer(id)
        }
    }, [item, updateLayer, removeLayer])

    return (
        <div className="px-4 space-y-2">
            <Field orientation="horizontal">
                <FieldLabel htmlFor="box-size">Size</FieldLabel>
                <Input
                    id="box-size"
                    type="number"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                />
            </Field>
        </div>
    )
}
