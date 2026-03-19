import { useDeckLayer } from "@/stores/deck-store"
import { useLabelStore } from "./-label-store"
import { PolygonLayer } from "@deck.gl/layers"
import type { SegmentationFeature } from "./-segment-result-schema"
import { useEffect } from "react"

const LAYER_ID = "zzz-results-layer"

export function ResultsLayer() {
    const features = useLabelStore((s) => s.segmentationFeatures)

    useEffect(() => {
        console.log(features)
    }, [features])

    const resultsLayer = new PolygonLayer<SegmentationFeature>({
        id: LAYER_ID,
        data: features,
        getPolygon: (d) => d.geometry.coordinates,

        stroked: true,
        filled: true,

        getLineColor: [0, 0, 200],
        getFillColor: [0, 0, 200, 50],

        getLineWidth: 1,
        lineWidthUnits: "pixels",
    })

    useDeckLayer({
        [LAYER_ID]: { layer: resultsLayer, zIndex: 12 },
    })

    return null
}
