import { useDeckLayer } from "@/stores/deck-store"
import { BitmapLayer } from "@deck.gl/layers"
import { useLabelStore } from "./-label-store"
import { useAssetStore } from "../-asset-store"
import { useMsSearchParams, useRgbSearchParams } from "../-asset-layers"
import { createTitilerUrl } from "@/lib/titiler"

const LAYER_ID = "label-image-layer"
const IMAGE_SIZE = 1036

export function useImageUrl() {
    const selectedAsset = useAssetStore((s) => s.selectedAsset)
    const msParams = useMsSearchParams()
    const rgbParams = useRgbSearchParams()

    const bounds = useLabelStore((s) => s.bounds)

    const imageUrl = createTitilerUrl(
        `/cog/bbox/${bounds.join(",")}/${IMAGE_SIZE}x${IMAGE_SIZE}.png`,
        selectedAsset == "rgb" ? rgbParams : msParams,
    )

    return imageUrl
}

export function ImageLayer() {
    const locked = useLabelStore((s) => s.locked)
    const bounds = useLabelStore((s) => s.bounds)
    const imageUrl = useImageUrl()

    let bitmapLayer: BitmapLayer | null = null

    if (locked) {
        bitmapLayer = new BitmapLayer({
            id: LAYER_ID,
            image: imageUrl,
            bounds: bounds,

            textureParameters: {
                minFilter: "nearest",
                magFilter: "nearest",
            },
        })
    }

    useDeckLayer({
        [LAYER_ID]: bitmapLayer,
    })

    return null
}
