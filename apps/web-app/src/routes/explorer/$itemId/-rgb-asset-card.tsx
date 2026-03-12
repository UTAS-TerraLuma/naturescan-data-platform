import { AssetCard } from "./-asset-card"
import { useAssetStore } from "./-asset-store"

export function RgbAssetCard() {
    const selectedAsset = useAssetStore((s) => s.selectedAsset)
    const setSelectedAsset = useAssetStore((s) => s.setSelectedAsset)

    const isActive = selectedAsset == "rgb"
    const onActiveChange = (show: boolean) =>
        setSelectedAsset(show ? "rgb" : "ms")

    return (
        <AssetCard
            isActive={isActive}
            onActiveChange={onActiveChange}
            title="RGB Orthomosaic"
        />
    )
}
