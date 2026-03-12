import { useState } from "react"
import type { PromptMode } from "./-prompt-types"
import { useLabelImage } from "./-label-image-provider"
import { BitmapLayer } from "@deck.gl/layers"
import { useDeckLayer } from "@/stores/deck-store"
import { useQuery } from "@tanstack/react-query"

const LAYER_ID = "preview-image-layer"

async function fetchImageBitmap(url: string) {
    const response = await fetch(url)
    const blob = await response.blob()
    return await createImageBitmap(blob)
}

export function Prompts() {
    const { imageUrl, bounds, isStale } = useLabelImage()

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
    if (isPending || isStale) bitmapLayer = null

    useDeckLayer({
        [LAYER_ID]: bitmapLayer,
    })

    const [mode, setMode] = useState<PromptMode>("pvs")
    const [pvsSimpleMode, setPvsSimpleMode] = useState(true)
    const [hasAutoSegmented, setHasAutoSegmented] = useState(false)

    return null
}
