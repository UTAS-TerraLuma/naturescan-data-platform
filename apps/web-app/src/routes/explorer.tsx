import MapLayout from "@/components/layouts/MapLayout"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/explorer")({
    component: App,
})

function App() {
    return <MapLayout header={<h1>Explorer</h1>}>Explorer</MapLayout>
}
