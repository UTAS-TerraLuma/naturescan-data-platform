import { useState } from "react"
import type { PromptMode } from "./-prompt-types"
import { useLabelImage } from "./-label-image-provider"

export function Prompts() {
    const {} = useLabelImage()

    const [mode, setMode] = useState<PromptMode>("pvs")
    const [pvsSimpleMode, setPvsSimpleMode] = useState(true)
    const [hasAutoSegmented, setHasAutoSegmented] = useState(false)

    return null
}
