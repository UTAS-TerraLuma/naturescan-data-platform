import type { StacItem } from "../-stac-schema"
import { AssetCard } from "./-asset-card"
import { useAssetStore } from "./-asset-store"

export function MsAssetCard({ item: _item }: { item: StacItem }) {
    const showMs = useAssetStore((s) => s.showMs)
    const setShowMs = useAssetStore((s) => s.setShowMs)

    // const bandIndexes = useAssetStore((s) => s.bandIndexes)
    // const setBandIndexes = useAssetStore((s) => s.setBandIndexes)

    return (
        <AssetCard
            isActive={showMs}
            onActiveChange={setShowMs}
            title="Multispectral Orthomosaic"
        />
    )
}
