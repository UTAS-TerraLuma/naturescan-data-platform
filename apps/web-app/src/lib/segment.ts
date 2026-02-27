import * as z from "zod"

const API_URL = import.meta.env.VITE_SEGMENTATION_API

// --- SAM3 types (mirror of labeller.tsx frontend types) ---
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

export interface VisualPrompt {
    bbox: BBoxPrompt | null
    points: PointPrompt[]
}

interface ImageExemplarPrompt extends BBoxPrompt {
    label: boolean
}

export interface ConceptPrompt {
    nounPhrase: string
    imageExemplars: ImageExemplarPrompt[]
}

// --- Return Schemas ---

const resultSchema = z.array(z.object({
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
}))

const pcsResult = z.object({
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

const pvsResults = z.object({
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

// --- SAM3 API functions ---

export async function setImage(imageUrl: string): Promise<void> {
    const res = await fetch(
        `${API_URL}/set-image?image_path=${encodeURIComponent(imageUrl)}`,
        {
            method: "POST",
        },
    )
    if (!res.ok) throw new Error(`set-image failed: ${res.status}`)
}

export async function predictPVS(prompts: VisualPrompt[]): Promise<unknown> {
    const body = {
        prompts,
    }
    const res = await fetch(`${API_URL}/pvs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`pvs failed: ${res.status}`)

    const json = await res.json()
    console.log(json)

    return pvsResults.parse(json)
}

export async function predictPCS(prompt: ConceptPrompt): Promise<unknown> {
    const body = {
        prompt,
    }
    const res = await fetch(`${API_URL}/pcs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`pcs failed: ${res.status}`)

    const json = await res.json()
    console.log(json)
    return pcsResult.parse(json)
}
