import { Eye, EyeClosed } from "lucide-react"
import { Collapsible } from "@base-ui/react/collapsible"

export function AssetCard({
    title,
    isActive,
    onActiveChange,
    children,
}: {
    title: string
    isActive: boolean
    onActiveChange: (b: boolean) => void
    children?: React.ReactNode
}) {
    return (
        <Collapsible.Root
            open={isActive}
            onOpenChange={onActiveChange}
            className="bg-white rounded-sm ring ring-foreground/10 data-closed:text-foreground/50"
        >
            <Collapsible.Trigger className="flex w-full items-center justify-between p-3">
                <span>{title}</span>
                {isActive ? <Eye /> : <EyeClosed className="text-foreground" />}
            </Collapsible.Trigger>
            <Collapsible.Panel>{children}</Collapsible.Panel>
        </Collapsible.Root>
    )
}
