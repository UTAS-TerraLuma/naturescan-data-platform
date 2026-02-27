import type { ConceptPrompt } from "@/lib/segment"
import {
    pvsResultsSchema,
    type PVSResult,
    pcsResultsSchema,
    type PCSResult,
    type VisualPrompt,
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

export async function predictPVS(prompt: VisualPrompt): Promise<PVSResult> {
    const body = { prompts: [prompt] }

    const res = await fetch(`${API_URL}/pvs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`pvs failed: ${res.status}`)

    const json = await res.json()
    return pvsResultsSchema.parse(json)
}

export async function predictPCS(prompt: ConceptPrompt): Promise<PCSResult> {
    const body = { prompt }

    const res = await fetch(`${API_URL}/pcs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`pcs failed: ${res.status}`)

    const json = await res.json()
    return pcsResultsSchema.parse(json)
}
