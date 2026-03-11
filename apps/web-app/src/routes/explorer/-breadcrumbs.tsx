import { Link, useParams } from "@tanstack/react-router"
import { Home, Map } from "lucide-react"

export function BreadCrumbs() {
    const { itemId } = useParams({ strict: false })

    return (
        <div className="flex items-center gap-1">
            <Link
                to="/explorer"
                activeOptions={{ exact: true }}
                className="flex items-center gap-1 text-foreground/55 hover:text-foreground/75 hover:underline [&.active]:text-foreground/75 [&.active]:underline"
            >
                <Home className="size-4" />
                <span>Home</span>
            </Link>
            {itemId && (
                <>
                    <span className="text-foreground/40">/</span>
                    <Link
                        to="/explorer/$itemId"
                        params={{ itemId }}
                        className="flex items-center gap-1 text-foreground/55 hover:text-foreground/75 hover:underline [&.active]:text-foreground/75 [&.active]:underline"
                    >
                        <Map className="size-4" />
                        {/*<span>Item</span>*/}
                        <span>Item</span>
                    </Link>
                </>
            )}
        </div>
    )
}
