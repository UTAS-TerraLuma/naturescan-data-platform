import type { ReactNode } from "react"

export function MapLayout({
    header,
    children,
    overlay,
}: {
    header?: ReactNode
    children?: ReactNode
    overlay?: ReactNode
}) {
    return (
        <div className="flex flex-col h-screen">
            <div className="p-4 dark bg-background text-foreground">
                {header}
            </div>
            <div className="relative grow">
                <div onContextMenu={(e) => e.preventDefault()}>{children}</div>
                {overlay}
            </div>
        </div>
    )
}
