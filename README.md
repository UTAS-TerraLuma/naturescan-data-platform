![NatureScan](assets/ns-banner.png)

# NatureScan Data Platform

This is a meta-repository containing links to other naturescan data platform repositories and documentation.

## Repositories

| Repository                                                                     | Description                                                                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| [ns-web-explorer](https://github.com/UTAS-TerraLuma/ns-web-explorer)           | Web interface for viewing and interacting with NatureScan drone data                                    |
| [ns-api-stac](https://github.com/UTAS-TerraLuma/ns-api-stac)                   | STAC API service using [stac-fastapi-geoparquet](https://github.com/stac-utils/stac-fastapi-geoparquet) |
| [ns-api-titiler](https://github.com/UTAS-TerraLuma/ns-api-titiler)             | TiTiler application for serving drone orthomosaics as XYZ tiles                                         |
| [ns-api-labelling](https://github.com/UTAS-TerraLuma/ns-api-labelling)         | FastAPI server wrapping SAM3 model for interactive image segmentation                                   |
| [naturescan-cli](https://github.com/UTAS-TerraLuma/naturescan-cli)             | CLI tool for processing NatureScan data                                                                 |
| [ns-deploy](https://github.com/UTAS-TerraLuma/ns-deploy)                       | Docker and Caddy files for deploying the NatureScan data platform                                       |
| [ns-labelling-tool](https://github.com/UTAS-TerraLuma/ns-labelling-tool)       | A standalone tool (python backend + web frontend) for creating annotations on NatureScan surveys        |
| [ns-html-tools](https://github.com/UTAS-TerraLuma/ns-html-tools)               | One page HTML tools for working with NatureScan data                                                    |
| [ns-notebook-examples](https://github.com/UTAS-TerraLuma/ns-notebook-examples) | Example notebooks for working with the NatureScan datasets                                              |
| [stac-workshop](https://github.com/UTAS-TerraLuma/stac-workshop)               | Workshop notebook and slides on using STAC                                                              |

## Requirements

Each sub-app handles its own dependencies. You will need:

- [`pnpm`](https://pnpm.io/installation) and [`vite+`](https://viteplus.dev/guide/) for web apps
- [`pixi`](https://pixi.sh/latest/) or [`uv`](https://docs.astral.sh/uv/getting-started/installation/) for Python services
- [`docker`](https://docs.docker.com/get-started/get-docker/) for deployment

## Documentation

To Expand

- [STAC Architecture](./STAC_architecture.md) — STAC structure, extensions, and metadata conventions used across the platform
