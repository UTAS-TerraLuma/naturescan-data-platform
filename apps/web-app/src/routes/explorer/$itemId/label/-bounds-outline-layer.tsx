import { polygonFromBounds, type Bounds } from "@/lib/spatial-utils"
import { useDeckLayer } from "@/stores/deck-store"
import { PolygonLayer } from "@deck.gl/layers"
import { useLabelStore } from "./-label-store"

const LAYER_ID = "preview-bounds-layer"

export function useBoundsOutlineLayer() {
    const bounds = useLabelStore((s) => s.bounds)

    useDeckLayer({
        [LAYER_ID]: new PolygonLayer<Bounds>({
            id: LAYER_ID,
            data: [bounds],
            getPolygon: (d) => polygonFromBounds(d),
            stroked: true,
            filled: false,

            getLineColor: [0, 0, 0, 100],
            getLineWidth: 1,
            lineWidthUnits: "pixels",
        }),
    })
}
