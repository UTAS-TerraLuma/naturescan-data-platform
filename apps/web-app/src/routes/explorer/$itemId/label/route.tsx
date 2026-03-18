import { OverlaySection } from "@/components/overlays/overlay-section"
import { Switch } from "@base-ui/react/switch"
import { Field } from "@base-ui/react/field"
import { createFileRoute } from "@tanstack/react-router"

import { useBoundsOutlineLayer } from "./-bounds-outline-layer"
import { useLabelStore } from "./-label-store"
import { useKeyPress } from "@/hooks/useKeyPress"
import { useScreenSquareBounds } from "./-use-screen-bounds"
import { useEffect } from "react"
import { useImageLayer } from "./-image-layer"

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
    const locked = useLabelStore((s) => s.locked)
    const toggleLocked = useLabelStore((s) => s.toggleLocked)

    useTrackBounds()
    useBoundsOutlineLayer()
    useImageLayer()

    useKeyPress("l", toggleLocked)

    return (
        <>
            {/* DOM */}
            <OverlaySection title="Labelling" defaultOpen muted>
                <Field.Root
                    name="lock-image"
                    className="flex items-center gap-2"
                >
                    <Field.Label>
                        Lock image{" "}
                        <kbd className="bg-muted text-muted-foreground h-5 w-fit min-w-5 rounded-sm px-1 font-mono text-xs font-medium inline-flex items-center justify-center select-none ring ring-foreground/10l">
                            L
                        </kbd>
                    </Field.Label>
                    <Switch.Root
                        id="lock-image"
                        checked={locked}
                        onCheckedChange={toggleLocked}
                        className="relative flex items-center h-5 w-9 cursor-pointer rounded-full bg-foreground/20 transition-colors data-checked:bg-foreground/80"
                    >
                        <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-background shadow transition-transform data-checked:translate-x-4" />
                    </Switch.Root>
                </Field.Root>
            </OverlaySection>
        </>
    )
}
