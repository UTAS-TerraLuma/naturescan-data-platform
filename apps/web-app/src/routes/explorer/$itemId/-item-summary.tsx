import { OverlaySection } from "@/components/overlays/overlay-section"
import type { StacItem } from "../-stac-schema"

interface Props {
    item: StacItem
}

export function ItemSummary({ item }: Props) {
    return (
        <OverlaySection title="Summary" defaultOpen muted={false}>
            <div className="p-3">
                <img
                    className="h-48 w-full object-contain"
                    src={item.assets.thumbnail.href}
                />
                <p className="text-foreground/75 pt-2">
                    {item.properties.description}
                </p>
            </div>
        </OverlaySection>
    )
}
