import { useDeckLayer } from "@/stores/deck-store"
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import { useLabelStore } from "./-label-store"
import {
    type Point2D,
    polygonFromBounds,
    polygonFromBoxCorners,
    type Bounds,
    type BoxCorners,
    cornersToBounds,
    polygonFromBBoxObj,
} from "@/lib/spatial-utils"
import type { BBoxPrompt, PointPrompt } from "./-prompt-types"
import { useEffect, useState } from "react"
import { useKeyPress } from "@/hooks/useKeyPress"
import type { PickingInfo } from "@deck.gl/core"

export function PromptLayer() {
    const promptMode = useLabelStore((s) => s.promptMode)
    const bounds = useLabelStore((s) => s.bounds)

    const points = useLabelStore((s) => s.points)
    const addPoint = useLabelStore((s) => s.addPoint)

    const bbox = useLabelStore((s) => s.bbox)
    const setBBox = useLabelStore((s) => s.setBBox)

    const exemplars = useLabelStore((s) => s.exemplars)
    const addExemplar = useLabelStore((s) => s.addExemplar)

    const clearPrompts = useLabelStore((s) => s.clearPrompts)

    const [shiftIsPressed, setShiftIsPressed] = useState(false)
    useKeyPress(
        "Shift",
        () => setShiftIsPressed(true),
        () => setShiftIsPressed(false),
    )

    const [previewBBoxStart, setPreviewBBoxStart] = useState<Point2D | null>(
        null,
    )
    const [previewBBoxEnd, setPreviewBBoxEnd] = useState<Point2D | null>(null)

    const previewBBoxCorners: BoxCorners[] =
        previewBBoxStart && previewBBoxEnd
            ? [[previewBBoxStart, previewBBoxEnd]]
            : []

    const onClick = (info: PickingInfo, event: any) => {
        const { coordinate } = info
        if (!coordinate) return
        if (!event.rightButton) return

        addPoint({
            x: coordinate[0],
            y: coordinate[1],
            label: !shiftIsPressed,
        })
    }

    const onDragStart = (info: PickingInfo, event: any) => {
        const { coordinate } = info
        if (!coordinate) return
        if (!event.rightButton) return

        const [x, y] = coordinate

        setPreviewBBoxStart([x, y])
    }

    const onDrag = (info: PickingInfo, event: any) => {
        const { coordinate } = info
        if (!coordinate) return
        if (!event.rightButton) return

        const [x, y] = coordinate

        setPreviewBBoxEnd([x, y])
    }

    const onDragEnd = (info: PickingInfo, event: any) => {
        const { coordinate } = info
        if (!coordinate) return
        if (!event.rightButton) return

        if (previewBBoxStart && previewBBoxEnd) {
            const [xmin, ymin, xmax, ymax] = cornersToBounds([
                previewBBoxStart,
                previewBBoxEnd,
            ])

            if (promptMode == "pvs") {
                setBBox({
                    xmin,
                    ymin,
                    xmax,
                    ymax,
                })
            } else {
                addExemplar({
                    xmin,
                    ymin,
                    xmax,
                    ymax,
                    label: !shiftIsPressed,
                })
            }
        }

        setPreviewBBoxStart(null)
        setPreviewBBoxEnd(null)
    }

    const interactionLayer = new PolygonLayer<Bounds>({
        id: "interaction-layer",
        data: [bounds],
        getPolygon: (d) => polygonFromBounds(d),
        pickable: true,
        filled: true,
        getFillColor: [0, 0, 0, 0],
        stroked: false,

        onDragStart,
        onDrag,
        onDragEnd,
        onClick,
    })

    const pointsLayer = new ScatterplotLayer<PointPrompt>({
        id: "point-prompt-layer",
        data: points,
        getPosition: (p) => [p.x, p.y],
        getFillColor: (p) => (p.label ? [0, 255, 0] : [255, 0, 0]),
        getRadius: 5,
        radiusUnits: "pixels",
        visible: promptMode == "pvs",
    })

    const previewBboxLayer = new PolygonLayer<BoxCorners>({
        id: "preview-bbox-layer",
        data: previewBBoxCorners,
        getPolygon: (d) => polygonFromBoxCorners(d),

        filled: false,
        stroked: true,
        getLineColor: () => {
            if (promptMode == "pvs") {
                return [0, 0, 0, 150]
            }

            return shiftIsPressed ? [255, 0, 0, 150] : [0, 255, 0, 150]
        },
        getLineWidth: 1,
        lineWidthUnits: "pixels",
    })

    const bboxLayer = new PolygonLayer<BBoxPrompt>({
        id: "bbox-layer",
        data: bbox ? [bbox] : [],
        getPolygon: (d) => polygonFromBBoxObj(d),

        filled: false,
        stroked: true,
        getLineColor: [0, 0, 0],
        getLineWidth: 2,
        lineWidthUnits: "pixels",
        visible: promptMode == "pvs",
    })

    const exemplarsLayer = new PolygonLayer<BBoxPrompt>({
        id: "exemplars-layer",
        data: exemplars,
        getPolygon: (d) => polygonFromBBoxObj(d),

        filled: false,
        stroked: true,
        getLineColor: (d) => (d.label ? [0, 255, 0] : [255, 0, 0]),
        getLineWidth: 2,
        lineWidthUnits: "pixels",
        visible: promptMode == "pcs",
    })

    // Clear prompts on on mount
    useEffect(() => {
        return () => clearPrompts()
    }, [])

    useDeckLayer({
        "interaction-layer": interactionLayer,
        "points-layer": pointsLayer,
        "preview-bbox-layer": previewBboxLayer,
        "bbox-layer": bboxLayer,
        "exemplars-layer": exemplarsLayer,
    })

    return null
}
