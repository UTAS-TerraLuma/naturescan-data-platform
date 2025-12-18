import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: App,
})

function App() {
    return (
        <div>
            <Link to="/explorer">Explorer</Link>
            <Link to="/labeller">Labeller</Link>
        </div>
    )
}
