import { OverlaySection } from "@/components/overlays/overlay-section"
import { createFileRoute } from "@tanstack/react-router"

import { BoundsOutlineLayer } from "./-bounds-outline-layer"
import { useLabelStore } from "./-label-store"
import { useScreenSquareBounds } from "./-use-screen-bounds"
import { useEffect } from "react"
import { LabellingControls } from "./-labelling-controls"
import { PromptLayer } from "./-prompt-layer"
import { ImageLayer } from "./-image-layer"
import { ResultsLayer } from "./-results-layer"

export const Route = createFileRoute("/explorer/$itemId/label")({
    component: RouteComponent,
})

function useTrackBounds() {
    const locked = useLabelStore((s) => s.locked)
    const screenBounds = useScreenSquareBounds()
    const setBounds = useLabelStore((s) => s.setBounds)

    useEffect(() => {
        if (!locked) {
            setBounds(screenBounds)
        }
    }, [screenBounds, locked])
}

function RouteComponent() {
    useTrackBounds()
    const locked = useLabelStore((s) => s.locked)

    return (
        <>
            {/* DOM */}
            <OverlaySection title="Labelling" defaultOpen muted>
                <LabellingControls />
            </OverlaySection>
            {/* LAYERS */}
            <BoundsOutlineLayer />
            {locked && (
                <>
                    <ImageLayer />
                    <PromptLayer />
                </>
            )}
            <ResultsLayer />
        </>
    )
}
