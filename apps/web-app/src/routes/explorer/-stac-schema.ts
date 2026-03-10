import * as z from "zod"

export const linkSchema = z.object({
    href: z.string(),
    rel: z.string(),
    type: z.string(),
    title: z.string().optional(),
})

const polygonGeometrySchema = z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.array(z.number()))),
})

const bandStatisticsSchema = z.object({
    maximum: z.number(),
    minimum: z.number(),
    mean: z.number(),
    stddev: z.number(),
})

const bandSchema = z.object({
    name: z.string(),
    description: z.string(),
    "eo:common_name": z.string(),
    statistics: bandStatisticsSchema,
})

const thumbnailAssetSchema = z.object({
    href: z.url(),
    type: z.literal("image/png"),
    "proj:shape": z.tuple([z.number(), z.number()]),
    roles: z.array(z.literal("thumbnail")),
})

const dataAssetSchema = z.object({
    href: z.url(),
    type: z.literal("image/tiff; application=geotiff; profile=cloud-optimized"),
    title: z.string(),
    nodata: z.number(),
    data_type: z.union([z.literal("uint8"), z.literal("float32")]),
    "raster:sampling": z.literal("area"),
    bands: z.array(bandSchema),
    "proj:code": z.string(),
    "proj:wkt2": z.string(),
    "proj:projjson": z.object(),
    "proj:shape": z.tuple([z.number(), z.number()]),
    "proj:transform": z.array(z.number()),
    roles: z.array(z.literal("data")),
})

const assetsObjectSchema = z.object({
    thumbnail: thumbnailAssetSchema,
    rgb: dataAssetSchema,
    ms: dataAssetSchema,
})

const propertiesSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    datetime: z.string(),
    platform: z.string(),
    instruments: z.string(),
    "ns:site": z.string(),
    "ns:date": z.string(),
    "ns:site_visit_id": z.string(),
    "ns:variant": z.string(),
    "ns:survey_uid": z.string(),
    "ns:property": z.string(),
    "ns:landholder": z.string(),
    "ns:traditional_owner": z.string().nullable(),
    "ns:base_station_type": z.string().nullable(),
    "ns:antenna_height_m": z.number().nullable(),
    "ns:calibration_panel": z.string().nullable(),
    "ns:white_balance": z.string().nullable(),
    "ns:sky_conditions": z.string().nullable(),
    "ns:wind_conditions": z.string().nullable(),
    "ns:base_station_established": z.string().nullable(),
    "ns:collected_by": z.string().nullable(),
    "ns:comments": z.string().nullable(),
    "ns:platform": z.string(),
    "ns:sensor": z.string(),
    "ns:mission_updated_timestamp": z.number(),
    "ns:flight_height_m": z.number(),
    "ns:flight_speed_ms": z.number(),
    "ns:orientation_deg": z.number(),
    "ns:margin_m": z.number(),
    "ns:forward_overlap": z.number(),
    "ns:side_overlap": z.number(),
    "ns:terrain_follow": z.string(),
    "ns:terrain_type": z.string(),
    "ns:target_surface_takeoff_m": z.number(),
    "ns:polygon": z.string(),
    "ns:polygon_with_buffer": z.string(),
    "ns:utm_crs": z.string(),
})

export const itemSchema = z.object({
    type: z.literal("Feature"),
    stac_version: z.string(),
    stac_extensions: z.array(z.string()),
    id: z.string(),
    geometry: polygonGeometrySchema,
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    properties: propertiesSchema,
    links: z.array(linkSchema),
    assets: assetsObjectSchema,
    collection: z.string(),
})

export const featureCollectionSchema = z.object({
    type: z.literal("FeatureCollection"),
    features: z.array(itemSchema),
})

export type StacItem = z.infer<typeof itemSchema>
export type StacFeatureCollection = z.infer<typeof featureCollectionSchema>
