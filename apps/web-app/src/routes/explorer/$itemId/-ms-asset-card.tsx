import { AssetCard } from "./-asset-card"
import { useAssetStore } from "./-asset-store"
// import { useItem } from "./-item-provider"

export function MsAssetCard() {
    const selectedAsset = useAssetStore((s) => s.selectedAsset)
    const setSelectedAsset = useAssetStore((s) => s.setSelectedAsset)

    const isActive = selectedAsset == "ms"
    const onActiveChange = (show: boolean) =>
        setSelectedAsset(show ? "ms" : "rgb")

    // const item = useItem()

    // const bandIndexes = useAssetStore((s) => s.bandIndexes)
    // const setBandIndexes = useAssetStore((s) => s.setBandIndexes)

    return (
        <AssetCard
            isActive={isActive}
            onActiveChange={onActiveChange}
            title="Multispectral Orthomosaic"
        >
            <p>Hello Assets</p>
            <p>Hello Sass</p>
        </AssetCard>
    )
}
