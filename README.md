# NatureScan Data Platform

This repository contains the code and service definitions for the NatureScan data platform. Currently
split into:

- `apps/` - Containing the any user facing applications:
  - `apps/web-app` - The primary web application
- `services/` - Containing the backend services:
  - `services/api-titiler` - TiTiler API
  - `services/api-stac` - STAC API powered by stac-geoparquet
  - `services/asset-server` - A dev only asset server to serve local files on a URL (for serving COGs and STAC items during dev)
- `notebooks/` - Any processing / analysis notebooks
- `notebooks_public/` - TODO: Notebooks for publishing online

## Requirements

Each sub-app handles its own dependencies. You will need:
- `pnpm` for javascript apps
- `pixp` for python services
- `docker` for select services

## Dev Servers
