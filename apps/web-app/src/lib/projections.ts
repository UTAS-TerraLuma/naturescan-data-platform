import type { ProjCode } from "./stac-schemas"
import { Proj4Projection } from "@math.gl/proj4"

/**
 * MGA2020 Projections defined with proj4 strings
 */
const mgaProjectionAliases: Record<ProjCode, string> = {
    "EPSG:7849":
        "+proj=utm +zone=49 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    "EPSG:7850":
        "+proj=utm +zone=50 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    "EPSG:7851":
        "+proj=utm +zone=51 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    "EPSG:7852":
        "+proj=utm +zone=52 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    "EPSG:7853":
        "+proj=utm +zone=53 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    "EPSG:7854":
        "+proj=utm +zone=54 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    "EPSG:7855":
        "+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    "EPSG:7856":
        "+proj=utm +zone=56 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
}

Proj4Projection.defineProjectionAliases(mgaProjectionAliases)

export { Proj4Projection }
