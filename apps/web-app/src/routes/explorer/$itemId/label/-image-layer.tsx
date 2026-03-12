import { type Bounds } from "@/lib/spatial-utils"
import { useDeckLayer } from "@/stores/deck-store"
import { BitmapLayer } from "@deck.gl/layers"
import { useQuery } from "@tanstack/react-query"
// import type { WebMercatorViewport } from "@deck.gl/core"

const LAYER_ID = "label-image-layer"

interface Props {
    imageUrl: string
    bounds: Bounds
    boundsAreStale: boolean
}

async function fetchImageBitmap(url: string) {
    const response = await fetch(url)
    const blob = await response.blob()
    return await createImageBitmap(blob)
}

export function ImageLayer({ bounds, imageUrl, boundsAreStale }: Props) {
    const { data: bitmap, isPending } = useQuery({
        queryKey: ["image", imageUrl],
        queryFn: () => fetchImageBitmap(imageUrl),
        staleTime: Infinity,
        gcTime: 0, // Don't cache copies
    })

    let bitmapLayer: BitmapLayer | null = new BitmapLayer({
        id: LAYER_ID,
        image: bitmap,
        bounds: bounds,
    })

    // Set bitmaplayer to null if pending or stale
    if (isPending || boundsAreStale) bitmapLayer = null

    useDeckLayer({
        [LAYER_ID]: bitmapLayer,
    })

    return null
}
