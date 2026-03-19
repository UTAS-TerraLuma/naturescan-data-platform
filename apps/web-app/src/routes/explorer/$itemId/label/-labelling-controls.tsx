import { Tabs } from "@base-ui/react/tabs"
import { Switch } from "@base-ui/react/switch"
import { Field } from "@base-ui/react/field"
import { Input } from "@base-ui/react/input"
import { useCallback, useEffect } from "react"
import { useKeyPress } from "@/hooks/useKeyPress"
import { useLabelStore } from "./-label-store"
import type {
    ConceptPrompt,
    Prompt,
    PromptMode,
    VisualPrompt,
} from "./-prompt-types"
import { useMutation } from "@tanstack/react-query"
import { predict, setImage } from "./-api"
import { ImageStatusIndicator } from "./-image-status-indicator"
import { WebMercatorViewport } from "@math.gl/web-mercator"
import { IMAGE_SIZE } from "./-image-layer"
import { boundsToCorners } from "@/lib/spatial-utils"
import { projectPrompt, unprojectResultToFeature } from "./-labelling-utils"
import { useItemStore } from "../-item-store"

const KBD = ({ children }: { children: React.ReactNode }) => (
    <kbd className="bg-muted text-muted-foreground h-5 w-fit min-w-5 rounded-sm px-1 font-mono text-xs font-medium inline-flex items-center justify-center select-none ring ring-foreground/10">
        {children}
    </kbd>
)

