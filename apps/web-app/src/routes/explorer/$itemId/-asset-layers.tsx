import { getTilesUrl } from "@/lib/titiler"
import type { StacItem } from "../-stac-schema"
import { useDeckLayer } from "@/stores/deck-store"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers"
import { useAssetStore } from "./-asset-store"
import { useMemo } from "react"

const RGB_ORTHO_ID = "rgb-ortho"
const MS_ORTHO_ID = "ms-ortho"

interface Props {
    item: StacItem
}

export function AssetLayers({ item }: Props) {
    const showRgb = useAssetStore((s) => s.showRgb)
    const rgbUrl = getTilesUrl(item.assets.rgb.href)

    const showMs = useAssetStore((s) => s.showMs)
    const bandIndexes = useAssetStore((s) => s.bandIndexes)
    const msUrl = useMemo(() => {
        const { href, bands } = item.assets.ms

        const c1 = bands[bandIndexes.r - 1]
        const c2 = bands[bandIndexes.g - 1]
        const c3 = bands[bandIndexes.b - 1]

        return getTilesUrl(href, {
            bidx: [4, 2, 1],
            rescale: [
                `${c1.statistics.mean - 2 * c1.statistics.stddev},${c1.statistics.mean + 2 * c1.statistics.stddev}`,
                `${c2.statistics.mean - 2 * c2.statistics.stddev},${c2.statistics.mean + 2 * c2.statistics.stddev}`,
                `${c3.statistics.mean - 2 * c3.statistics.stddev},${c3.statistics.mean + 2 * c3.statistics.stddev}`,
            ],
        })
    }, [item])

    useDeckLayer({
        [RGB_ORTHO_ID]: new TileLayer({
            id: RGB_ORTHO_ID,
            visible: showRgb,
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
        [MS_ORTHO_ID]: new TileLayer({
            id: MS_ORTHO_ID,
            visible: showMs,
            extent: item.bbox,
            data: msUrl,
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

    return null
}
