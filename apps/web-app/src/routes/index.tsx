import { createFileRoute, Link } from "@tanstack/react-router"

import logoUrl from "@/assets/terra-luma-logo.png"

export const Route = createFileRoute("/")({
    component: App,
})

function App() {
    return (
        <div>
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-6 text-center">
                    <img
                        src={logoUrl}
                        alt="Terra Luma logo"
                        className="h-24 w-auto"
                    />
                    <h1 className="text-4xl font-semibold tracking-tight">
                        NatureScan
                    </h1>
                    <Link
                        to="/explorer"
                        className="text-sm font-medium text-[#8d9f41] underline underline-offset-4"
                    >
                        Go to the explorer
                    </Link>
                </div>
            </div>
        </div>
    )
}
