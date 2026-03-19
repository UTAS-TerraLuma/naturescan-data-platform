import type WebMercatorViewport from "@math.gl/web-mercator"
import type {
    BBoxPrompt,
    ConceptPrompt,
    PointPrompt,
    Prompt,
    VisualPrompt,
} from "./-prompt-types"
import type {
    SegmentationFeature,
    SegmentationResult,
} from "./-segment-result-schema"
import { bboxObjToBounds, type BBoxObj } from "@/lib/spatial-utils"

function projectBBox(
    bbox: BBoxPrompt,
    viewport: WebMercatorViewport,
): BBoxPrompt {
    const { xmin, ymin, xmax, ymax } = bbox

    // Ymin and ymax are swapped in lng,lat
    const [pxmin, pymax] = viewport.project([xmin, ymin])
    const [pxmax, pymin] = viewport.project([xmax, ymax])

    return {
        xmin: Math.round(pxmin),
        ymin: Math.round(pymin),
        xmax: Math.round(pxmax),
        ymax: Math.round(pymax),
        label: bbox.label,
    }
}

function projectPoint(
    point: PointPrompt,
    viewport: WebMercatorViewport,
): PointPrompt {
    const [px, py] = viewport.project([point.x, point.y])
    return { x: Math.round(px), y: Math.round(py), label: point.label }
}

function projectVisualPrompt(
    prompt: VisualPrompt,
    viewport: WebMercatorViewport,
): VisualPrompt {
    return {
        type: "visual",
        bbox: prompt.bbox ? projectBBox(prompt.bbox, viewport) : null,
        points: prompt.points.map((p) => projectPoint(p, viewport)),
    }
}

function projectConceptPrompt(
    prompt: ConceptPrompt,
    viewport: WebMercatorViewport,
): ConceptPrompt {
    return {
        type: "concept",
        text: prompt.text,
        exemplars: prompt.exemplars.map((b) => projectBBox(b, viewport)),
    }
}

export function projectPrompt(
    prompt: Prompt | null,
    viewport: WebMercatorViewport,
): Prompt | null {
    if (!prompt) {
        return prompt
    }

    if (prompt.type == "visual") {
        return projectVisualPrompt(prompt, viewport)
    } else {
        return projectConceptPrompt(prompt, viewport)
    }
}

function unprojectBBox(
    bbox: BBoxPrompt,
    viewport: WebMercatorViewport,
): BBoxPrompt {
    const [xmin, ymin] = viewport.unproject([bbox.xmin, bbox.ymax])
    const [xmax, ymax] = viewport.unproject([bbox.xmax, bbox.ymin])

    return {
        xmin,
        ymin,
        xmax,
        ymax,
        label: bbox.label,
    }
}

function unprojectPoint(
    point: PointPrompt,
    viewport: WebMercatorViewport,
): PointPrompt {
    const [x, y] = viewport.unproject([point.x, point.y])
    return { x, y, label: point.label }
}

function unprojectVisualPrompt(
    prompt: VisualPrompt,
    viewport: WebMercatorViewport,
): VisualPrompt {
    return {
        type: "visual",
        bbox: prompt.bbox ? unprojectBBox(prompt.bbox, viewport) : null,
        points: prompt.points.map((p) => unprojectPoint(p, viewport)),
    }
}

function unprojectConceptPrompt(
    prompt: ConceptPrompt,
    viewport: WebMercatorViewport,
): ConceptPrompt {
    return {
        type: "concept",
        text: prompt.text,
        exemplars: prompt.exemplars.map((b) => unprojectBBox(b, viewport)),
    }
}

export function unprojectPrompt(
    prompt: Prompt | null,
    viewport: WebMercatorViewport,
): Prompt | null {
    if (!prompt) {
        return prompt
    }

    if (prompt.type == "visual") {
        return unprojectVisualPrompt(prompt, viewport)
    } else {
        return unprojectConceptPrompt(prompt, viewport)
    }
}

export function unprojectResultToFeature(
    segmentation: SegmentationResult,
    viewport: WebMercatorViewport,
): SegmentationFeature {
    const { x1, x2, y1, y2 } = segmentation.result.box
    const pixelBox: BBoxObj = {
        xmin: Math.min(x1, x2),
        ymin: Math.min(y1, y2),
        xmax: Math.max(x1, x2),
        ymax: Math.max(y1, y2),
    }

    const linearRing: [number, number][] = segmentation.result.polygon.map(
        (point) => viewport.unproject(point) as [number, number],
    )

    const feature: SegmentationFeature = {
        type: "Feature",
        bbox: bboxObjToBounds(unprojectBBox(pixelBox, viewport)),
        properties: {
            id: segmentation.id,
            image: segmentation.image,
            prompt: unprojectPrompt(
                segmentation.prompt as Prompt | null,
                viewport,
            ),
            confidence: segmentation.result.confidence,
            pixelBox,
        },
        geometry: {
            type: "Polygon",
            coordinates: [linearRing],
        },
    }

    return feature
}