export function LabellingControls() {
    const surveyUID = useItemStore((s) => s.itemId)
    // ---- Locked ----
    const locked = useLabelStore((s) => s.locked)
    const toggleLocked = useLabelStore((s) => s.toggleLocked)

    // ---- Prompts State ----
    const promptMode = useLabelStore((s) => s.promptMode)
    const setPromptMode = useLabelStore((s) => s.setPromptMode)
    const pvsSimpleMode = useLabelStore((s) => s.pvsSimpleMode)
    const togglePvsSimpleMode = useLabelStore((s) => s.togglePvsSimpleMode)
    const nounPhrase = useLabelStore((s) => s.nounPhrase)
    const setNounPhrase = useLabelStore((s) => s.setNounPhrase)
    const clearPrompts = useLabelStore((s) => s.clearPrompts)
    const togglePromptMode = useCallback(
        () => setPromptMode(promptMode == "pvs" ? "pcs" : "pvs"),
        [promptMode],
    )

    const imageUrl = useLabelStore((s) => s.imageUrl)

    // ---- Set Image Mutation -----
    const setImageMutation = useMutation({
        mutationFn: (image: string) => setImage(image),
    })
    useEffect(() => {
        if (imageUrl) {
            setImageMutation.mutate(imageUrl)
        }
    }, [imageUrl])

    // ---- Predict Mutation ----
    const addSegmentationFeatures = useItemStore(
        (s) => s.addSegmentationFeatures,
    )
    const predictMutation = useMutation({
        mutationFn: ({
            prompt,
            imageUrl,
        }: {
            prompt: Prompt | null
            imageUrl: string
        }) => predict(imageUrl, prompt),
        onError: (err) => console.error("PVS error:", err),
        onSettled: clearPrompts,
    })

    const sumbitPrompts = () => {
        const state = useLabelStore.getState()
        let viewport = new WebMercatorViewport({
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
        }).fitBounds(boundsToCorners(state.bounds))

        let prompt: Prompt | null = null
        if (
            state.promptMode === "pvs" &&
            !state.bbox &&
            state.points.length == 0
        ) {
            prompt = null
        } else if (state.promptMode === "pvs") {
            const visualPrompt: VisualPrompt = {
                type: "visual",
                bbox: state.bbox,
                points: state.points,
            }
            prompt = visualPrompt
        } else if (state.promptMode === "pcs") {
            const { nounPhrase, exemplars } = state

            const conceptPrompt: ConceptPrompt = {
                type: "concept",
                text: nounPhrase,
                exemplars: exemplars,
            }
            prompt = conceptPrompt
        }
        prompt = projectPrompt(prompt, viewport)
        predictMutation.mutate(
            { imageUrl: state.imageUrl!, prompt },
            {
                onSuccess: (results) => {
                    const features = results.map((r) =>
                        unprojectResultToFeature(r, viewport),
                    )
                    addSegmentationFeatures(surveyUID, features)
                },
            },
        )
    }

    useKeyPress("l", toggleLocked)
    useKeyPress("Enter", sumbitPrompts)
    useKeyPress("Escape", clearPrompts)
    useKeyPress("m", togglePromptMode)
    useKeyPress("s", togglePvsSimpleMode)

    return (
        <>
            <Field.Root name="lock-image" className="flex items-center gap-2">
                <Field.Label className="text-xs text-muted-foreground">
                    Lock image <KBD>L</KBD>
                </Field.Label>
                <Switch.Root
                    id="lock-image"
                    checked={locked}
                    onCheckedChange={toggleLocked}
                    className="relative flex items-center h-5 w-9 cursor-pointer rounded-full bg-foreground/20 transition-colors data-checked:bg-foreground/80"
                >
                    <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-background shadow transition-transform data-checked:translate-x-4" />
                </Switch.Root>
            </Field.Root>

            {locked && (
                <ImageStatusIndicator status={setImageMutation.status} />
            )}

            {locked && (
                <Tabs.Root
                    value={promptMode}
                    onValueChange={(v) => setPromptMode(v as PromptMode)}
                    className="flex flex-col gap-2 mt-2"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            Segment mode <KBD>M</KBD>
                        </span>
                        <Tabs.List className="flex gap-1 bg-foreground/5 rounded-sm p-0.5">
                            <Tabs.Tab
                                value="pvs"
                                className="px-2 py-0.5 text-xs rounded-sm text-muted-foreground cursor-pointer data-active:bg-background data-active:text-foreground data-active:shadow-sm hover:text-foreground/70 transition-colors"
                            >
                                PVS
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="pcs"
                                className="px-2 py-0.5 text-xs rounded-sm text-muted-foreground cursor-pointer data-active:bg-background data-active:text-foreground data-active:shadow-sm hover:text-foreground/70 transition-colors"
                            >
                                PCS
                            </Tabs.Tab>
                        </Tabs.List>
                    </div>

                    <Tabs.Panel value="pvs" className="flex flex-col gap-2">
                        <Field.Root
                            name="simple-mode"
                            className="flex items-center gap-2"
                        >
                            <Field.Label className="text-xs text-muted-foreground">
                                Simple mode <KBD>S</KBD>
                            </Field.Label>
                            <Switch.Root
                                id="simple-mode"
                                checked={pvsSimpleMode}
                                onCheckedChange={togglePvsSimpleMode}
                                className="relative flex items-center h-5 w-9 cursor-pointer rounded-full bg-foreground/20 transition-colors data-checked:bg-foreground/80"
                            >
                                <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-background shadow transition-transform data-checked:translate-x-4" />
                            </Switch.Root>
                        </Field.Root>
                        {pvsSimpleMode ? (
                            <button className="px-2 py-1 text-xs rounded-sm bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors cursor-pointer w-fit flex items-center gap-1.5">
                                Segment All <KBD>↵</KBD>
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={sumbitPrompts}
                                    className="px-2 py-1 text-xs rounded-sm bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    Submit <KBD>↵</KBD>
                                </button>
                                <button
                                    onClick={clearPrompts}
                                    className="px-2 py-1 text-xs rounded-sm bg-foreground/10 text-muted-foreground hover:bg-foreground/20 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    Clear <KBD>Esc</KBD>
                                </button>
                            </div>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="pcs" className="flex flex-col gap-2">
                        <Field.Root
                            name="noun-phrase"
                            className="flex flex-col gap-1"
                        >
                            <Field.Label className="text-xs text-muted-foreground">
                                Noun phrase
                            </Field.Label>
                            <Input
                                value={nounPhrase}
                                onChange={(e) => {
                                    e.stopPropagation()
                                    setNounPhrase(e.target.value)
                                }}
                                className="px-2 py-1 text-xs rounded-sm bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                placeholder="e.g. red car"
                            />
                        </Field.Root>
                        <div className="flex gap-2">
                            <button className="px-2 py-1 text-xs rounded-sm bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors cursor-pointer flex items-center gap-1.5">
                                Submit <KBD>↵</KBD>
                            </button>
                            <button
                                onClick={clearPrompts}
                                className="px-2 py-1 text-xs rounded-sm bg-foreground/10 text-muted-foreground hover:bg-foreground/20 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                Clear <KBD>Esc</KBD>
                            </button>
                        </div>
                    </Tabs.Panel>
                </Tabs.Root>
            )}
        </>
    )
}
