import { useMapViewState } from "@/stores/map-view-state-store"
import { DeckGL } from "@deck.gl/react"
import { Map } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { useDataLayerStore } from "@/stores/data-layer-store"
import { getRgbXyzUrl } from "@/lib/titiler"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers"

export function DeckMap() {
    const viewState = useMapViewState((s) => s.viewState)
    const updateViewState = useMapViewState((s) => s.updateViewState)
    const dataLayers = useDataLayerStore((s) => s.dataLayers)

    const layers = dataLayers.map((config) => {
        if (config.type == "rgb-cog") {
            const rgbXyzUrl = getRgbXyzUrl(config.cogUrl)
            return new TileLayer({
                id: config.id,
                minZoom: 18,
                extent: config.bounds,
                data: rgbXyzUrl,

                renderSubLayers: (props) => {
                    const { boundingBox } = props.tile

                    return new BitmapLayer(props, {
                        data: undefined,
                        image: props.data,
                        bounds: [
                            boundingBox[0][0],
                            boundingBox[0][1],
                            boundingBox[1][0],
                            boundingBox[1][1],
                        ],
                        textureParameters: {
                            minFilter: "nearest",
                            magFilter: "nearest",
                        },
                    })
                },
            })
        } else {
            return null
        }
    })

    return (
        <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState }) => updateViewState(viewState)}
            controller
            layers={layers}
        >
            <Map mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" />
        </DeckGL>
    )
}
