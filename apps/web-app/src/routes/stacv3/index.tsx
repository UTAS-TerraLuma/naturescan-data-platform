import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { nsItemsQuery } from "./-stac-queries"
import { useDeck } from "@/stores/deck-store"
import { useEffect } from "react"
import { ScatterplotLayer } from "@deck.gl/layers"

export const Route = createFileRoute("/stacv3/")({
    component: RouteComponent,
})

function RouteComponent() {
    const {
        data: { features: items },
    } = useSuspenseQuery(nsItemsQuery)

    const updateLayers = useDeck()

    useEffect(() => {
        const pointsLayer = new ScatterplotLayer({
            id: "items-scatter",
        })
    }, [items, updateLayers])

    return (
        <div>
            {items.map((item) => (
                <div key={item.id}>
                    <Link to="/stacv3/$itemId" params={{ itemId: item.id }}>
                        {item.properties.title}
                    </Link>
                </div>
            ))}
        </div>
    )
}
