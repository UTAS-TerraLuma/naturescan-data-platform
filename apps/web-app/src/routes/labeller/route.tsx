import { FullscreenLayout } from "@/components/layouts/fullscreen-layout"
import { OrthographicView, type OrthographicViewState } from "@deck.gl/core"
import { BitmapLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import DeckGL from "@deck.gl/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import { predictPCS, predictPVS, setImage } from "./-api"
import {
    labellerSearchSchema,
    type BBoxPrompt,
    type BoxCorners,
    type PointPrompt,
    type PromptMode,
    type PVSResult,
} from "./-types"
import { ImageStatusIndicator } from "./-components/ImageStatusIndicator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Kbd } from "@/components/ui/kbd"
import { getBBoxPrompt, roundAndClampCoords } from "./-utils"
import { useKeyPress } from "@/hooks/useKeyPress"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

// ---- Constants ----
export const IMAGE_SIZE = 1036
const INITIAL_VIEW_STATE: OrthographicViewState = {
    target: [IMAGE_SIZE / 2, IMAGE_SIZE / 2],
    zoom: 0,
}
const EMPTY_BOX_CORNERS: BoxCorners = [
    [0, 0],
    [0, 0],
]

// ---- Route ----
export const Route = createFileRoute("/labeller")({
    component: RouteComponent,
    validateSearch: labellerSearchSchema,
})

// --- DeckGL view ---
const orthoView = new OrthographicView({ controller: true, flipY: true })

// --- Main Component ---
function RouteComponent() {
    const { imageUrl } = Route.useSearch()

    // ---- Set Image -----
    const setImageMutation = useMutation({
        mutationFn: () => setImage(imageUrl),
    })
    useEffect(() => {
        setImageMutation.mutate()
    }, [imageUrl])

    // ---- Prompt Mode ----
    const [mode, setMode] = useState<PromptMode>("pvs")
    const [pvsAutoMode, setPvsAutoMode] = useState(true)

    // ---- PVS Prompt State ----
    const [pvsBoxCorners, setPvsBoxCorners] =
        useState<BoxCorners>(EMPTY_BOX_CORNERS)
    // These are used when not in auto mode
    const [pvsBboxPrompt, setPvsBboxPrompt] = useState<BBoxPrompt | null>(null)
    const [pvsPoints, setPvsPoints] = useState<PointPrompt[]>([])
    const isPvsPrompts = pvsPoints.length > 0 || pvsBboxPrompt != null
    const clearPvsState = () => {
        // Rest all prompt state holders
        setPvsBoxCorners(EMPTY_BOX_CORNERS)
        setPvsBboxPrompt(null)
        setPvsPoints([])
    }

    // ---- Prediction Mutations
    const [pvsResults, setPvsResults] = useState<PVSResult[]>([])

    const pvsMutation = useMutation({
        mutationFn: predictPVS,
        onSuccess: (result: PVSResult) => (
            console.log(result),
            setPvsResults((r) => [...r, result])
        ),
        onError: (err) => console.error("PVS error:", err),
        onSettled: clearPvsState,
    })

    const pvsNonAutoPredict = () => {
        // Only call when in PVS mode and note in auto mode
        if (!(mode == "pvs" && !pvsAutoMode)) return

        pvsMutation.mutate({
            bbox: pvsBboxPrompt,
            points: pvsPoints,
        })
    }

    // ---- PCS State ----

    // --- DeckGL Layers ---
    const imageLayer = new BitmapLayer({
        id: "image-layer",
        // left bottom right top
        bounds: [0, IMAGE_SIZE, IMAGE_SIZE, 0],
        image: imageUrl,
        textureParameters: { minFilter: "nearest", magFilter: "nearest" },
        pickable: false,
    })

    const pvsBoxLayer = new PolygonLayer<BoxCorners>({
        id: "pvs-bbox",
        data: [pvsBoxCorners],
        getPolygon: (d) => {
            const [[x1, y1], [x2, y2]] = d
            return [
                [x1, y1],
                [x2, y1],
                [x2, y2],
                [x1, y2],
                [x1, y1],
            ]
        },
        filled: true,
        getFillColor: [0, 0, 0, 50],
        stroked: true,
        getLineColor: [0, 0, 0],
        visible: mode == "pvs" && pvsBoxCorners != EMPTY_BOX_CORNERS,
    })

    const pvsPointsLayer = new ScatterplotLayer<PointPrompt>({
        id: "pvs-points",
        data: pvsPoints,
        getPosition: (d) => [d.x, d.y],
        getRadius: 5,
        radiusUnits: "pixels",
        getFillColor: (d) => (d.label ? [0, 255, 0] : [255, 0, 0]),
    })

    const pvsResultsLayer = new PolygonLayer<PVSResult>({
        id: "pvs-results-layer",
        data: pvsResults,
        getPolygon: (d) => {
            const segments = d.results[0][0].segments

            let coords = segments.x.map((x, i) => [x, segments.y[i]])
            coords.push([segments.x[0], segments.y[0]])

            return coords
        },
        filled: true,
        getFillColor: [0, 0, 255, 50],
        stroked: true,
        getLineColor: [0, 0, 255],
    })

    // --- shift button ----

    const [isShiftPressed, setIsShiftPressed] = useState(false)

    useKeyPress(
        "Shift",
        () => setIsShiftPressed(true),
        () => setIsShiftPressed(false),
    )

    // useKeyPress("v", () => setMode("pvs"))
    // useKeyPress("c", () => setMode("pcs"))
    // useKeyPress("a", () => setPvsAutoMode((b) => !b))
    useKeyPress("Enter", pvsNonAutoPredict)

    return (
        <FullscreenLayout className="bg-neutral-200">
            <div onContextMenu={(e) => e.preventDefault()}>
                <DeckGL
                    initialViewState={INITIAL_VIEW_STATE}
                    views={orthoView}
                    layers={[
                        imageLayer,
                        pvsBoxLayer,
                        pvsResultsLayer,
                        pvsPointsLayer,
                    ]}
                    controller={{
                        dragPan: true,
                    }}
                    onClick={(info, event) => {
                        // Only handle left button clicks
                        if (!event.leftButton) return

                        if (mode == "pvs") {
                            const [x, y] = roundAndClampCoords(info.coordinate!)
                            if (pvsAutoMode) {
                                // On auto mode, call predict straight away
                                pvsMutation.mutate({
                                    bbox: null,
                                    points: [{ x, y, label: true }],
                                })
                            } else {
                                // Otherwise set the prompt
                                const label = !isShiftPressed
                                setPvsPoints((p) => [...p, { x, y, label }])
                            }
                        }
                    }}
                    onDragStart={(info, event) => {
                        // If left or middle button drag will pan as normal
                        if (event.leftButton || event.middleButton) return

                        // If right button we hijack the drag
                        if (event.rightButton) {
                            event.stopImmediatePropagation()

                            if (mode == "pvs") {
                                const [x, y] = info.coordinate!
                                setPvsBoxCorners([
                                    [x, y],
                                    [x, y],
                                ])
                            } else if (mode == "pcs") {
                                console.log(event)
                            }
                        }
                    }}
                    onDrag={(info, event) => {
                        // If left or middle button drag will pan as normal
                        if (event.leftButton || event.middleButton) return

                        // If right button we hijack the drag
                        if (event.rightButton) {
                            event.stopImmediatePropagation()
                            if (mode == "pvs") {
                                const [x, y] = info.coordinate!
                                setPvsBoxCorners((b) => [b[0], [x, y]])
                            } else if (mode == "pcs") {
                                console.log(event)
                            }
                        }
                    }}
                    onDragEnd={(_info, event) => {
                        // If left or middle button drag will pan as normal
                        if (event.leftButton || event.middleButton) return

                        // If right button we hijack the drag
                        if (event.rightButton) {
                            event.stopImmediatePropagation()

                            if (mode == "pvs") {
                                if (pvsAutoMode) {
                                    // In auto mode, call the prediction straight away
                                    pvsMutation.mutate(
                                        {
                                            bbox: getBBoxPrompt(pvsBoxCorners),
                                            points: [],
                                        },
                                        {
                                            onSettled: () =>
                                                setPvsBoxCorners(
                                                    EMPTY_BOX_CORNERS,
                                                ),
                                        },
                                    )
                                } else {
                                    // In non auto mode, set the bbox prompt
                                    setPvsBboxPrompt(
                                        getBBoxPrompt(pvsBoxCorners),
                                    )
                                }
                            }
                        }
                    }}
                />
            </div>

            <div className="absolute top-0 left-0 bg-background text-foreground p-3 space-y-3">
                <div className="flex gap-3">
                    <Label>Segmentation Mode</Label>
                    <Tabs value={mode} onValueChange={(v) => setMode(v)}>
                        <TabsList>
                            <TabsTrigger value="pvs">Visual</TabsTrigger>
                            <TabsTrigger value="pcs">Concept</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                {mode == "pvs" && (
                    <>
                        <div className="flex gap-3">
                            <Label htmlFor="pvs-complex-mode">Auto Mode</Label>
                            <Switch
                                id="pvs-complex-mode"
                                checked={pvsAutoMode}
                                onCheckedChange={(b) => setPvsAutoMode(b)}
                            ></Switch>
                        </div>
                        {!pvsAutoMode && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={pvsNonAutoPredict}
                                    disabled={!isPvsPrompts}
                                    variant="outline"
                                    size="lg"
                                >
                                    Predict
                                    <Kbd>⏎</Kbd>
                                </Button>
                                <Button
                                    onClick={clearPvsState}
                                    disabled={!isPvsPrompts}
                                    variant="ghost"
                                    size="lg"
                                >
                                    Clear
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="absolute bottom-0 left-0 bg-background text-foreground p-3">
                <ImageStatusIndicator status={setImageMutation.status} />
            </div>
        </FullscreenLayout>
    )
}
