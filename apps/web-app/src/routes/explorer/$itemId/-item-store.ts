import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SegmentationFeature } from "./label/-segment-result-schema"

interface ItemStore {
    itemId: string
    setItemId: (itemId: string) => void

    segmentationFeatures: Record<string, SegmentationFeature[]>
    addSegmentationFeatures: (
        itemId: string,
        features: SegmentationFeature[],
    ) => void
    deleteSegmentationFeature: (itemId: string, featureId: string) => void

    selectedSegmentation: string | null
    setSelectedSegmentation: (segmentationId: string | null) => void
}

export const useItemStore = create<ItemStore>()(
    persist(
        (set, _get) => ({
            itemId: "",
            setItemId: (itemId: string) => set({ itemId }),

            segmentationFeatures: {},
            addSegmentationFeatures: (
                itemId: string,
                features: SegmentationFeature[],
            ) =>
                set((state) => ({
                    segmentationFeatures: {
                        ...state.segmentationFeatures,
                        [itemId]: [
                            ...(state.segmentationFeatures[itemId] ?? []),
                            ...features,
                        ],
                    },
                })),
            deleteSegmentationFeature: (itemId: string, featureId: string) =>
                set((state) => ({
                    segmentationFeatures: {
                        ...state.segmentationFeatures,
                        [itemId]: state.segmentationFeatures[itemId].filter(
                            (f) => f.properties.id !== featureId,
                        ),
                    },
                })),
            selectedSegmentation: null,
            setSelectedSegmentation: (segmentationId: string | null) =>
                set({ selectedSegmentation: segmentationId }),
        }),
        {
            name: "item",
            partialize: (state) => ({
                segmentationFeatures: state.segmentationFeatures,
            }),
        },
    ),
)
