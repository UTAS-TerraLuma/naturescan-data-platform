# NatureScan Data Platform

This repository contains the code and service definitions for the NatureScan data platform. Currently
split into:
- `apps/` - Containing the any user facing applications:
  - `apps/web-app` - The primary web application
- `services/` - Containing the backend services:
  - `services/api-titiler` - TiTiler API
  - `services/api-stac` - STAC API powered by stac-geoparquet
- `notebooks/` - TODO: Any processing / analysis notebooks
- `notebooks_public/` - TODO: Notebooks for publishing online

## Requirements

Environments for this repo are managed by [Pixi](https://pixi.sh). Follow the [install instructions](https://pixi.sh/v0.62.0/installation/) to install pixi. Pixi will then be able to install remaining requirements.

## Dev Usages

Run `pixi task list` to get a list of available tasks. Then run using `pixi run`. E.g. `pixi run dev-api-titiler`.

## Deployment

TODO. Ideally using docker ?
