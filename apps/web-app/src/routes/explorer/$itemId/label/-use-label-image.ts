import { createTitilerUrl } from "@/lib/titiler"
import { useMsSearchParams, useRgbSearchParams } from "../-asset-layers"
import { useAssetStore } from "../-asset-store"
import { useDebouncedScreenSquareBounds } from "./-use-screen-bounds"
import type { Bounds } from "@/lib/spatial-utils"

export const IMAGE_SIZE = 1036

export function useLabelImage(): [string, Bounds, boolean] {
    const [bounds, isStale] = useDebouncedScreenSquareBounds()

    const selectedAsset = useAssetStore((s) => s.selectedAsset)
    const msParams = useMsSearchParams()
    const rgbParams = useRgbSearchParams()

    const imageUrl = createTitilerUrl(
        `/cog/bbox/${bounds.join(",")}/${IMAGE_SIZE}x${IMAGE_SIZE}.png`,
        selectedAsset == "rgb" ? rgbParams : msParams,
    )

    return [imageUrl, bounds, isStale]
}
