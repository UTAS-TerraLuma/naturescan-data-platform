import { OverlaySection } from "@/components/overlays/overlay-section"
import { useItem } from "./-item-provider"

export function ItemSummary() {
    const item = useItem()

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
