import type { Bounds } from "@/types/spatial"
import * as z from "zod"

const TITILER_URL = import.meta.env.VITE_TITILER_URL

export function getRgbXyzUrl(cogUrl: string) {
    return createTitilerUrl("/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@2x", {
        url: cogUrl,
        // nodata: 255,
    })
}

export async function getCogBoundsWGS84(cogUrl: string): Promise<Bounds> {
    const url = createTitilerUrl("/cog/info.geojson", {
        url: cogUrl,
    })
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
    })
    const data = await response.json()
    const schema = z.object({
        bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    })
    const boundsData = schema.parse(data)
    return boundsData.bbox
}

function createTitilerUrl(
    apiRoute: string,
    searchParams: Record<string, string | number | Array<string | number>>,
): string {
    const params = new URLSearchParams()

    for (let key in searchParams) {
        const value = searchParams[key]
        if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)))
        } else {
            params.set(key, String(value))
        }
    }

    const url = TITILER_URL + apiRoute + "?" + params.toString()

    return url
}
