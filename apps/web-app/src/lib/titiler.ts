import type { Bounds } from "@/types/spatial"
import * as z from "zod"

const TITILER_URL = import.meta.env.VITE_TITILER_URL

export function getRgbXyzUrl(cogUrl: string) {
    return createTitilerUrl("/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@2x", {
        url: cogUrl,
        noData: "255",
    })
}

// export async function validateCog(cogUrl: string) {
//     const url = createTitilerUrl("/cog/validate", {
//         url: cogUrl,
//     })

//     const response = await fetch(url)
//     const data = await response.json()

//     return data
// }

export async function getCogBounds(cogUrl: string): Promise<Bounds> {
    const url = createTitilerUrl("/cog/info", {
        url: cogUrl,
    })

    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
    })
    const data = await response.json()

    const schema = z.object({
        crs: z.string(),
        bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    })

    const boundsData = schema.parse(data)

    return boundsData.bounds
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

    return TITILER_URL + apiRoute + "?" + params.toString()
}
