import type { StacItem } from "../-stac-schema"

import { AssetCard } from "./-asset-card"
import { useAssetStore } from "./-asset-store"

export function RgbAssetCard({ item: _item }: { item: StacItem }) {
    const showRgb = useAssetStore((s) => s.showRgb)
    const setShowRgb = useAssetStore((s) => s.setShowRgb)
    return (
        <AssetCard
            isActive={showRgb}
            onActiveChange={setShowRgb}
            title="RGB Orthomosaic"
        />
    )
}
