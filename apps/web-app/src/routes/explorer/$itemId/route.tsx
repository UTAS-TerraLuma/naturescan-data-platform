import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { nsItemByIdQuery } from "../-stac-queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { fitBounds, useDeck } from "@/stores/deck-store"
import { useEffect } from "react"
import { RgbAsset } from "./-rgb-asset"
import { MsAsset } from "./-ms-asset"

import * as z from "zod"
import { LabelComponent } from "./-label"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export const Route = createFileRoute("/explorer/$itemId")({
    loader: ({ context, params: { itemId } }) =>
        context.queryClient.ensureQueryData(nsItemByIdQuery(itemId)),
    validateSearch: z.object({
        asset: z.enum(["rgb", "ms"]).default("rgb"),
        label: z.boolean().optional(),
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const { itemId } = Route.useParams()
    const { asset, label } = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })

    const { data: item } = useSuspenseQuery(nsItemByIdQuery(itemId))

    const isDeckReady = useDeck((s) => s.isLoaded)
    useEffect(() => {
        if (isDeckReady) {
            fitBounds(item.bbox)
        }
    }, [item, isDeckReady])

    return (
        <>
            <div className="p-3">
                <img
                    className="h-48 w-full object-contain"
                    src={item.assets.thumbnail.href}
                />
                <p className="text-foreground/75 pt-2">
                    {item.properties.description}
                </p>
            </div>
            <div className="bg-muted p-2 space-y-2">
                <h2 className="text-sm pl-2 font-medium text-foreground/75">
                    Assets
                </h2>
                <RgbAsset
                    item={item}
                    isActive={asset == "rgb"}
                    setActive={() =>
                        navigate({
                            search: (s) => ({ ...s, asset: "rgb" }),
                        })
                    }
                />
                <MsAsset
                    item={item}
                    isActive={asset == "ms"}
                    setActive={() =>
                        navigate({ search: (s) => ({ ...s, asset: "ms" }) })
                    }
                />
            </div>
            <div className="bg-muted p-2 space-y-2">
                <div className="flex items-center space-x-2 justify-between">
                    <Label
                        htmlFor="annotations-switch"
                        className="text-sm pl-2 font-medium text-foreground/75"
                    >
                        Annotations
                    </Label>
                    <Switch
                        id="annotations-switch"
                        checked={label}
                        onCheckedChange={(b) =>
                            navigate({
                                search: (s) => ({ ...s, label: b }),
                            })
                        }
                    ></Switch>
                </div>
            </div>

            {label && <LabelComponent />}
        </>
    )
}
