import { FullscreenLayout } from "@/components/layouts/fullscreen-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { OrthographicView, type OrthographicViewState } from "@deck.gl/core"
import { BitmapLayer, PathLayer, ScatterplotLayer } from "@deck.gl/layers"
import DeckGL from "@deck.gl/react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import * as z from "zod"

// --- Constants ---
const INITIAL_VIEW_STATE: OrthographicViewState = {
    target: [0, 0],
    zoom: 0,
}
const IMAGE_SIZE = 1036

// --- Route & Search Params ---
const labellerSearchSchema = z.object({
    imageUrl: z.url(),
})
export const Route = createFileRoute("/labeller")({
    component: RouteComponent,
    validateSearch: labellerSearchSchema,
})

// --- Types ---
interface PointPrompt {
    x: number
    y: number
    label: boolean
}

interface BBoxPrompt {
    xmin: number
    ymin: number
    xmax: number
    ymax: number
}

interface VisualPrompt {
    bbox: BBoxPrompt | null
    points: PointPrompt[]
}

interface ImageExemplarPrompt extends BBoxPrompt {
    label: boolean
}

interface ConceptPrompt {
    nounPhrase: string
    imageExemplars: ImageExemplarPrompt[]
}

// --- Coordinate utils (module-level, depend only on IMAGE_SIZE constant) ---
function worldToPixel(wx: number, wy: number): [number, number] {
    return [
        Math.round(wx + IMAGE_SIZE / 2),
        Math.round(IMAGE_SIZE / 2 - wy),
    ]
}

function pixelToWorld(px: number, py: number): [number, number] {
    return [px - IMAGE_SIZE / 2, IMAGE_SIZE / 2 - py]
}

function bboxToPath(bbox: BBoxPrompt): [number, number][] {
    const tl = pixelToWorld(bbox.xmin, bbox.ymin)
    const tr = pixelToWorld(bbox.xmax, bbox.ymin)
    const br = pixelToWorld(bbox.xmax, bbox.ymax)
    const bl = pixelToWorld(bbox.xmin, bbox.ymax)
    return [tl, tr, br, bl, tl]
}

function previewPathFromWorld(
    start: [number, number],
    end: [number, number],
): [number, number][] {
    const [x1, y1] = start
    const [x2, y2] = end
    return [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]]
}

function clampPixel(v: number): number {
    return Math.max(0, Math.min(IMAGE_SIZE - 1, v))
}

// --- DeckGL view ---
const orthoView = new OrthographicView({ controller: true, flipY: false })

// --- API stubs ---
async function promptableVisualSegmentation(visualPrompts: VisualPrompt[]) {
    console.log("PVS submit:", visualPrompts)
    return {}
}

async function promptableConceptSegmentation(conceptPrompt: ConceptPrompt) {
    console.log("PCS submit:", conceptPrompt)
    return {}
}

