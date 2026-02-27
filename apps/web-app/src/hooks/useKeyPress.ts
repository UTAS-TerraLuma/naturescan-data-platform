import { useCallback, useEffect } from "react"

export function useKeyPress(
    key: string,
    onDown: () => void,
    onUp: () => void = () => {},
) {
    const onDownEvent = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === key) onDown()
        },
        [key, onDown],
    )

    const onUpEvent = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === key) onUp()
        },
        [key, onUp],
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
