import {
    predictionResultsSchema,
    type PredictionResults,
    type VisualPrompt,
    type ConceptPrompt,
} from "./-types"

const API_URL = import.meta.env.VITE_SEGMENTATION_API

export async function setImage(imageUrl: string): Promise<void> {
    const res = await fetch(
        `${API_URL}/set-image?image_path=${encodeURIComponent(imageUrl)}`,
        {
            method: "POST",
        },
    )
    if (!res.ok) throw new Error(`set-image failed: ${res.status}`)
}

export async function predictPVS(
    prompt: VisualPrompt,
): Promise<PredictionResults> {
    const body = { prompt }

    const res = await fetch(`${API_URL}/pvs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`pvs failed: ${res.status}`)
    const json = await res.json()
    return predictionResultsSchema.parse(json)
}

export async function predictPCS(
    prompt: ConceptPrompt,
): Promise<PredictionResults> {
    const body = { prompt }

    const res = await fetch(`${API_URL}/pcs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`pcs failed: ${res.status}`)
    const json = await res.json()
    console.log(json)
    return predictionResultsSchema.parse(json)
}
