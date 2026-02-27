import { cn } from "@/lib/utils"

export function FullscreenLayout({
    children,
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("h-screen relative", className)} {...props}>
            {children}
        </div>
    )
}
