import { useDataLayerStore } from "@/stores/data-layer-store"
import type { Bounds } from "@/types/spatial"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Scan, X } from "lucide-react"
import { fitBounds } from "@/stores/map-view-state-store"

export function DataLayerOverlay() {
    const dataLayers = useDataLayerStore((s) => s.dataLayers)

    if (dataLayers.length == 0) {
        return null
    }

    return (
        <div className="bg-background text-foreground rounded-sm p-4 pt-3 space-y-2">
            {dataLayers.map((d) => {
                if (d.type == "rgb-cog") {
                    return <RgbCogDataLayer key={d.id} {...d} />
                }

                return null
            })}
        </div>
    )
}

function RgbCogDataLayer({
    id,
    cogUrl,
    bounds,
}: {
    id: string
    cogUrl: string
    bounds: Bounds
}) {
    const removeDataLayer = useDataLayerStore((s) => s.removeDataLayer)

    return (
        <>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="cog-url">COG URL</FieldLabel>
                    <div className="flex gap-2">
                        <Input
                            id="cog-url"
                            placeholder="https://example.com/cog"
                            type="url"
                            value={cogUrl}
                            disabled
                        ></Input>
                        <Button
                            type="button"
                            size="icon"
                            variant="default"
                            onClick={() => fitBounds(bounds)}
                        >
                            <Scan />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeDataLayer(id)}
                        >
                            <X />
                        </Button>
                    </div>
                </Field>
            </FieldGroup>
        </>
    )
}
