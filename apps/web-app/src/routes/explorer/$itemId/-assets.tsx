import { OverlaySection } from "@/components/overlays/overlay-section"
import { Download, ExternalLink } from "lucide-react"
import { AssetLayers } from "./-asset-layers"
import { useItem } from "./-item-provider"
import { RgbAssetCard } from "./-rgb-asset-card"
import { MsAssetCard } from "./-ms-asset-card"

export function Assets() {
    const item = useItem()
    const pc = item.assets.pointcloud
    const report = item.assets["metashape-report"]

    return (
        <>
            {/* DOM */}
            <OverlaySection title="Assets" defaultOpen muted>
                <RgbAssetCard />
                <MsAssetCard />
                {report && (
                    <div className="bg-white rounded-sm ring ring-foreground/10 p-2">
                        <a
                            href={report.href}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 underline"
                        >
                            <span>Processing Report</span>
                            <Download className="size-4" />
                        </a>
                    </div>
                )}
                {pc && (
                    <div className="bg-white rounded-sm ring ring-foreground/10 p-2">
                        <a
                            href={`https://opengeos.org/maplibre-gl-lidar/viewer/index.html?url=${encodeURIComponent(pc.href)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 underline"
                        >
                            <span>Point Cloud</span>
                            <ExternalLink className="size-4" />
                        </a>
                    </div>
                )}
            </OverlaySection>
            {/* Deck Layers */}
            <AssetLayers />
        </>
    )
}
