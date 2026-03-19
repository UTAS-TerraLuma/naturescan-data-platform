import { useDeckLayer } from "@/stores/deck-store"
import { PolygonLayer } from "@deck.gl/layers"
import type { SegmentationFeature } from "./label/-segment-result-schema"
import { useItemStore } from "./-item-store"
import { useKeyPress } from "@/hooks/useKeyPress"
import { useEffect } from "react"
import { OverlaySection } from "@/components/overlays/overlay-section"

const LAYER_ID = "results-layer"

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

    function downloadGeoJSON() {
        const collection = {
            type: "FeatureCollection",
            features,
        }
        const blob = new Blob([JSON.stringify(collection, null, 2)], {
            type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `segmentations-${itemId}.geojson`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <OverlaySection title="Segmentations" muted>
            {features.length > 0 && (
                <button
                    onClick={downloadGeoJSON}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                    Download GeoJSON ({features.length})
                </button>
            )}
        </OverlaySection>
    )
}
