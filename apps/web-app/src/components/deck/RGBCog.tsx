import type { StacItem } from "@/lib/stac-schemas"
import { getTilesUrl } from "@/lib/titiler"
import { useDeck } from "@/stores/deck-store"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers"
import { useEffect } from "react"

export function RGBCog({ item }: { item: StacItem }) {
    const updateLayer = useDeck((s) => s.updateLayer)
    const removeLayer = useDeck((s) => s.removeLayer)

    useEffect(() => {
        const id = item.id

        const xyzUrl = getTilesUrl(item.assets.main.href)

        const itemLayer = new TileLayer({
            id,
            extent: item.bbox,
            data: xyzUrl,
            minZoom: 18,
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

        updateLayer(itemLayer)

        return () => removeLayer(id)
    }, [item])

    return <div>RGB COG Controls</div>
}
