![NatureScan](assets/ns-banner.png)

# NatureScan Data Platform

This is a meta-repository containing links to other naturescan data platform repositories and documentation.

## Repositories

| Repository                                                                     | Description                                                                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| [naturescan-earth](https://github.com/UTAS-TerraLuma/naturescan-earth)         | Web explorer, STAC API and deployment for [naturescan.earth](https://naturescan.earth), in one monorepo |
| [ns-explorer-cli](https://github.com/UTAS-TerraLuma/ns-explorer-cli)           | `nsx`: an agent-first CLI for exploring NatureScan drone survey data via its STAC API                   |
| [naturescan-cli](https://github.com/UTAS-TerraLuma/naturescan-cli)             | CLI tool for processing NatureScan data                                                                 |
| [ns-labelling-tool](https://github.com/UTAS-TerraLuma/ns-labelling-tool)       | A standalone tool (python backend + web frontend) for creating annotations on NatureScan surveys        |
| [stac-workshop](https://github.com/UTAS-TerraLuma/stac-workshop)               | Workshop notebook and slides on using STAC                                                              |

## Requirements

Each sub-app handles its own dependencies. You will need:

- [`pnpm`](https://pnpm.io/installation) and [`vite+`](https://viteplus.dev/guide/) for web apps
- [`pixi`](https://pixi.sh/latest/) or [`uv`](https://docs.astral.sh/uv/getting-started/installation/) for Python services
- [`docker`](https://docs.docker.com/get-started/get-docker/) for deployment
