import { BitmapLayer } from "@deck.gl/layers"
import { type Layer } from "@deck.gl/core"
import { TileLayer } from "@deck.gl/geo-layers"
import {
    useDataLayerStore,
    type RgbCogDataLayer,
} from "@/stores/data-layer-store"
import { getRgbXyzUrl } from "./titiler"

export function getXyzTileLayer(xyzUrl: string | null, id?: string) {
    if (!xyzUrl) return null

    return new TileLayer({
        id: id ?? xyzUrl,
        data: xyzUrl,
        minZoom: 18,

        renderSubLayers: (props) => {
            const { boundingBox } = props.tile

            return new BitmapLayer({
                ...props,
                id: props.id,
                data: undefined,
                image: props.data,
                bounds: [
                    boundingBox[0][0],
                    boundingBox[0][1],
                    boundingBox[1][0],
                    boundingBox[1][1],
                ],
            })
        },
    })
}

function getRgbCogLayer(config: RgbCogDataLayer) {
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
}

export function useLayers(): (Layer | null)[] {
    const dataLayers = useDataLayerStore((s) => s.dataLayers)

    return dataLayers.map((d) => {
        let layer = null

        if (d.type == "rgb-cog") {
            layer = getRgbCogLayer(d)
        }

        return layer
    })
}
