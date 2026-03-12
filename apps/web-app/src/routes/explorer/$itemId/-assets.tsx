import { OverlaySection } from "@/components/overlays/overlay-section"
import { AssetLayers } from "./-asset-layers"
import { RgbAssetCard } from "./-rgb-asset-card"
import { MsAssetCard } from "./-ms-asset-card"

export function Assets() {
    return (
        <>
            {/* DOM */}
            <OverlaySection title="Assets" defaultOpen muted>
                <RgbAssetCard />
                <MsAssetCard />
            </OverlaySection>
            {/* Deck Layers */}
            <AssetLayers />
        </>
    )
}
