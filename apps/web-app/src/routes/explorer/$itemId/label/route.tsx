import { OverlaySection } from "@/components/overlays/overlay-section"
import { createFileRoute } from "@tanstack/react-router"

import { useBoundsOutlineLayer } from "./-bounds-outline-layer"
import { useLabelStore } from "./-label-store"
import { useKeyPress } from "@/hooks/useKeyPress"
import { useScreenSquareBounds } from "./-use-screen-bounds"
import { useEffect } from "react"
import { useImageLayer } from "./-image-layer"
import { LabellingControls } from "./-labelling-controls"

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
    const toggleLocked = useLabelStore((s) => s.toggleLocked)

    useTrackBounds()
    useBoundsOutlineLayer()
    useImageLayer()

    useKeyPress("l", toggleLocked)

    return (
        <>
            {/* DOM */}
            <OverlaySection title="Labelling" defaultOpen muted>
                <LabellingControls />
            </OverlaySection>
        </>
    )
}
