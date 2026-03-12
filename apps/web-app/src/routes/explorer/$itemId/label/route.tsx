import { OverlaySection } from "@/components/overlays/overlay-section"
import { createFileRoute } from "@tanstack/react-router"
import { ImageLayer } from "./-image-layer"
import { useScreenSquareBounds } from "./-use-screen-bounds"
import { useLabelImage } from "./-use-label-image"
import { PreviewBoundsLayer } from "./-preview-bounds-layer"

export const Route = createFileRoute("/explorer/$itemId/label")({
    component: RouteComponent,
})

function RouteComponent() {
    const previewBounds = useScreenSquareBounds()
    const [imageUrl, bounds, isStale] = useLabelImage()

    return (
        <>
            {/* DOM */}
            <OverlaySection title="Labelling" defaultOpen muted>
                <p>Hello</p>
            </OverlaySection>

            {/* Layers */}
            <ImageLayer imageUrl={imageUrl} bounds={bounds} isStale={isStale} />
            <PreviewBoundsLayer bounds={previewBounds} />
        </>
    )
}