// --- Main Component ---
function RouteComponent() {
    const { imageUrl } = Route.useSearch()

    // --- Refs (for stale-closure-safe DOM event handlers) ---
    const deckRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const isShiftHeldRef = useRef(false)
    const modeRef = useRef<"pvs" | "pcs">("pvs")
    const visualPromptsRef = useRef<VisualPrompt[]>([{ bbox: null, points: [] }])
    const currentPromptIdxRef = useRef(0)
    const imageExemplarsRef = useRef<ImageExemplarPrompt[]>([])
    const nounPhraseRef = useRef("")

    // --- State ---
    const [mode, setMode] = useState<"pvs" | "pcs">("pvs")
    const [visualPrompts, setVisualPrompts] = useState<VisualPrompt[]>([
        { bbox: null, points: [] },
    ])
    const [currentPromptIdx, setCurrentPromptIdx] = useState(0)
    const [nounPhrase, setNounPhrase] = useState("")
    const [imageExemplars, setImageExemplars] = useState<ImageExemplarPrompt[]>([])
    const [isShiftHeld, setIsShiftHeld] = useState(false)
    const [isDrawingBbox, setIsDrawingBbox] = useState(false)
    const [bboxStart, setBboxStart] = useState<[number, number] | null>(null)
    const [bboxCurrent, setBboxCurrent] = useState<[number, number] | null>(null)
    const [isPositiveDraw, setIsPositiveDraw] = useState(true)

    // Keep refs in sync with state
    useEffect(() => {
        modeRef.current = mode
    }, [mode])
    useEffect(() => {
        visualPromptsRef.current = visualPrompts
    }, [visualPrompts])
    useEffect(() => {
        currentPromptIdxRef.current = currentPromptIdx
    }, [currentPromptIdx])
    useEffect(() => {
        imageExemplarsRef.current = imageExemplars
    }, [imageExemplars])
    useEffect(() => {
        nounPhraseRef.current = nounPhrase
    }, [nounPhrase])

    // --- Screen → world coords via DeckGL viewport ---
    function screenToWorld(x: number, y: number): [number, number] {
        const viewport = deckRef.current?.deck?.getViewports()[0]
        if (!viewport) return [0, 0]
        return viewport.unproject([x, y]) as [number, number]
    }

    // --- Global keyboard listeners ---
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                setIsShiftHeld(true)
                isShiftHeldRef.current = true
            }
            if (e.key === "Enter") {
                if (e.shiftKey) {
                    if (modeRef.current === "pvs") {
                        promptableVisualSegmentation(visualPromptsRef.current)
                    } else {
                        promptableConceptSegmentation({
                            nounPhrase: nounPhraseRef.current,
                            imageExemplars: imageExemplarsRef.current,
                        })
                    }
                } else if (modeRef.current === "pvs") {
                    setVisualPrompts((prev) => [...prev, { bbox: null, points: [] }])
                    setCurrentPromptIdx((prev) => prev + 1)
                }
            }
        }
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                setIsShiftHeld(false)
                isShiftHeldRef.current = false
            }
        }
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    }, [])

    // --- Context menu (right-click without shift) → negative point in PVS ---
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const onContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            if (isShiftHeldRef.current) return
            if (modeRef.current !== "pvs") return
            const rect = container.getBoundingClientRect()
            const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)
            const cx = clampPixel(worldToPixel(wx, wy)[0])
            const cy = clampPixel(worldToPixel(wx, wy)[1])
            setVisualPrompts((prev) => {
                const next = [...prev]
                const idx = currentPromptIdxRef.current
                next[idx] = {
                    ...next[idx],
                    points: [...next[idx].points, { x: cx, y: cy, label: false }],
                }
                return next
            })
        }
        container.addEventListener("contextmenu", onContextMenu)
        return () => container.removeEventListener("contextmenu", onContextMenu)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // --- DeckGL left-click → positive point in PVS ---
    function handleDeckClick(info: any) {
        if (isShiftHeldRef.current) return
        if (modeRef.current !== "pvs") return
        let wx: number, wy: number
        if (info.coordinate) {
            wx = info.coordinate[0]
            wy = info.coordinate[1]
        } else {
            ;[wx, wy] = screenToWorld(info.x, info.y)
        }
        const cx = clampPixel(worldToPixel(wx, wy)[0])
        const cy = clampPixel(worldToPixel(wx, wy)[1])
        setVisualPrompts((prev) => {
            const next = [...prev]
            const idx = currentPromptIdxRef.current
            next[idx] = {
                ...next[idx],
                points: [...next[idx].points, { x: cx, y: cy, label: true }],
            }
            return next
        })
    }

    // --- Overlay mouse handlers (bbox drawing) ---
    function handleOverlayMouseDown(e: React.MouseEvent) {
        if (isDrawingBbox) return
        e.preventDefault()
        const rect = containerRef.current!.getBoundingClientRect()
        const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)
        setBboxStart([wx, wy])
        setBboxCurrent([wx, wy])
        setIsDrawingBbox(true)
        setIsPositiveDraw(e.button !== 2)
    }

    function handleOverlayMouseMove(e: React.MouseEvent) {
        if (!isDrawingBbox) return
        const rect = containerRef.current!.getBoundingClientRect()
        const [wx, wy] = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)
        setBboxCurrent([wx, wy])
    }

    function handleOverlayMouseUp() {
        if (!isDrawingBbox || !bboxStart || !bboxCurrent) return
        const [sx, sy] = worldToPixel(bboxStart[0], bboxStart[1])
        const [ex, ey] = worldToPixel(bboxCurrent[0], bboxCurrent[1])
        const bbox: BBoxPrompt = {
            xmin: clampPixel(Math.min(sx, ex)),
            xmax: clampPixel(Math.max(sx, ex)),
            ymin: clampPixel(Math.min(sy, ey)),
            ymax: clampPixel(Math.max(sy, ey)),
        }
        if (modeRef.current === "pvs") {
            setVisualPrompts((prev) => {
                const idx = currentPromptIdxRef.current
                if (prev[idx].bbox !== null) {
                    // Current prompt already has a bbox — start a new prompt
                    const newIdx = prev.length
                    setCurrentPromptIdx(newIdx)
                    currentPromptIdxRef.current = newIdx
                    return [...prev, { bbox, points: [] }]
                }
                const next = [...prev]
                next[idx] = { ...next[idx], bbox }
                return next
            })
        } else {
            setImageExemplars((prev) => [...prev, { ...bbox, label: isPositiveDraw }])
        }
        setIsDrawingBbox(false)
        setBboxStart(null)
        setBboxCurrent(null)
    }

    // --- DeckGL Layers ---
    const imageLayer = new BitmapLayer({
        id: "image-layer",
        bounds: [-IMAGE_SIZE / 2, -IMAGE_SIZE / 2, IMAGE_SIZE / 2, IMAGE_SIZE / 2],
        image: imageUrl,
        textureParameters: { minFilter: "nearest", magFilter: "nearest" },
        pickable: false,
    })

    const pointsData = visualPrompts.flatMap((vp, i) =>
        vp.points.map((pt) => ({
            position: pixelToWorld(pt.x, pt.y),
            color: pt.label
                ? i === currentPromptIdx
                    ? [0, 200, 0, 255]
                    : [0, 200, 0, 128]
                : i === currentPromptIdx
                  ? [220, 0, 0, 255]
                  : [220, 0, 0, 128],
        })),
    )
    const scatterLayer = new ScatterplotLayer({
        id: "points-layer",
        data: pointsData,
        getPosition: (d: any) => d.position,
        getFillColor: (d: any) => d.color,
        getRadius: 5,
        radiusUnits: "pixels",
        pickable: false,
    })

    const pvsBboxPathLayer = new PathLayer({
        id: "pvs-bbox-layer",
        data: visualPrompts
            .filter((vp) => vp.bbox !== null)
            .map((vp, i) => ({
                path: bboxToPath(vp.bbox!),
                color: [255, 200, 0, i === currentPromptIdx ? 255 : 128],
            })),
        getPath: (d: any) => d.path,
        getColor: (d: any) => d.color,
        getWidth: 2,
        widthUnits: "pixels",
        pickable: false,
    })

    const pcsBboxPathLayer = new PathLayer({
        id: "pcs-bbox-layer",
        data: imageExemplars.map((ex) => ({
            path: bboxToPath(ex),
            color: ex.label ? [0, 200, 0, 255] : [200, 0, 0, 255],
        })),
        getPath: (d: any) => d.path,
        getColor: (d: any) => d.color,
        getWidth: 2,
        widthUnits: "pixels",
        pickable: false,
    })

    const previewLayer =
        isDrawingBbox && bboxStart && bboxCurrent
            ? new PathLayer({
                  id: "preview-layer",
                  data: [
                      {
                          path: previewPathFromWorld(bboxStart, bboxCurrent),
                          color: isPositiveDraw ? [0, 200, 0, 180] : [200, 0, 0, 180],
                      },
                  ],
                  getPath: (d: any) => d.path,
                  getColor: (d: any) => d.color,
                  getWidth: 2,
                  widthUnits: "pixels",
                  pickable: false,
              })
            : null

    const layers =
        mode === "pvs"
            ? [imageLayer, scatterLayer, pvsBboxPathLayer, ...(previewLayer ? [previewLayer] : [])]
            : [imageLayer, pcsBboxPathLayer, ...(previewLayer ? [previewLayer] : [])]

    const overlayActive = isShiftHeld || isDrawingBbox
    const positiveCount = imageExemplars.filter((e) => e.label).length
    const negativeCount = imageExemplars.filter((e) => !e.label).length

    return (
        <FullscreenLayout>
            <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
                <DeckGL
                    ref={deckRef}
                    initialViewState={INITIAL_VIEW_STATE}
                    views={orthoView}
                    layers={layers}
                    onClick={handleDeckClick}
                />

                {/* Shift-key bbox drawing overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: overlayActive ? "all" : "none",
                        cursor: overlayActive ? "crosshair" : "default",
                        zIndex: 10,
                    }}
                    onMouseDown={handleOverlayMouseDown}
                    onMouseMove={handleOverlayMouseMove}
                    onMouseUp={handleOverlayMouseUp}
                    onContextMenu={(e) => e.preventDefault()}
                />

                {/* Floating UI panel */}
                <div className="absolute top-4 left-4 w-72 bg-background/90 backdrop-blur border rounded-lg p-3 z-20 flex flex-col gap-3">
                    {/* Mode toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={mode === "pvs" ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => setMode("pvs")}
                        >
                            PVS
                        </Button>
                        <Button
                            variant={mode === "pcs" ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => setMode("pcs")}
                        >
                            PCS
                        </Button>
                    </div>

                    {mode === "pvs" && (
                        <>
                            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                {visualPrompts.map((vp, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors",
                                            i === currentPromptIdx
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted",
                                        )}
                                    >
                                        <span
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setCurrentPromptIdx(i)}
                                        >
                                            Prompt {i + 1}
                                            {i === currentPromptIdx ? " (current)" : ""}:{" "}
                                            {vp.bbox ? "1 bbox" : "no bbox"},{" "}
                                            {vp.points.length} pt{vp.points.length !== 1 ? "s" : ""}
                                        </span>
                                        <button
                                            className="shrink-0 opacity-50 hover:opacity-100 leading-none"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (visualPrompts.length === 1) {
                                                    setVisualPrompts([{ bbox: null, points: [] }])
                                                    setCurrentPromptIdx(0)
                                                } else {
                                                    setVisualPrompts((prev) =>
                                                        prev.filter((_, j) => j !== i),
                                                    )
                                                    setCurrentPromptIdx((prev) =>
                                                        Math.min(prev, visualPrompts.length - 2),
                                                    )
                                                }
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        setVisualPrompts((prev) => [
                                            ...prev,
                                            { bbox: null, points: [] },
                                        ])
                                        setCurrentPromptIdx((prev) => prev + 1)
                                    }}
                                >
                                    + Next Prompt
                                    <span className="ml-1 opacity-50 font-mono text-[10px]">↵</span>
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => promptableVisualSegmentation(visualPrompts)}
                                >
                                    ▶ Submit
                                    <span className="ml-1 opacity-50 font-mono text-[10px]">⇧↵</span>
                                </Button>
                            </div>
                        </>
                    )}

                    {mode === "pcs" && (
                        <>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Noun phrase</span>
                                <Input
                                    value={nounPhrase}
                                    onChange={(e) => setNounPhrase(e.target.value)}
                                    placeholder="e.g. tree, vehicle"
                                    className="h-7 text-xs"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Exemplars:</span>
                                <Badge
                                    variant="outline"
                                    className="border-green-500 text-green-600 dark:text-green-400"
                                >
                                    {positiveCount} pos
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="border-red-500 text-red-600 dark:text-red-400"
                                >
                                    {negativeCount} neg
                                </Badge>
                            </div>
                            <Button
                                size="sm"
                                onClick={() =>
                                    promptableConceptSegmentation({ nounPhrase, imageExemplars })
                                }
                            >
                                ▶ Submit
                                <span className="ml-1 opacity-50 font-mono text-[10px]">⇧↵</span>
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                            setVisualPrompts([{ bbox: null, points: [] }])
                            setCurrentPromptIdx(0)
                            setImageExemplars([])
                            setNounPhrase("")
                        }}
                    >
                        Clear all
                    </Button>
                </div>
            </div>
        </FullscreenLayout>
    )
}
