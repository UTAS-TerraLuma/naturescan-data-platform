import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/explorer")({
    component: App,
})

function App() {
    return (
        <div>
            <h1>Explorer</h1>
        </div>
    )
}
