# API: STAC

STAC API service using [stac-fastapi-geoparquet](https://github.com/stac-utils/stac-fastapi-geoparquet).

## Usage

Install dependencies:
```bash
pixi install
```

Start the dev server with default collections:
```bash
pixi run dev
```

Or specify a custom collections file:
```bash
pixi run dev /path/to/collections.json
```

The API will be available at `http://127.0.0.1:8002`.
