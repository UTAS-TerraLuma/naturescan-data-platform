import {
    predictionResultsSchema,
    type PredictionResult,
    type VisualPrompt,
    type ConceptPrompt,
} from "./-types"

const API_URL = import.meta.env.VITE_SEGMENTATION_API

export async function setImage(image: string): Promise<void> {
    const res = await fetch(
        `${API_URL}/set-image?image=${encodeURIComponent(image)}`,
        {
            method: "POST",
        },
    )
    if (!res.ok) throw new Error(`set-image failed: ${res.status}`)
}

export async function predict(
    image: string,
    prompt: VisualPrompt | ConceptPrompt | null,
): Promise<PredictionResult[]> {
    const body = { image, prompt }

    const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`pvs failed: ${res.status}`)
    const json = await res.json()
    return predictionResultsSchema.parse(json)
}
