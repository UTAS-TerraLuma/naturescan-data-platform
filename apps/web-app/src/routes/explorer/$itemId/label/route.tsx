import { OverlaySection } from "@/components/overlays/overlay-section"
import { createFileRoute } from "@tanstack/react-router"

import { PreviewBoundsLayer } from "./-preview-bounds-layer"
import { Prompts } from "./-prompts"
import { LabelImageProvider } from "./-label-image-provider"

export const Route = createFileRoute("/explorer/$itemId/label")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <LabelImageProvider>
            {/* DOM */}
            <OverlaySection title="Labelling" defaultOpen muted>
                <Prompts />
            </OverlaySection>

            {/* Layers */}
            <PreviewBoundsLayer />
        </LabelImageProvider>
    )
}
