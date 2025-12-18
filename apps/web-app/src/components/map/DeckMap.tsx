import { useMapViewState } from "@/stores/mapViewStateStore"
import { DeckGL } from "@deck.gl/react"
import Map from "react-map-gl"

export function DeckMap() {
    const viewState = useMapViewState((s) => s.viewState)
    const updateViewState = useMapViewState((s) => s.updateViewState)

    return (
        <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState }) => updateViewState(viewState)}
            controller
        >
            <Map></Map>
        </DeckGL>
    )
}
