import { useMapViewState } from "@/stores/map-view-state-store"
import { DeckGL } from "@deck.gl/react"
import { Map } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { useDeckLayers } from "@/stores/deck-layer-store"

export function DeckMap() {
    const viewState = useMapViewState((s) => s.viewState)
    const updateViewState = useMapViewState((s) => s.updateViewState)

    const layers = useDeckLayers((s) => s.layers)

    return (
        <div onContextMenu={(e) => e.preventDefault()}>
            <DeckGL
                viewState={viewState}
                onViewStateChange={({ viewState }) =>
                    updateViewState(viewState)
                }
                controller
                layers={layers}
            >
                <Map mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" />
            </DeckGL>
        </div>
    )
}
