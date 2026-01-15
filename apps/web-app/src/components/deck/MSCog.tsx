import type { StacItem } from "@/lib/stac-schemas"
import { getTilesUrl } from "@/lib/titiler"
import { useDeckLayers } from "@/stores/deck-layer-store"
import { TileLayer } from "@deck.gl/geo-layers"
import { BitmapLayer } from "@deck.gl/layers"
import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function MSCog({ item }: { item: StacItem }) {
    const updateLayer = useDeckLayers((s) => s.updateLayer)
    const removeLayer = useDeckLayers((s) => s.removeLayer)

    const bands = item.assets.main.bands

    const bandOptions = bands.map((b, i) => ({
        value: i + 1,
        label: b.description ?? b["eo:common_name"],
    }))

    const [rChannel, setRChannel] = useState(4)
    const [gChannel, setGChannel] = useState(2)
    const [bChannel, setBChannel] = useState(1)

    useEffect(() => {
        const id = item.id

        const bands = item.assets.main.bands

        const b1 = bands[rChannel - 1]
        const b2 = bands[gChannel - 1]
        const b3 = bands[bChannel - 1]

        const xyzUrl = getTilesUrl(item.assets.main.href, {
            bidx: [rChannel, gChannel, bChannel],
            rescale: [
                `${b1.statistics.mean - 2 * b1.statistics.stddev},${b1.statistics.mean + 2 * b1.statistics.stddev}`,
                `${b2.statistics.mean - 2 * b2.statistics.stddev},${b2.statistics.mean + 2 * b2.statistics.stddev}`,
                `${b3.statistics.mean - 2 * b3.statistics.stddev},${b3.statistics.mean + 2 * b3.statistics.stddev}`,
            ],
        })

        const itemLayer = new TileLayer({
            id,
            extent: item.bbox,
            data: xyzUrl,
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
        })

        updateLayer(itemLayer)

        return () => removeLayer(id)
    }, [item, rChannel, gChannel, bChannel])

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-[15ch]">Red Channel</div>
                <Select
                    items={bandOptions}
                    value={rChannel}
                    onValueChange={(value) => setRChannel(value!)}
                >
                    <SelectTrigger className="w-[34ch]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {bandOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-[15ch]">Green Channel</div>
                <Select
                    items={bandOptions}
                    value={gChannel}
                    onValueChange={(value) => setGChannel(value!)}
                >
                    <SelectTrigger className="w-[34ch]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {bandOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-[15ch]">Blue Channel</div>
                <Select
                    items={bandOptions}
                    value={bChannel}
                    onValueChange={(value) => setBChannel(value!)}
                >
                    <SelectTrigger className="w-[34ch]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {bandOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
