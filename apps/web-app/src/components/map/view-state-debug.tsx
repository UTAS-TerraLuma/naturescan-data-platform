import { useMapViewState } from "@/stores/map-view-state-store"

export function ViewStateDebug() {
    const viewState = useMapViewState((s) => s.viewState)
    return (
        <div className="absolute bottom-4 left-4 rounded-sm bg-background text-foreground p-2 max-h-32 w-84 overflow-auto">
            <pre className="text-xs font-mono">
                {JSON.stringify(viewState, null, 2)}
            </pre>
        </div>
    )
}
