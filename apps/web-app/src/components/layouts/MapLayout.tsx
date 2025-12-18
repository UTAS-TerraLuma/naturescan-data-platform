import type { ReactNode } from "react"

export default function MapLayout({
    header,
    children,
}: {
    header?: ReactNode
    children?: ReactNode
}) {
    return (
        <div className="flex flex-col h-screen">
            <div className="p-4 dark bg-background text-foreground">
                {header}
            </div>
            <div className="relative grow">{children}</div>
        </div>
    )
}
