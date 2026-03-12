import { OverlaySection } from "@/components/overlays/overlay-section"
import { createFileRoute } from "@tanstack/react-router"
import { ImageBoundsLayer } from "./-image-bounds-layer"
import { ImageLayer } from "./-image-layer"

export const Route = createFileRoute("/explorer/$itemId/label")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <OverlaySection title="Labels" defaultOpen muted>
                <p>Hello</p>
            </OverlaySection>
            <ImageBoundsLayer />
            <ImageLayer />
        </>
    )
}
