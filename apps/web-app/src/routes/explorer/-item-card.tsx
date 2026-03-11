import type { StacItem } from "@/routes/explorer/-stac-schema"
import { Link } from "@tanstack/react-router"

export function ItemCard({ item }: { item: StacItem }) {
    return (
        <div className="ring-1 ring-foreground/10 rounded-sm">
            <Link to="/explorer/$itemId" params={{ itemId: item.id }}>
                <div className="flex items-center">
                    <img
                        src={item.assets.thumbnail.href}
                        className="size-24 object-contain p-1"
                    />
                    <div>
                        <h1>{item.properties.title}</h1>
                        <p className="text-sm text-foreground/75 mt-1">
                            {item.properties.description}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    )
}
