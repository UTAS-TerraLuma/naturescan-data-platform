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
