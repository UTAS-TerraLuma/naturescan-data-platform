const TITILER_URL = import.meta.env.VITE_TILES_API
const XYZ_TILES_ROUTE = "/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@2x.png"

export function getTilesUrl(cogUrl: string, params: SearchParams = {}) {
    return createTitilerUrl(XYZ_TILES_ROUTE, {
        url: cogUrl,
        ...params,
    })
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
