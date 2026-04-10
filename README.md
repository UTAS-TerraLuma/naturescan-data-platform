![NatureScan](assets/ns-banner.png)

# NatureScan Data Platform

This is a meta-repository containing links to other naturescan data platform repositories and documentation.

## Repositories

| Repository | Description |
|---|---|
| [ns-web-explorer](https://github.com/UTAS-TerraLuma/ns-web-explorer) | Web interface for viewing and interacting with NatureScan drone data |
| [ns-api-stac](https://github.com/UTAS-TerraLuma/ns-api-stac) | STAC API service using [stac-fastapi-geoparquet](https://github.com/stac-utils/stac-fastapi-geoparquet) |
| [ns-api-titiler](https://github.com/UTAS-TerraLuma/ns-api-titiler) | TiTiler application for serving drone orthomosaics as XYZ tiles |
| [ns-api-labelling](https://github.com/UTAS-TerraLuma/ns-api-labelling) | FastAPI server wrapping SAM3 model for interactive image segmentation |
| [ns-tool-stac](https://github.com/UTAS-TerraLuma/ns-tool-stac) | CLI tool for generating and managing STAC catalogs for NatureScan drone survey data |
| [ns-tool-cog](https://github.com/UTAS-TerraLuma/ns-tool-cog) | Tool for converting GeoTiffs into the cCoud Optimised GeoTiff (COG) format via GDAL. |
| [ns-tool-copc](https://github.com/UTAS-TerraLuma/ns-tool-copc) | Tool for converting point clouds into the cloud optimised point cloud (COPC) format via PDAL. |
| [ns-tool-metadata](https://github.com/UTAS-TerraLuma/ns-tool-metadata) | Python tool for extracting and managing metadata from DJI WPML (Waypoint Mission Language) files |
| [ns-deploy](https://github.com/UTAS-TerraLuma/ns-deploy) | Docker and Caddy files for deploying the NatureScan data platform |
| [stac-workshop](https://github.com/UTAS-TerraLuma/stac-workshop) | Workshop notebook and slides on using STAC |

## Requirements

Each sub-app handles its own dependencies. You will need:
- [`pnpm`](https://pnpm.io/installation) and [`vite+`](https://viteplus.dev/guide/) for web apps
- [`pixi`](https://pixi.sh/latest/) or [`uv`](https://docs.astral.sh/uv/getting-started/installation/) for Python services
- [`docker`](https://docs.docker.com/get-started/get-docker/) for deployment


## Documentation

To Expand

- [STAC Architecture](./STAC_architecture.md) — STAC structure, extensions, and metadata conventions used across the platform
