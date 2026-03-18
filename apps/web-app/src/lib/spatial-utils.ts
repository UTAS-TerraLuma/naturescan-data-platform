export type Point2D = [number, number]
// minx, miny, maxx, maxy
export type Bounds = [number, number, number, number]
export type BoxCorners = [[number, number], [number, number]]

export type BBoxObj = {
    xmin: number
    ymin: number
    xmax: number
    ymax: number
}

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

export function polygonFromBounds(bounds: Bounds): Point2D[] {
    const [xMin, yMin, xMax, yMax] = bounds
    return [
        [xMin, yMin],
        [xMax, yMin],
        [xMax, yMax],
        [xMin, yMax],
        [xMin, yMin],
    ]
}

export function polygonFromBoxCorners(corners: BoxCorners): Point2D[] {
    return [
        corners[0],
        [corners[1][0], corners[0][1]],
        corners[1],
        [corners[0][0], corners[1][1]],
        corners[0],
    ]
}

export function polygonFromBBoxObj(bbox: BBoxObj): Point2D[] {
    return [
        [bbox.xmin, bbox.ymin],
        [bbox.xmax, bbox.ymin],
        [bbox.xmax, bbox.ymax],
        [bbox.xmin, bbox.ymax],
        [bbox.xmin, bbox.ymin],
    ]
}

export function getCentreFromBbox(bbox: Bounds): Point2D {
    return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]
}

export function boundsToCorners(bounds: Bounds): BoxCorners {
    return [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
    ]
}

export function cornersToBounds(corners: BoxCorners): Bounds {
    const x0 = corners[0][0]
    const y0 = corners[0][1]
    const x1 = corners[1][0]
    const y1 = corners[1][1]

    const xMin = Math.min(x0, x1)
    const yMin = Math.min(y0, y1)
    const xMax = Math.max(x0, x1)
    const yMax = Math.max(y0, y1)

    return [xMin, yMin, xMax, yMax]
}
