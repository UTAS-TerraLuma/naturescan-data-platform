import { DeckGL, type DeckGLRef } from "@deck.gl/react"
import { Map } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { useEffect, useRef } from "react"
import { useDeck } from "@/stores/deck-store"

export function DeckMap() {
    // View State
    const viewState = useDeck((s) => s.viewState)
    const updateViewState = useDeck((s) => s.updateViewState)

    // Canvas size
    const setSize = useDeck((s) => s.setSize)

    // Layers
    const layers = useDeck((s) => s.layers)

    // Deck Ref
    const deckRef = useRef<DeckGLRef>(null)
    const setDeck = useDeck((s) => s.setDeck)
    useEffect(() => {
        if (deckRef.current?.deck) {
            setDeck(deckRef.current.deck)
        }
    }, [deckRef])
    const setIsLoaded = useDeck((s) => s.setIsLoaded)

    return (
        <div onContextMenu={(e) => e.preventDefault()}>
            <DeckGL
                controller
                viewState={viewState}
                layers={layers}
                onViewStateChange={({ viewState }) =>
                    updateViewState(viewState)
                }
                ref={deckRef}
                onResize={(size) => setSize(size)}
                onLoad={() => setIsLoaded(true)}
            >
                <Map mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" />
            </DeckGL>
        </div>
    )
}
