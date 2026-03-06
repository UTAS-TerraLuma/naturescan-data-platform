import { createFileRoute } from "@tanstack/react-router"
import { nsItemByIdQuery } from "./-stac-queries"
import { useSuspenseQuery } from "@tanstack/react-query"

export const Route = createFileRoute("/stacv3/$itemId")({
    loader: ({ context, params: { itemId } }) =>
        context.queryClient.ensureQueryData(nsItemByIdQuery(itemId)),
    component: RouteComponent,
})

function RouteComponent() {
    const { itemId } = Route.useParams()

    const item = useSuspenseQuery(nsItemByIdQuery(itemId))

    return (
        <div>
            <pre>{JSON.stringify(item, null, 4)}</pre>
        </div>
    )
}
