import { useMapViewState } from "@/stores/map-view-state-store"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Locate } from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"

export function ViewStateDebug() {
    const viewState = useMapViewState((s) => s.viewState)
    const [open, setOpen] = useState(false)

    return (
        <Popover
            open={open}
            onOpenChange={(open, event) => {
                // This will keep the popover open when
                // focusing outside of it
                if (
                    event.reason == "focus-out" ||
                    event.reason == "outside-press"
                ) {
                    return
                }
                setOpen(open)
            }}
        >
            <PopoverTrigger
                className="absolute bottom-2 left-2"
                render={<Button size="icon-lg" variant="secondary" />}
            >
                <Locate />
            </PopoverTrigger>
            <PopoverContent>
                <pre className="text-xs font-mono">
                    {JSON.stringify(viewState, null, 2)}
                </pre>
            </PopoverContent>
        </Popover>
    )
}
