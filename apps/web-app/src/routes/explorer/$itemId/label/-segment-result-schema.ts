import * as z from "zod"
import type { Prompt } from "./-prompt-types"
import type { BBoxObj, Bounds } from "@/lib/spatial-utils"

const boxSchema = z.object({
    x1: z.number(),
    x2: z.number(),
    y1: z.number(),
    y2: z.number(),
})

// ---- Results ----
export const resultSchema = z.object({
    confidence: z.number(),
    box: boxSchema,
    polygon: z.array(z.tuple([z.number(), z.number()])),
})
export type Result = z.infer<typeof resultSchema>

const pvsPromptSechma = z.object({
    type: z.literal("visual"),
    bbox: z
        .object({
            xmin: z.number(),
            ymin: z.number(),
            xmax: z.number(),
            ymax: z.number(),
        })
        .nullable()
        .optional(),

    points: z.array(
        z.object({ x: z.number(), y: z.number(), label: z.boolean() }),
    ),
})

const pcsPromptSchema = z.object({
    type: z.literal("concept"),
    text: z.string().nullable().optional(),
    exemplars: z.array(
        z.object({
            xmin: z.number(),
            ymin: z.number(),
            xmax: z.number(),
            ymax: z.number(),
            label: z.boolean(),
        }),
    ),
})

const promptSchema = z.union([pvsPromptSechma, pcsPromptSchema]).nullable()

export const segmentationResultsSchema = z.array(
    z.object({
        id: z.string(),
        image: z.url(),
        prompt: promptSchema,
        result: resultSchema,
    }),
)

export type SegmentationResult = z.infer<
    typeof segmentationResultsSchema
>[number]

type LinearRing = [number, number][]

export type SegmentationFeature = {
    type: "Feature"
    bbox: Bounds
    properties: {
        id: string
        image: string
        prompt: Prompt | null
        confidence: number
        pixelBox: BBoxObj
    }
    geometry: {
        type: "Polygon"
        coordinates: LinearRing[]
    }
}
