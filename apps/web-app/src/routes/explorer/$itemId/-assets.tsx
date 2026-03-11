import { OverlaySection } from "@/components/overlays/overlay-section"
import type { StacItem } from "../-stac-schema"
import { AssetLayers } from "./-asset-layers"
import { RgbAssetCard } from "./-rgb-asset-card"
import { MsAssetCard } from "./-ms-asset-card"

interface Props {
    item: StacItem
}

export function Assets({ item }: Props) {
    return (
        <>
            {/* DOM */}
            <OverlaySection title="Assets" defaultOpen muted>
                <RgbAssetCard item={item} />
                <MsAssetCard item={item} />
            </OverlaySection>
            {/* Deck Layers */}
            <AssetLayers item={item} />
        </>
    )
}
