import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState, type FormEventHandler } from "react"
import { useCogUrlStore } from "@/stores/cog-url-store"
import { url as zodUrl } from "zod"
import { X } from "lucide-react"
import { getCogBounds, getRgbXyzUrl } from "@/lib/titiler"
import { useDataLayerStore } from "@/stores/data-layer-store"

export function CogLoader() {
    const [inputString, setInputString] = useState("")
    const cogUrl = useCogUrlStore((s) => s.url)
    const setUrl = useCogUrlStore((s) => s.setUrl)

    const dataLayers = useDataLayerStore((s) => s.dataLayers)
    const addDataLayer = useDataLayerStore((s) => s.addDataLayer)

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault()

        try {
            const cogUrl = zodUrl().parse(inputString)
            setUrl(cogUrl)

            const bounds = await getCogBounds(cogUrl)

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

    return (
        <div className="absolute top-2 left-2 bg-background text-foreground rounded-sm p-4 pt-3 w-xs">
            {cogUrl ? (
                <>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="cog-url">COG URL</FieldLabel>
                            <div className="flex gap-2">
                                <Input
                                    id="cog-url"
                                    placeholder="https://example.com/cog"
                                    type="url"
                                    value={cogUrl}
                                    disabled
                                ></Input>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setUrl(null)}
                                >
                                    <X />
                                </Button>
                            </div>
                        </Field>
                    </FieldGroup>
                </>
            ) : (
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
            )}
        </div>
    )
}
