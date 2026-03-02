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
    type ImageExemplarPrompt,
    type PointPrompt,
    type PredictionResult,
    type PredictionResults,
    type PromptMode,
} from "./-types"
import { ImageStatusIndicator } from "./-components/ImageStatusIndicator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Kbd } from "@/components/ui/kbd"
import { getBBoxPrompt, roundAndClampCoords } from "./-utils"
import { useKeyPress } from "@/hooks/useKeyPress"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
    const [pvsSimpleMode, setPvsSimpleMode] = useState(true)
    const [hasAutoSegmented, setHasAutoSegmented] = useState(false)

    // ---- Prediction Mutations
    const [predictionResults, setPredictionResults] =
        useState<PredictionResults>([])
    const addResults = (newResults: PredictionResults) =>
        setPredictionResults((oldResults) => [...oldResults, ...newResults])
    const removeResults = (id: string | string[]) =>
        setPredictionResults((results) =>
            results.filter((d) =>
                Array.isArray(id) ? !id.includes(d.id) : d.id !== id,
            ),
        )
    const [selectedResults, setSelectedResults] = useState<string[]>([])

    // ---- PVS Prompt State ----
    const [pvsBoxCorners, setPvsBoxCorners] =
        useState<BoxCorners>(EMPTY_BOX_CORNERS)
    // These are used when not in simple mode
    const [pvsBboxPrompt, setPvsBboxPrompt] = useState<BBoxPrompt | null>(null)
    const [pvsPoints, setPvsPoints] = useState<PointPrompt[]>([])
    const isPvsPrompts = pvsPoints.length > 0 || pvsBboxPrompt != null
    const clearPvsState = () => {
        // Rest all prompt state holders
        setPvsBoxCorners(EMPTY_BOX_CORNERS)
        setPvsBboxPrompt(null)
        setPvsPoints([])
    }

    // ---- PVS Mutations ----
    const pvsMutation = useMutation({
        mutationFn: predictPVS,
        onSuccess: addResults,
        onError: (err) => console.error("PVS error:", err),
        onSettled: clearPvsState,
    })

    const pvsComplexPredict = useCallback(() => {
        // Only call when in PVS mode and not in simple mode
        if (!(mode == "pvs" && !pvsSimpleMode)) return

        pvsMutation.mutate({
            bbox: pvsBboxPrompt,
            points: pvsPoints,
        })
    }, [mode, pvsSimpleMode, pvsBboxPrompt, pvsPoints, pvsMutation])

    // ---- PCS State ----
    const [pcsBoxCorners, setPcsBoxCorners] =
        useState<BoxCorners>(EMPTY_BOX_CORNERS)
    const [pcsExemplars, setPcsExemplars] = useState<ImageExemplarPrompt[]>([])
    const [pcsNounPhrase, setPcsNounPhrase] = useState("")
    const isPcsPrompts =
        pcsExemplars.length > 0 || pcsNounPhrase.trim().length > 0

    const clearPcsState = () => {
        setPcsBoxCorners(EMPTY_BOX_CORNERS)
        setPcsExemplars([])
        setPcsNounPhrase("")
    }

    const pcsMutation = useMutation({
        mutationFn: predictPCS,
        onSuccess: addResults,
        onError: (err) => console.error("PCS error:", err),
        onSettled: clearPcsState,
    })

    const pcsPredict = useCallback(() => {
        if (mode !== "pcs") return
        pcsMutation.mutate({
            nounPhrase: pcsNounPhrase,
            imageExemplars: pcsExemplars,
        })
    }, [mode, pcsNounPhrase, pcsExemplars, pcsMutation])

    // --- Keyboard Handling ----

    const [isShiftPressed, setIsShiftPressed] = useState(false)

    useKeyPress(
        "Shift",
        () => setIsShiftPressed(true),
        () => setIsShiftPressed(false),
    )

    useKeyPress("Delete", () => {
        removeResults(selectedResults)
        setSelectedResults([])
    })

    const handleEnter = useCallback(() => {
        if (mode === "pvs") pvsComplexPredict()
        else if (mode === "pcs") pcsPredict()
    }, [mode, pvsComplexPredict, pcsPredict])

    useKeyPress("Enter", handleEnter)

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

    const pcsBoxLayer = new PolygonLayer<BoxCorners>({
        id: "pcs-bbox",
        data: [pcsBoxCorners],
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
        getFillColor: isShiftPressed ? [255, 0, 0, 50] : [0, 255, 0, 50],
        stroked: true,
        getLineColor: isShiftPressed ? [255, 0, 0] : [0, 255, 0],
        visible: mode === "pcs" && pcsBoxCorners !== EMPTY_BOX_CORNERS,
    })

    const pcsExemplarsLayer = new PolygonLayer<ImageExemplarPrompt>({
        id: "pcs-exemplars",
        data: pcsExemplars,
        getPolygon: (d) => [
            [d.xmin, d.ymin],
            [d.xmax, d.ymin],
            [d.xmax, d.ymax],
            [d.xmin, d.ymax],
            [d.xmin, d.ymin],
        ],
        filled: true,
        getFillColor: (d) => (d.label ? [0, 255, 0, 50] : [255, 0, 0, 50]),
        stroked: true,
        getLineColor: (d) => (d.label ? [0, 255, 0] : [255, 0, 0]),
        visible: mode === "pcs",
    })

    const predictionResultsLayer = new PolygonLayer<PredictionResult>({
        id: "prediction-results-layer",
        data: predictionResults,
        getPolygon: (d) => d.result.polygon,
        filled: true,
        getFillColor: [0, 0, 255, 50],
        stroked: true,
        getLineColor: [0, 0, 255],

        getLineWidth: (d) => (selectedResults.includes(d.id) ? 3 : 1),
        lineWidthUnits: "pixels",
        pickable: true,

        onClick: (info, event) => {
            // @ts-ignore
            if (!event.leftButton) return

            if (!info.object) return
            const { id } = info.object as PredictionResult

            if (isShiftPressed) {
                setSelectedResults((s) => [...s, id])
            } else {
                setSelectedResults([id])
            }
        },

        updateTriggers: {
            getLineWidth: selectedResults,
        },
    })

    return (
        <FullscreenLayout className="bg-neutral-200">
            <div onContextMenu={(e) => e.preventDefault()}>
                <DeckGL
                    initialViewState={INITIAL_VIEW_STATE}
                    views={orthoView}
                    layers={[
                        imageLayer,
                        pvsBoxLayer,
                        pvsPointsLayer,
                        pcsExemplarsLayer,
                        pcsBoxLayer,
                        predictionResultsLayer,
                    ]}
                    controller={{
                        dragPan: true,
                    }}
                    onClick={(info, event) => {
                        // Only handle left button clicks
                        if (!event.rightButton) return

                        if (mode == "pvs") {
                            const [x, y] = roundAndClampCoords(info.coordinate!)
                            if (pvsSimpleMode) {
                                // In simple mode, call predict straight away
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
                                const [x, y] = info.coordinate!
                                setPcsBoxCorners([
                                    [x, y],
                                    [x, y],
                                ])
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
                                const [x, y] = info.coordinate!
                                setPcsBoxCorners((b) => [b[0], [x, y]])
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
                                if (pvsSimpleMode) {
                                    // In simple mode, call the prediction straight away
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
                                    // In non simple mode, set the bbox prompt
                                    setPvsBboxPrompt(
                                        getBBoxPrompt(pvsBoxCorners),
                                    )
                                }
                            } else if (mode == "pcs") {
                                const exemplar: ImageExemplarPrompt = {
                                    ...getBBoxPrompt(pcsBoxCorners),
                                    label: !isShiftPressed,
                                }
                                setPcsExemplars((e) => [...e, exemplar])
                                setPcsBoxCorners(EMPTY_BOX_CORNERS)
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
                            <Label htmlFor="pvs-complex-mode">
                                Simple Mode
                            </Label>
                            <Switch
                                id="pvs-complex-mode"
                                checked={pvsSimpleMode}
                                onCheckedChange={(b) => setPvsSimpleMode(b)}
                            ></Switch>
                        </div>

                        {pvsSimpleMode ? (
                            <Button
                                onClick={() => {
                                    pvsMutation.mutate(null, {
                                        onSettled: () =>
                                            setHasAutoSegmented(true),
                                    })
                                }}
                                disabled={hasAutoSegmented}
                            >
                                Auto Segment
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    onClick={pvsComplexPredict}
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
                {mode === "pcs" && (
                    <>
                        <div className="flex gap-3 items-center">
                            <Label htmlFor="pcs-noun-phrase">Noun Phrase</Label>
                            <Input
                                id="pcs-noun-phrase"
                                value={pcsNounPhrase}
                                onChange={(e) =>
                                    setPcsNounPhrase(e.target.value)
                                }
                                placeholder="e.g. red car"
                                className="w-40"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={pcsPredict}
                                disabled={!isPcsPrompts}
                                variant="outline"
                                size="lg"
                            >
                                Predict
                                <Kbd>⏎</Kbd>
                            </Button>
                            <Button
                                onClick={clearPcsState}
                                disabled={!isPcsPrompts}
                                variant="ghost"
                                size="lg"
                            >
                                Clear
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <div className="absolute bottom-0 left-0 bg-background text-foreground p-3">
                <ImageStatusIndicator status={setImageMutation.status} />
            </div>
        </FullscreenLayout>
    )
}
