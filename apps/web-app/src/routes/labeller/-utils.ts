import type { Point2D } from "@/types/spatial"
import type { BBoxPrompt, BoxCorners } from "./-types"
import { IMAGE_SIZE } from "./route"

export function roundAndClampCoords([_x, _y]: number[]): Point2D {
    let x = Math.round(_x)
    let y = Math.round(_y)

    x = Math.max(0, Math.min(IMAGE_SIZE - 1, x))
    y = Math.max(0, Math.min(IMAGE_SIZE - 1, y))

    return [x, y]
}

function roundAndClampBoxCorners(boxCorners: BoxCorners): BoxCorners {
    let [[x1, y1], [x2, y2]] = boxCorners

    return [roundAndClampCoords([x1, y1]), roundAndClampCoords([x2, y2])]
}

export function getBBoxPrompt(boxCorners: BoxCorners): BBoxPrompt {
    const [[x1, y1], [x2, y2]] = roundAndClampBoxCorners(boxCorners)

    return {
        xmin: Math.min(x1, x2),
        ymin: Math.min(y1, y2),
        xmax: Math.max(x1, x2),
        ymax: Math.max(y1, y2),
    }
}
