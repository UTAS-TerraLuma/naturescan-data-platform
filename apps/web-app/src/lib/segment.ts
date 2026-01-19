import type { Point2D } from "@/types/spatial"

const API_URL = "http://localhost:8003"

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

    console.log(data)

    return data
}
