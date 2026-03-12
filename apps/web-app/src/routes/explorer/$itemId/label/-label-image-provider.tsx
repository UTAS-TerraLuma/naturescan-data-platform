import type { Bounds } from "@/lib/spatial-utils"
// import type { WebMercatorViewport } from "@deck.gl/core"
import { createContext, useContext, type ReactNode } from "react"
import { useScreenSquareBounds } from "./-use-screen-bounds"
import { useDebouncedValue } from "@tanstack/react-pacer"
import { useAssetStore } from "../-asset-store"
import { useMsSearchParams, useRgbSearchParams } from "../-asset-layers"
import { createTitilerUrl } from "@/lib/titiler"

interface LabelImageData {
    imageUrl: string
    bounds: Bounds
    // viewport: WebMercatorViewport
    isStale: boolean
}

const IMAGE_SIZE = 1036

const LabelImageContext = createContext<LabelImageData | undefined>(undefined)

export function LabelImageProvider({ children }: { children: ReactNode }) {
    const previewBounds = useScreenSquareBounds()
    const [bounds, boundsDebouncer] = useDebouncedValue(
        previewBounds,
        { wait: 300 },
        (state) => ({ isStale: state.isPending }),
    )
    const isStale = boundsDebouncer.state.isStale

    const selectedAsset = useAssetStore((s) => s.selectedAsset)
    const msParams = useMsSearchParams()
    const rgbParams = useRgbSearchParams()

    const imageUrl = createTitilerUrl(
        `/cog/bbox/${bounds.join(",")}/${IMAGE_SIZE}x${IMAGE_SIZE}.png`,
        selectedAsset == "rgb" ? rgbParams : msParams,
    )

    const imageData: LabelImageData = {
        imageUrl,
        bounds,
        isStale,
    }

    return (
        <LabelImageContext.Provider value={imageData}>
            {children}
        </LabelImageContext.Provider>
    )
}

export function useLabelImage(): LabelImageData {
    const data = useContext(LabelImageContext)

    if (data === undefined) {
        throw new Error(
            "useLabelImage must be used within an LabelImageProvider",
        )
    }

    return data
}
