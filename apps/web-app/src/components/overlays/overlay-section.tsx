import type { ReactNode } from "react"
import { Collapsible } from "@base-ui/react/collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
    children: ReactNode
    title: string
    defaultOpen?: boolean
    muted?: boolean
}

export function OverlaySection({
    title,
    children,
    defaultOpen = false,
    muted = false,
}: Props) {
    return (
        <Collapsible.Root
            defaultOpen={defaultOpen}
            className={cn(
                "p-2 group/root  ring ring-foreground/10",
                muted ? "bg-muted" : "bg-background",
            )}
        >
            <Collapsible.Trigger className="w-full flex items-center justify-between">
                {title}
                <ChevronDown className="transition-transform group-has-data-open/root:rotate-180" />
            </Collapsible.Trigger>
            <Collapsible.Panel className="space-y-2 pt-2">
                {children}
            </Collapsible.Panel>
        </Collapsible.Root>
    )
}
