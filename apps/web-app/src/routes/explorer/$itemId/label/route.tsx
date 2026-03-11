import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/explorer/$itemId/label")({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/explorer/$itemId/label"!</div>
}
