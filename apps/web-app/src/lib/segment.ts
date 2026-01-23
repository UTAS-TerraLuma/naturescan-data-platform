import type { Point2D } from "@/types/spatial"
import * as z from "zod"

const API_URL = import.meta.env.VITE_SEGMENTATION_API

export async function predictSegment(point: Point2D, url: string) {
    const body = {
        url,
        points: [point],
        labels: [1],
    }

    const response = await fetch(`${API_URL}/segment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })

    const data = await response.json()

    // A ring is an array of points (in this case 2D)
    const ringSchema = z.array(z.tuple([z.number(), z.number()]))
    // Polygon is an array of rings
    const polygonSchema = z.array(ringSchema)
    // Response returns an array of polygons
    const responseSchema = z.object({
        polygons: z.array(polygonSchema),
    })

    return responseSchema.parse(data)
}
