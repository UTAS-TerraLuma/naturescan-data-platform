# API Segmentation

Image segmentation API using FastSAM for automated object detection in geospatial imagery.

## Setup

```bash
pixi install
```

Download the FastSAM model and place it in `models/sam3.pt`, or set `MODEL_PATH` to the model file.

## Development

```bash
MODEL_PATH=/path/to/model.pt pixi run dev
```

The API runs on http://localhost:8003
