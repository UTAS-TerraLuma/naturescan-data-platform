import { BitmapLayer } from "@deck.gl/layers"

import { TileLayer } from "@deck.gl/geo-layers"
import { type RgbCogDataLayer } from "@/stores/data-layer-store"
import { getRgbXyzUrl } from "./titiler"
import { COGLayer } from "@developmentseed/deck.gl-geotiff"

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

function getTitilerRgbCogLayer(config: RgbCogDataLayer) {
    const rgbXyzUrl = getRgbXyzUrl(config.cogUrl)
    return new TileLayer({
        id: config.id,
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

function getDirectRgbCogLayer(config: RgbCogDataLayer) {
    return new COGLayer({
        id: "cog-layer",
        geotiff: config.cogUrl,
    })
}
