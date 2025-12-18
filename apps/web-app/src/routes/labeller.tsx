import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/labeller")({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/labeller"!</div>
}
