import { useMapViewState } from "@/stores/map-view-state-store"
import { DeckGL } from "@deck.gl/react"
import { Map } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

export function ExplorerMap() {
    const viewState = useMapViewState((s) => s.viewState)
    const updateViewState = useMapViewState((s) => s.updateViewState)

    return (
        <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState }) => updateViewState(viewState)}
            // layers={[collectionsLayer, msItemsLayer, rgbItemsLayer]}
            controller
        >
            <Map mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" />
        </DeckGL>
    )
}
