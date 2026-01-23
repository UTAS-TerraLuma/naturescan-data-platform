import type { Bounds } from "@/types/spatial"
import * as z from "zod"

const TITILER_URL = import.meta.env.VITE_TILES_API
const XYZ_TILES_ROUTE = "/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@2x.png"

export function getRgbXyzUrl(cogUrl: string) {
    return createTitilerUrl(XYZ_TILES_ROUTE, {
        url: cogUrl,
        // nodata: 255,
    })
}

export function getTilesUrl(cogUrl: string, params: SearchParams = {}) {
    return createTitilerUrl(XYZ_TILES_ROUTE, {
        url: cogUrl,
        ...params,
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

type SearchParams = Record<string, string | number | Array<string | number>>

export function createTitilerUrl(
    apiRoute: string,
    searchParams: SearchParams = {},
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

// export
