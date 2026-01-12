import { useMapViewState } from "@/stores/map-view-state-store"
import { DeckGL } from "@deck.gl/react"
import { Map } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

import { useEffect } from "react"

export function ExplorerMap() {
    const viewState = useMapViewState((s) => s.viewState)
    const updateViewState = useMapViewState((s) => s.updateViewState)

    useEffect(() => {
        async function fetchData() {
            const response = await fetch("http://localhost:8002/")
            const json = await response.json()

            console.log(json)
        }
        fetchData()
    }, [])

    return (
        <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState }) => updateViewState(viewState)}
            controller
        >
            <Map mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" />
        </DeckGL>
    )
}
