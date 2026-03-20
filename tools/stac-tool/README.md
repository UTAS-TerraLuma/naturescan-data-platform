# stac-tool

CLI tool for managing NatureScan STAC catalogs and drone data.

## Installation

This tool uses Pixi for dependency management. Install dependencies:

```bash
cd tools/stac-tool
pixi install
```

## Usage

The tool provides three commands:

### Upload drone data
Uploads drone survey data to object storage via rclone:
```bash
pixi run stac-tool upload-drone [--dry-run]
```

### Upload STAC catalog
Uploads the STAC catalog to object storage:
```bash
pixi run stac-tool upload-stac [--dry-run]
```

### Create STAC catalog
Creates a STAC catalog from drone surveys with level1 data:
```bash
pixi run stac-tool create-stac
```

## Configuration

### Environment Variables
- `OS_STORAGE_URL` - Object storage URL (required for `create-stac` command)

### Hard-coded Paths
The tool currently uses hard-coded paths for data directories (configured for Windows R:\ drive):
- `DRONE_DIR` - NatureScan drone data directory
- `STAC_DIR` - STAC catalog output directory

Modify these in `src/stac_tool/main.py` if needed for your environment.

## Testing

Run the test suite:
```bash
pixi run test
```

## Dependencies

Key dependencies:
- GDAL >= 3.12.2
- pystac >= 1.14.3
- rio-stac >= 0.12.0
- geopandas >= 1.1.2
- rclone >= 1.73.1
- typer >= 0.24.0
