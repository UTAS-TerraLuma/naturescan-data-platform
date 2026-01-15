import type { Bounds } from "@/types/spatial"

export function getCombinedBounds(bounds: Bounds[]): Bounds {
    let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]

    bounds.forEach(([b0, b1, b2, b3]) => {
        if (b0 < xMin) xMin = b0
        if (b1 < yMin) yMin = b1
        if (b2 > xMax) xMax = b2
        if (b3 > yMax) yMax = b3
    })

    return [xMin, yMin, xMax, yMax]
}

export function polygonFromBounds(bounds: Bounds): [number, number][] {
    const [xMin, yMin, xMax, yMax] = bounds
    return [
        [xMin, yMin],
        [xMax, yMin],
        [xMax, yMax],
        [xMin, yMax],
        [xMin, yMin],
    ]
}
