import { useDeck } from "@/stores/deck-store"
import { Collapsible } from "@base-ui/react/collapsible"
import { Locate } from "lucide-react"

export function ViewStateDebug() {
    const viewState = useDeck((s) => s.viewState)

    return (
        <Collapsible.Root className="absolute bottom-2 left-2">
            <Collapsible.Trigger className="bg-background p-1 rounded-sm ring ring-foreground/10">
                <Locate className="size-5" />
            </Collapsible.Trigger>
            <Collapsible.Panel className="absolute bottom-full left-0 mb-2 bg-background ring ring-foreground/10 rounded-sm p-1 min-w-75">
                <pre className="text-xs font-mono">
                    {JSON.stringify(viewState, null, 4)}
                </pre>
            </Collapsible.Panel>
        </Collapsible.Root>
    )
}
