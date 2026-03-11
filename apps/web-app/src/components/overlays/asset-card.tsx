import { Eye, EyeClosed } from "lucide-react"
import { Collapsible } from "@base-ui/react/collapsible"

export function AssetCard({
    title,
    isActive,
    onClick,
    children,
}: {
    title: string
    isActive: boolean
    onClick: () => void
    children?: React.ReactNode
}) {
    return (
        <Collapsible.Root
            open={isActive}
            onOpenChange={onClick}
            className="bg-white rounded-sm ring ring-foreground/10 data-open:bg-primary/10"
        >
            <Collapsible.Trigger className="flex w-full items-center justify-between p-3">
                {title}
                {isActive ? (
                    <EyeClosed className="text-foreground/50" />
                ) : (
                    <Eye />
                )}
            </Collapsible.Trigger>
            <Collapsible.Panel>{children}</Collapsible.Panel>
        </Collapsible.Root>
    )
}
