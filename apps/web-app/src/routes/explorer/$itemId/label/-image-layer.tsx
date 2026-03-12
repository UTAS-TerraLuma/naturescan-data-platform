import { createTitilerUrl } from "@/lib/titiler"
import { useItem } from "../-item-provider"
import { IMAGE_SIZE, useLabelStore } from "./-label-store"
import type { Bounds } from "@/lib/spatial-utils"
import { useDeckLayer } from "@/stores/deck-store"
import { BitmapLayer } from "@deck.gl/layers"
import { useEffect } from "react"

export function ImageLayer() {
    const bounds = useLabelStore((s) => s.bounds)
    const isBoundsPending = useLabelStore((s) => s.boundsPending)

    if (bounds && !isBoundsPending) {
        return <ImageLayerInner bounds={bounds} />
    } else {
        return null
    }
}

const LAYER_ID = "label-image-layer"

function ImageLayerInner({ bounds }: { bounds: Bounds }) {
    const item = useItem()

    const imageUrl = createTitilerUrl(
        `/cog/bbox/${bounds.join(",")}/${IMAGE_SIZE}x${IMAGE_SIZE}.png`,
        {
            url: item.assets.rgb.href,
        },
    )

    useDeckLayer({
        [LAYER_ID]: new BitmapLayer({
            id: LAYER_ID,
            image: imageUrl,
            bounds: bounds,
        }),
    })

    useEffect(() => {
        console.log(imageUrl)
    }, [imageUrl])

    return null
}
