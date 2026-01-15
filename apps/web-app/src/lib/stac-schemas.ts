import * as z from "zod"

// ---- COLLECTION IDs ----

const collectionIdSchema = z.union([
    z.literal("naturescan-rgb"),
    z.literal("naturescan-ms"),
])

// ---- LINK ----

export const linkSchema = z.object({
    href: z.string(),
    rel: z.string(),
    type: z.string(),
})

// ---- ASSET ----

const bandSchema = z.object({
    description: z.string().optional(),
    "eo:common_name": z.string(),
    name: z.string(),
    "raster:histogram": z.any(),
    statistics: z.object({
        maximum: z.number(),
        mean: z.number(),
        minimum: z.number(),
        stddev: z.number(),
    }),
})

const mainAssetSchema = z.object({
    bands: z.array(bandSchema),
    href: z.string(),
    nodata: z.number(),
    "raster:sampling": z.literal("area"),
    roles: z.array(z.literal("data")),
    title: z.string(),
    type: z.literal("image/tiff; application=geotiff; profile=cloud-optimized"),
})

const thumbnailAssetSchema = z.object({
    href: z.string(),
    "proj:shape": z.array(z.number()).length(2),
    roles: z.array(z.literal("thumbnail")),
    type: z.literal("image/png"),
})

const polygonGeometrySchema = z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.array(z.number()))),
})

// ---- ITEM ----

const itemPropertiesSchema = z.object({
    "proj:transform": z.array(z.number()),
    "proj:projjson": z.any(),
    datetime: z.string(),
    title: z.string(),
    description: z.string().optional(),
    mission: z.string(),
    platform: z.string(),
    instruments: z.array(z.string()),
    "naturescan:site": z.string(),
    "naturescan:agl_m": z.number(),
    "naturescan:data_product": z.union([z.literal("rgb"), z.literal("ms")]),
    "proj:code": z.string().startsWith("EPSG:"),
    "proj:wkt2": z.string(),
    "proj:shape": z.array(z.number()),
    filename: z.string().optional(),
})

export const itemSchema = z.object({
    type: z.literal("Feature"),
    stac_version: z.literal("1.1.0"),
    stac_extensions: z.array(z.string()),
    id: z.string(),
    geometry: polygonGeometrySchema,
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    links: z.array(linkSchema),
    assets: z.object({
        main: mainAssetSchema,
        thumbnail: thumbnailAssetSchema,
    }),
    collection: collectionIdSchema,
    properties: itemPropertiesSchema,
})

export type StacItem = z.infer<typeof itemSchema>

// ---- COLLECTION ----

export const collectionSchema = z.object({
    assets: z.object({
        data: z.object({
            href: z.string().endsWith(".parquet"),
            type: z.literal("application/vnd.apache.parquet"),
        }),
    }),
    description: z.string().optional(),
    extent: z.object({
        spatial: z.object({
            bbox: z.tuple([
                z.tuple([z.number(), z.number(), z.number(), z.number()]),
            ]),
        }),
        temporal: z.object({
            interval: z.array(z.array(z.string()).length(2)).length(1),
        }),
    }),
    id: collectionIdSchema,
    license: z.string(),
    links: z.array(linkSchema),
    providers: z.array(z.any()),
    title: z.string(),
    stac_version: z.literal("1.1.0"),
    type: z.literal("Collection"),
})

export type StacCollection = z.infer<typeof collectionSchema>
