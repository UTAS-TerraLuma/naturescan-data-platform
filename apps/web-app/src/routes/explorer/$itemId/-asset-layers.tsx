import { getTilesUrl } from "@/lib/titiler"
import { useDeckLayer } from "@/stores/deck-store"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers"
import { useAssetStore } from "./-asset-store"
import { useMatchRoute } from "@tanstack/react-router"
import { useItem } from "./-item-provider"

const RGB_ORTHO_ID = "rgb-ortho"
const MS_ORTHO_ID = "ms-ortho"

export function AssetLayers() {
    const item = useItem()
    const matchRoute = useMatchRoute()

    const selectedAsset = useAssetStore((s) => s.selectedAsset)
    const isLabelRoute = matchRoute({
        to: "/explorer/$itemId/label",
        fuzzy: false,
    })

    const rgbParams = useRgbSearchParams()
    const rgbUrl = getTilesUrl(rgbParams)

    const mMsParams = useMsSearchParams()
    const msUrl = getTilesUrl(mMsParams)

    useDeckLayer({
        [RGB_ORTHO_ID]: new TileLayer({
            id: RGB_ORTHO_ID,
            visible: selectedAsset == "rgb",
            extent: item.bbox,
            data: rgbUrl,
            minZoom: 18,

            opacity: isLabelRoute ? 0.2 : 1,
            refinementStrategy: isLabelRoute ? "no-overlap" : "best-available",

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
        [MS_ORTHO_ID]: new TileLayer({
            id: MS_ORTHO_ID,
            visible: selectedAsset == "ms",
            extent: item.bbox,
            data: msUrl,
            minZoom: 18,

            opacity: isLabelRoute ? 0.2 : 1,
            refinementStrategy: isLabelRoute ? "no-overlap" : "best-available",

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

    return null
}

export function useMsSearchParams() {
    const item = useItem()
    const preset = useAssetStore((s) => s.msPreset)
    const bandIndexes = preset.value

    const { href, bands } = item.assets.ms

    const c1 = bands[bandIndexes.r - 1]
    const c2 = bands[bandIndexes.g - 1]
    const c3 = bands[bandIndexes.b - 1]

    return {
        url: href,
        bidx: [bandIndexes.r, bandIndexes.g, bandIndexes.b],
        rescale: [
            `${c1.statistics.mean - 2 * c1.statistics.stddev},${c1.statistics.mean + 2 * c1.statistics.stddev}`,
            `${c2.statistics.mean - 2 * c2.statistics.stddev},${c2.statistics.mean + 2 * c2.statistics.stddev}`,
            `${c3.statistics.mean - 2 * c3.statistics.stddev},${c3.statistics.mean + 2 * c3.statistics.stddev}`,
        ],
    }
}

export function useRgbSearchParams() {
    const item = useItem()
    const { href } = item.assets.rgb

    return {
        url: href,
    }
}
