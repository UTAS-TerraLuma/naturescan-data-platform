import { Check, ChevronDown } from "lucide-react"
import { AssetCard } from "./-asset-card"
import { presets, useAssetStore } from "./-asset-store"
import { Select } from "@base-ui/react/select"
// import { useItem } from "./-item-provider"

export function MsAssetCard() {
    const selectedAsset = useAssetStore((s) => s.selectedAsset)
    const setSelectedAsset = useAssetStore((s) => s.setSelectedAsset)

    const isActive = selectedAsset == "ms"
    const onActiveChange = (show: boolean) =>
        setSelectedAsset(show ? "ms" : "rgb")

    const preset = useAssetStore((s) => s.msPreset)
    const setPreset = useAssetStore((s) => s.setMsPreset)

    return (
        <AssetCard
            isActive={isActive}
            onActiveChange={onActiveChange}
            title="Multispectral Orthomosaic"
        >
            <div>
                <Select.Root
                    items={presets}
                    value={preset}
                    onValueChange={(p) => {
                        console.log("PRESET", p)
                        if (p) {
                            setPreset(p)
                        }
                    }}
                >
                    <Select.Label className="text-sm">Preset</Select.Label>
                    <Select.Trigger className="flex items-center p-1 px-2 gap-2 bg-background rounded-xs ring ring-foreground/10">
                        <Select.Value>{preset.label}</Select.Value>
                        <Select.Icon>
                            <ChevronDown />
                        </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Positioner
                            alignItemWithTrigger={false}
                            align="start"
                        >
                            <Select.Popup className="bg-background p-1 space-y-2 ring ring-foreground/10">
                                <Select.Arrow />
                                <Select.List>
                                    {presets.map((preset, i) => (
                                        <Select.Item
                                            key={i}
                                            value={preset}
                                            className="flex items-center gap-2 hover:bg-accent"
                                        >
                                            <Select.ItemText className="p-1">
                                                {preset.label}
                                            </Select.ItemText>
                                            <Select.ItemIndicator>
                                                <Check />
                                            </Select.ItemIndicator>
                                        </Select.Item>
                                    ))}
                                </Select.List>
                            </Select.Popup>
                        </Select.Positioner>
                    </Select.Portal>
                </Select.Root>
            </div>
        </AssetCard>
    )
}
