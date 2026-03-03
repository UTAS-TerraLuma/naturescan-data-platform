import * as z from "zod"

// --- Prompts ----
export interface PointPrompt {
    x: number
    y: number
    label: boolean
}

export interface BBoxPrompt {
    xmin: number
    ymin: number
    xmax: number
    ymax: number
    label?: boolean
}

export interface VisualPrompt {
    type: "visual"
    bbox: BBoxPrompt | null
    points: PointPrompt[]
}

export interface ConceptPrompt {
    type: "concept"
    text: string
    exemplars: BBoxPrompt[]
}

export type Prompt = VisualPrompt | ConceptPrompt

export type PromptMode = "pcs" | "pvs"

// ---- Route ----
export const labellerSearchSchema = z.object({
    imageUrl: z.url(),
})

// ---- Results ----
export const resultSchema = z.object({
    confidence: z.number(),
    box: z.object({
        x1: z.number(),
        x2: z.number(),
        y1: z.number(),
        y2: z.number(),
    }),
    polygon: z.array(z.tuple([z.number(), z.number()])),
})
export type Result = z.infer<typeof resultSchema>

const pvsPromptSechma = z.object({
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

export const predictionResultsSchema = z.array(
    z.object({
        id: z.string(),
        image: z.url(),
        prompt: z.union([pvsPromptSechma, pcsPromptSchema]).nullable(),
        result: resultSchema,
    }),
)

export type PredictionResult = z.infer<typeof predictionResultsSchema>[number]

// --- Component ----

type Point2D = [number, number]
export type BoxCorners = [Point2D, Point2D]
