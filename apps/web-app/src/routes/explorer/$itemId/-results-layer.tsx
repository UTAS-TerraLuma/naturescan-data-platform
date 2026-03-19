import { useDeckLayer } from "@/stores/deck-store"
import { PolygonLayer } from "@deck.gl/layers"
import type { SegmentationFeature } from "./label/-segment-result-schema"
import { useItemStore } from "./-item-store"
import { useKeyPress } from "@/hooks/useKeyPress"
import { useEffect } from "react"

const LAYER_ID = "zzz-results-layer"

export function ResultsLayer() {
    const itemId = useItemStore((s) => s.itemId)
    const allFeatures = useItemStore((s) => s.segmentationFeatures)

    const selectedSegment = useItemStore((s) => s.selectedSegmentation)
    const setSelectedSegment = useItemStore((s) => s.setSelectedSegmentation)
    const deleteSegmentationFeature = useItemStore(
        (s) => s.deleteSegmentationFeature,
    )

    const features = allFeatures[itemId] ?? []

    useEffect(() => {
        console.log(selectedSegment)
    }, [selectedSegment])

    const resultsLayer = new PolygonLayer<SegmentationFeature>({
        id: LAYER_ID,
        data: features,
        getPolygon: (d) => d.geometry.coordinates,

        stroked: true,
        filled: true,

        getLineColor: [0, 0, 200],
        getFillColor: (d) =>
            d.properties.id == selectedSegment
                ? [0, 150, 200, 150]
                : [0, 0, 200, 50],

        getLineWidth: (d) => (d.properties.id == selectedSegment ? 2 : 1),
        lineWidthUnits: "pixels",

        pickable: true,
        onClick: (info) => {
            if (!info.object) return

            console.log(info.object)

            setSelectedSegment(
                (info.object as SegmentationFeature).properties.id,
            )
        },

        updateTriggers: {
            getFillColor: selectedSegment,
        },
    })

    useDeckLayer({
        [LAYER_ID]: { layer: resultsLayer, zIndex: 21 },
    })

    useKeyPress("Delete", () => {
        if (selectedSegment) {
            deleteSegmentationFeature(itemId, selectedSegment)
        }
    })

    useKeyPress("Escape", () => {
        setSelectedSegment(null)
    })

    return null
}
