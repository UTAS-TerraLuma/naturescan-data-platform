import { Check, ChevronDown, Layers } from "lucide-react"
import { Select } from "@base-ui/react/select"
import { BASEMAPS, useDeck } from "@/stores/deck-store"

export function BasemapSelect() {
    const basemap = useDeck((s) => s.basemap)
    const setBasemap = useDeck((s) => s.setBasemap)

    return (
        <Select.Root
            items={BASEMAPS}
            value={basemap}
            onValueChange={(b) => {
                if (b) setBasemap(b)
            }}
        >
            <Select.Trigger className="flex items-center p-1 px-2 gap-2 bg-background rounded-sm ring ring-foreground/10">
                <Layers className="size-4" />
                <Select.Value>{basemap.label}</Select.Value>
                <Select.Icon>
                    <ChevronDown className="size-4" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Positioner alignItemWithTrigger={false} align="start" side="top">
                    <Select.Popup className="bg-background p-1 space-y-1 ring ring-foreground/10 rounded-sm mb-2">
                        <Select.List>
                            {BASEMAPS.map((b) => (
                                <Select.Item
                                    key={b.id}
                                    value={b}
                                    className="flex items-center gap-2 hover:bg-accent rounded-xs cursor-pointer"
                                >
                                    <Select.ItemText className="p-1">
                                        {b.label}
                                    </Select.ItemText>
                                    <Select.ItemIndicator>
                                        <Check className="size-4" />
                                    </Select.ItemIndicator>
                                </Select.Item>
                            ))}
                        </Select.List>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    )
}
