import type { BoxCorners, VisualPrompt } from "./-types"
import { IMAGE_SIZE } from "./route"

function roundAndClampBoxCorners(boxCorners: BoxCorners): BoxCorners {
    let [[x1, y1], [x2, y2]] = boxCorners
    x1 = Math.round(x1)
    x2 = Math.round(x2)
    y1 = Math.round(y1)
    y2 = Math.round(y2)

    x1 = Math.max(0, Math.min(IMAGE_SIZE - 1, x1))
    x2 = Math.max(0, Math.min(IMAGE_SIZE - 1, x2))
    y1 = Math.max(0, Math.min(IMAGE_SIZE - 1, y1))
    y2 = Math.max(0, Math.min(IMAGE_SIZE - 1, y2))

    return [
        [x1, y1],
        [x2, y2],
    ]
}

export function getVisualPrompt(boxCorners: BoxCorners): VisualPrompt {
    const [[x1, y1], [x2, y2]] = roundAndClampBoxCorners(boxCorners)

    return {
        bbox: {
            xmin: Math.min(x1, x2),
            ymin: Math.min(y1, y2),
            xmax: Math.max(x1, x2),
            ymax: Math.max(y1, y2),
        },
        points: [],
    }
}
