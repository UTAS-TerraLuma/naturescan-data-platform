import { useCallback, useEffect } from "react"

export function useKeyPress(
    key: string,
    onDown: () => void,
    onUp: () => void = () => {},
    options: { ignoreInputFields?: boolean } = { ignoreInputFields: true },
) {
    const shouldIgnoreEvent = useCallback(
        (e: KeyboardEvent) => {
            if (!options.ignoreInputFields) return false

            const target = e.target as HTMLElement
            const tagName = target.tagName.toLowerCase()

            return (
                tagName === "input" ||
                tagName === "textarea" ||
                tagName === "select" ||
                target.isContentEditable
            )
        },
        [options.ignoreInputFields],
    )

    const onDownEvent = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === key && !shouldIgnoreEvent(e)) onDown()
        },
        [key, onDown, shouldIgnoreEvent],
    )

    const onUpEvent = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === key && !shouldIgnoreEvent(e)) onUp()
        },
        [key, onUp, shouldIgnoreEvent],
    )

    useEffect(() => {
        window.addEventListener("keydown", onDownEvent)
        window.addEventListener("keyup", onUpEvent)

        return () => {
            window.removeEventListener("keydown", onDownEvent)
            window.removeEventListener("keyup", onUpEvent)
        }
    }, [onDownEvent, onUpEvent])
}
