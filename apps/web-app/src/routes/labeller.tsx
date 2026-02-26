import { FullscreenLayout } from "@/components/layouts/fullscreen-layout"
import { OrthographicView, type OrthographicViewState } from "@deck.gl/core"
import { BitmapLayer } from "@deck.gl/layers"
import DeckGL from "@deck.gl/react"
import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod"

const labellerSearchSchema = z.object({
    imageUrl: z.url(),
})

export const Route = createFileRoute("/labeller")({
    component: RouteComponent,
    validateSearch: labellerSearchSchema,
})

const orthoView = new OrthographicView({ controller: true, flipY: false })

const INITIAL_VIEW_STATE: OrthographicViewState = {
    target: [0, 0],
    zoom: 0,
}

const IMAGE_SIZE = 1036

function RouteComponent() {
    const { imageUrl } = Route.useSearch()

    const imageLayer = new BitmapLayer({
        id: "image-layer",
        bounds: [
            -IMAGE_SIZE / 2,
            -IMAGE_SIZE / 2,
            IMAGE_SIZE / 2,
            IMAGE_SIZE / 2,
        ],
        image: imageUrl,
        textureParameters: {
            minFilter: "nearest",
            magFilter: "nearest",
        },
    })

    return (
        <FullscreenLayout>
            <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                views={orthoView}
                layers={[imageLayer]}
            ></DeckGL>
        </FullscreenLayout>
    )
}
