# API Segmentation Service

FastAPI-based image segmentation service using FastSAM (Fast Segment Anything Model).

## Structure

```
api-segmentation/
├── api_segmentation/          # Main Python package
│   ├── __init__.py
│   ├── main.py                # FastAPI application entry point
│   ├── api/                   # API routes
│   │   ├── __init__.py
│   │   └── routes.py          # Route definitions
│   └── core/                  # Core configuration
│       ├── __init__.py
│       └── config.py          # Application settings
└── models/                    # ML model files
    └── FastSAM-s.pt
```

## Development

Start the development server using pixi:

```bash
pixi run -e api-segmentation dev-api-segmentation
```

The API will be available at:

- Main API: http://localhost:8003
- Interactive docs: http://localhost:8003/docs
- Health check: http://localhost:8003/health

## Configuration

Environment variables can be set with the `SEGMENTATION_API_` prefix:

- `SEGMENTATION_API_DEBUG`: Enable debug mode (default: `true`)
- `SEGMENTATION_API_MODEL_PATH`: Path to the FastSAM model (default: `models/FastSAM-s.pt`)
- `SEGMENTATION_API_PORT`: Port to run the server on (default: `8003`)

## API Endpoints

### Core Endpoints

- `GET /` - Root endpoint with service information
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation (Swagger UI)

### API v1 Endpoints

- `GET /api/v1/` - API version information
- `GET /api/v1/health` - API health check

## Next Steps

To add segmentation functionality:

1. Create service layer in `api_segmentation/services/segmentation.py`
2. Add segmentation endpoints in `api_segmentation/api/routes.py`
3. Add request/response models in `api_segmentation/models/` (for Pydantic schemas)
4. Implement FastSAM integration using the `ultralytics` package
