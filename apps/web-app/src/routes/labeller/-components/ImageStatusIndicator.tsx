export function ImageStatusIndicator({
    status,
}: {
    status: "error" | "idle" | "pending" | "success"
}) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {status == "pending" && (
                <>
                    <span className="size-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-muted-foreground">
                        Creating image embeddings
                    </span>
                </>
            )}
            {status == "success" && (
                <>
                    <span className="size-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Image ready</span>
                </>
            )}
            {status == "error" && (
                <>
                    <span className="size-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">
                        Failed to load image
                    </span>
                </>
            )}
        </div>
    )
}
