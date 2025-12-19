const TITILER_URL = import.meta.env.VITE_TITILER_URL

export function getRgbXyzUrl(cogUrl: string) {
    const apiRoute = "/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@2x"

    const params = new URLSearchParams({
        url: cogUrl,
        noData: "255",
    })

    return TITILER_URL + apiRoute + "?" + params.toString()
}
