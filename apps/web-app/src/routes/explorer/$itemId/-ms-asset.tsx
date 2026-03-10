import { useMemo } from "react"
import type { StacItem } from "../-stac-schema"
import { getTilesUrl } from "@/lib/titiler"
import { useDeckLayer } from "@/stores/deck-store"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers"
import { AssetCard } from "@/components/overlays/asset-card"

const MS_ORTHO_ID = "ms-ortho"

export function MsAsset({
    item,
    isActive,
    setActive,
}: {
    item: StacItem
    isActive: boolean
    setActive: () => void
}) {
    const msUrl = useMemo(() => {
        const { href, bands } = item.assets.ms

        const c1 = bands[4 - 1]
        const c2 = bands[2 - 1]
        const c3 = bands[1 - 1]

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
        [MS_ORTHO_ID]: new TileLayer({
            id: MS_ORTHO_ID,
            visible: isActive,
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

    return (
        <AssetCard
            isActive={isActive}
            onClick={setActive}
            title="Multispectral Orthomosaic"
        />
    )
}
