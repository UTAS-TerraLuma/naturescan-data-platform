import { queryOptions } from "@tanstack/react-query"
import { featureCollectionSchema } from "./-stac-schema"

const NS_FEATURE_COLLECTION_URL =
    "https://object-store.rc.nectar.org.au/v1/AUTH_4df2f67c2eed48a2aaeeed008a4bf0de/naturescan-stac/naturescan-items.json"

async function fetchNsItems() {
    const response = await fetch(NS_FEATURE_COLLECTION_URL)
    const json = await response.json()
    return featureCollectionSchema.parse(json)
}

export const nsItemsQuery = queryOptions({
    queryKey: ["naturescan"],
    queryFn: fetchNsItems,
    staleTime: Infinity,
    gcTime: Infinity,
})

export const nsItemByIdQuery = (id: string) =>
    queryOptions({
        queryKey: ["naturescan"],
        queryFn: fetchNsItems,
        staleTime: Infinity,
        select: (data) => data.features.find((item) => item.id == id),
    })
