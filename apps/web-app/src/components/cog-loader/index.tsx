import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState, type FormEventHandler } from "react"
import { url as zodUrl } from "zod"
import { getCogBoundsWGS84 } from "@/lib/titiler"
import { useDataLayerStore } from "@/stores/data-layer-store"

export function CogLoader() {
    const [inputString, setInputString] = useState("")

    const dataLayers = useDataLayerStore((s) => s.dataLayers)
    const addDataLayer = useDataLayerStore((s) => s.addDataLayer)

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault()

        try {
            const cogUrl = zodUrl().parse(inputString)
            const bounds = await getCogBoundsWGS84(cogUrl)
            addDataLayer({
                id: cogUrl,
                type: "rgb-cog",
                cogUrl,
                bounds,
            })
        } catch (e) {
            console.warn(e)
            console.warn("COG URL NOT VALID")
            setInputString("")
        }
    }

    useEffect(() => {
        console.log(dataLayers)
    }, [dataLayers])

    if (dataLayers.length > 0) {
        return null
    }

    return (
        <div className="bg-background text-foreground rounded-sm p-4 pt-3">
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="cog-url">COG URL</FieldLabel>
                        <Input
                            id="cog-url"
                            placeholder="https://example.com/cog"
                            type="url"
                            value={inputString}
                            onChange={(e) => setInputString(e.target.value)}
                        />
                    </Field>
                    <Field orientation="horizontal">
                        <Button type="submit">Load</Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    )
}
