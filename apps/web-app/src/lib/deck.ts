import { BitmapLayer } from "@deck.gl/layers"
import { TileLayer } from "@deck.gl/geo-layers"

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
