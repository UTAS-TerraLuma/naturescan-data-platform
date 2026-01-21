import * as z from "zod"
import {
    collectionSchema,
    itemSchema,
    linkSchema,
    type StacCollection,
    type StacItem,
} from "./stac-schemas"
import { queryOptions } from "@tanstack/react-query"
import { queryClient } from "./tanstack-query-client"

const STAC_API_URL = "http://localhost:8002"

const COLLECTIONS = "collections"
const ITEMS = "items"

// ---- COLLECTIONS ----

async function fetchCollections() {
    const response = await fetch(`${STAC_API_URL}/collections`)
    const data = await response.json()

    const schema = z.object({
        collections: z.array(collectionSchema),
        links: z.array(linkSchema),
    })

    return schema.parse(data)
}

export const collectionsQueryOptions = queryOptions({
    queryKey: [COLLECTIONS],
    queryFn: () => fetchCollections(),
})

// ---- COLLECTIONS , COLLECTION_ID ---

async function fetchCollection(collectionId: string) {
    const response = await fetch(
        `${STAC_API_URL}/${COLLECTIONS}/${collectionId}`,
    )
    const data = await response.json()

    return collectionSchema.parse(data)
}

export const collectionQueryOptions = (collectionId: string) =>
    queryOptions({
        queryKey: [COLLECTIONS, collectionId],
        queryFn: () => fetchCollection(collectionId),
        // If possible, grab collection from collections list
        initialData: () =>
            queryClient
                .getQueryData<{
                    collections: StacCollection[]
                }>([COLLECTIONS])
                ?.collections.find((c) => c.id == collectionId),
        // Get age of collection list
        initialDataUpdatedAt: () =>
            queryClient.getQueryState([COLLECTIONS])?.dataUpdateCount,
    })

// ---- COLLECTIONS, COLLECTION_ID, ITEMS ----

async function fetchCollectionItems(collectionId: string) {
    const respone = await fetch(
        `${STAC_API_URL}/${COLLECTIONS}/${collectionId}/${ITEMS}?limit=1000`,
    )

    const data = await respone.json()

    const schema = z.object({
        features: z.array(itemSchema),
        links: z.array(linkSchema),
        type: z.literal("FeatureCollection"),
    })

    return schema.parse(data)
}

export const collectionItemsQueryOptions = (collectionId: string) =>
    queryOptions({
        queryKey: [COLLECTIONS, collectionId, ITEMS],
        queryFn: () => fetchCollectionItems(collectionId),
    })

// ---- COLLECTIONS, COLLECTION_ID, ITEM, ITEM_ID ----

async function fetchCollectionItem(collectionId: string, itemId: string) {
    const respone = await fetch(
        `${STAC_API_URL}/${COLLECTIONS}/${collectionId}/${ITEMS}/${itemId}`,
    )

    const data = await respone.json()

    return itemSchema.parse(data)
}

export const collectionItemQueryOptions = (
    collectionId: string,
    itemId: string,
) =>
    queryOptions({
        queryKey: [COLLECTIONS, collectionId, ITEMS, itemId],
        queryFn: () => fetchCollectionItem(collectionId, itemId),
        // If possible grab item from item list
        initialData: () =>
            queryClient
                .getQueryData<{
                    features: StacItem[]
                }>([COLLECTIONS, collectionId, ITEMS])
                ?.features.find((d) => d.id === itemId),
        // Get age of item list
        initialDataUpdatedAt: () =>
            queryClient.getQueryState([COLLECTIONS, collectionId, ITEMS])
                ?.dataUpdatedAt,
    })
