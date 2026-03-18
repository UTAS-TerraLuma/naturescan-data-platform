import * as z from "zod"

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

export const segmentationResultsSchema = z.array(
    z.object({
        id: z.string(),
        image: z.url(),
        prompt: z.union([pvsPromptSechma, pcsPromptSchema]).nullable(),
        result: resultSchema,
    }),
)

export type SegmentationResult = z.infer<
    typeof segmentationResultsSchema
>[number]
