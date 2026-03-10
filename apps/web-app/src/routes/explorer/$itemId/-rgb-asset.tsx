import { getTilesUrl } from "@/lib/titiler"
import type { StacItem } from "../-stac-schema"
import { useDeckLayer } from "@/stores/deck-store"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers"
import { AssetCard } from "@/components/overlays/asset-card"

const RGB_ORTHO_ID = "rgb-ortho"

export function RgbAsset({
    item,
    isActive,
    setActive,
}: {
    item: StacItem
    isActive: boolean
    setActive: () => void
}) {
    const rgbUrl = getTilesUrl(item.assets.rgb.href)

    useDeckLayer({
        [RGB_ORTHO_ID]: new TileLayer({
            id: `${item.id}-rgb`,
            visible: isActive,
            extent: item.bbox,
            data: rgbUrl,
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
        }),
    })
    return (
        <AssetCard
            isActive={isActive}
            onClick={setActive}
            title="RGB Orthomosaic"
        />
    )
}
