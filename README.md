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

Environments for this repo are managed by [Pixi](https://pixi.sh). Follow the [install instructions](https://pixi.sh/v0.62.0/installation/) to install pixi. Pixi will then be able to install remaining requirements.

## Dev Usages

Run `pixi task list` to get a list of available tasks. Then run using `pixi run`. E.g. `pixi run dev-api-titiler`.

### Notebook Usage

A Jupyter notebook server can be ran using `pixi run dev-notebooks`. This will automatically install the notebooks environment.
Alternatively, if using VSCode, you should be able to select the Kernel directly from `.pixi/envs/notebooks` after the environment has
been installed (either automatically from above or via `pixi install -e notebooks`).

TODO - Add marimo as an option

## Deployment

TODO. Ideally using docker ?
