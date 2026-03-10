import { Eye, EyeClosed } from "lucide-react"

export function AssetCard({
    title,
    isActive,
    onClick,
}: {
    title: string
    isActive: boolean
    onClick: () => void
}) {
    return (
        <div className="bg-white rounded-sm ring ring-foreground/10 p-3 relative">
            <button className="absolute inset-0" onClick={onClick}></button>
            <div className="flex justify-between">
                <h3>{title}</h3>
                {isActive ? (
                    <Eye />
                ) : (
                    <EyeClosed className="text-foreground/50" />
                )}
            </div>
        </div>
    )
}
