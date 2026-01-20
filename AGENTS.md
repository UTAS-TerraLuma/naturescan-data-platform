# Repository Guidelines

## Project Structure & Module Organization
- `apps/` contains user-facing apps. `apps/web-app` is the primary web client (Vite + React).
- `services/` hosts backend services: `api-titiler`, `api-stac`, `api-segmentation`, and `asset-server`.
- `notebooks/` holds analysis/processing notebooks; `notebooks_public/` is reserved for published notebooks.
- Local dev assets are expected under a path like `/home/jamesg/test_data/naturescan/` and are served via the asset server.

## Build, Test, and Development Commands
- `task web-app` starts the web app (`pnpm run dev` in `apps/web-app`).
- `task api-stac` starts STAC API (`pixi run dev` in `services/api-stac`).
- `task api-titiler` starts TiTiler API (`pixi run dev` in `services/api-titiler`).
- `task api-segmentation` starts the segmentation API (`pixi run dev` in `services/api-segmentation`).
- `task asset-server` serves local assets (`pnpm dlx http-server ...`).
- Build web app: `pnpm run build` in `apps/web-app`.

## Coding Style & Naming Conventions
- Follow existing formatting in each subproject; avoid reformatting unrelated code.
- Web app uses Prettier (`pnpm run format`) and Oxlint (`pnpm run lint`).
- Keep names descriptive and aligned with existing patterns (e.g., `api-*` services, `web-app`).

## Testing Guidelines
- Web app uses Vitest: run `pnpm run test` in `apps/web-app`. Currently not being used.
- No repo-wide coverage requirements are documented; add tests for new UI behavior or critical logic.

## Commit & Pull Request Guidelines
- Recent commits are short, imperative, and lowercase (e.g., “very basic front end”).
- Aim for concise commit messages describing the change.
- PRs should include: a brief summary, linked issues (if any), and screenshots for UI changes.

## Configuration Tips
- Service dependencies are managed per directory (Pixi for Python services, pnpm for JS).
- Ports and paths are centralized in `taskfile.yml`; update there when adding services.
