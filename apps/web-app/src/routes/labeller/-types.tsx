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
}

export interface VisualPrompt {
    bbox: BBoxPrompt | null
    points: PointPrompt[]
}

export interface ImageExemplarPrompt extends BBoxPrompt {
    label: boolean
}

export interface ConceptPrompt {
    nounPhrase: string
    imageExemplars: ImageExemplarPrompt[]
}

export type PromptMode = "pcs" | "pvs"

// ---- Route ----
export const labellerSearchSchema = z.object({
    imageUrl: z.url(),
})

// ---- Results ----
export const resultSchema = z.object({
    name: z.string(),
    class: z.any(),
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
    mode: z.literal("pvs"),
    prompt: z
        .object({
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
        .nullable(),
})

const pcsPromptSchema = z.object({
    mode: z.literal("pcs"),
    prompt: z.object({
        nounPhrase: z.string().nullable().optional(),
        imageExemplars: z.array(
            z.object({
                xmin: z.number(),
                ymin: z.number(),
                xmax: z.number(),
                ymax: z.number(),
                label: z.boolean(),
            }),
        ),
    }),
})

export const predictionResultsSchema = z.array(
    z.object({
        id: z.string(),
        imageURL: z.url(),
        prompt: z.union([pvsPromptSechma, pcsPromptSchema]),
        result: resultSchema,
    }),
)

export type PredictionResults = z.infer<typeof predictionResultsSchema>

export type PredictionResult = PredictionResults[number]

// --- Component ----

type Point2D = [number, number]
export type BoxCorners = [Point2D, Point2D]
