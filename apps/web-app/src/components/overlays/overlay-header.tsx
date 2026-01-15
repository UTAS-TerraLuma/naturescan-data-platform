import logoUrl from "@/assets/terra-luma-logo.png"

export function OverlayHeader() {
    return (
        <div className="px-4">
            <div className="flex items-center">
                <img
                    src={logoUrl}
                    alt="Terra Luma Logo"
                    className="w-auto h-16 mr-2"
                />
                <div>
                    <h1 className="font-bold text-xl text-accent-foreground">
                        NatureScan Explorer
                    </h1>
                    <h2 className="italic text-[#8d9f41]">Beta</h2>
                </div>
            </div>
            <p className="text-sm pt-2 text-muted-foreground">
                Remote Sensing and AI-Powered Drone Solutions for Advanced
                Biodiversity Monitoring
            </p>
        </div>
    )
}
