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
export const resultSchema = z.array(
    z.object({
        name: z.string(),
        class: z.any(),
        confidence: z.number(),
        box: z.object({
            x1: z.number(),
            x2: z.number(),
            y1: z.number(),
            y2: z.number(),
        }),
        segments: z.object({
            x: z.array(z.number()),
            y: z.array(z.number()),
        }),
    }),
)

export type Result = z.infer<typeof resultSchema>

export const pcsResultsSchema = z.object({
    mode: z.literal("pcs"),
    imageURL: z.url(),
    prompts: z.object({
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
    results: z.array(resultSchema),
})

export type PCSResult = z.infer<typeof pcsResultsSchema>

export const pvsResultsSchema = z.object({
    mode: z.literal("pvs"),
    imageURL: z.url(),
    prompts: z.array(
        z.object({
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
        }),
    ),
    results: z.array(resultSchema),
})

export type PVSResult = z.infer<typeof pvsResultsSchema>

// --- Component ----

type Point2D = [number, number]
export type BoxCorners = [Point2D, Point2D]
