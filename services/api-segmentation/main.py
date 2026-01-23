import os
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import httpx
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from numpy.typing import NDArray
from PIL import Image
from pydantic import BaseModel, HttpUrl
from supervision import Detections, mask_to_polygons
from ultralytics.models.sam import SAM

DEFAULT_MODEL_PATH = Path("/home/jamesg/models/sam3.pt")
MODEL_PATH = Path(os.environ.get("MODEL_PATH", DEFAULT_MODEL_PATH))

# Load model at startup
model = None

# A ring is an array of points. a point is a list[float]
type Point = list[float]
type Ring = list[Point]
# A polygon is a list of rings
# https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
type Polygon = list[Ring]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global model
    print(f"CUDA? {torch.cuda.is_available()}")
    print(f"Loading model from {MODEL_PATH}")
    model = SAM(str(MODEL_PATH))
    print("Model loaded successfully")
    yield
    # Shutdown (cleanup if needed)
    model = None


app = FastAPI(title="SAM Segmentation API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class SegmentRequest(BaseModel):
    url: HttpUrl
    points: list[list[float]]
    labels: list[int]


class SegmentResponse(BaseModel):
    polygons: list[Polygon]


@app.post("/segment", response_model=SegmentResponse)
async def segment(request: SegmentRequest):
    """
    Segment an image using SAM model.

    Args:
        url: URL to the image
        points: Array of 2D points (e.g., [[512, 512], [100, 200]])
        labels: Array of 1s and 0s corresponding to each point

    Returns:
        polygons: List of polygons representing the segmentation masks
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    if len(request.points) != len(request.labels):
        raise HTTPException(
            status_code=400, detail="Number of points must match number of labels"
        )

    try:
        # Download image into memory
        async with httpx.AsyncClient() as client:
            response = await client.get(str(request.url))
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))

        # Run prediction with PIL.Image object
        results = model.predict(
            image, points=request.points, labels=request.labels, imgsz=[1036]
        )

        # Convert to detections
        detections = Detections.from_ultralytics(results[0])
        masks = detections.mask

        if masks is None or len(masks) == 0:
            return SegmentResponse(polygons=[])

        # TODO - Better handling of multiple masks and polygons
        # TODO - Add other data (e.g. confidence)

        # Only use first mask for now
        mask: NDArray = masks[0]

        # returns multiple polygons defined as a single ring
        polygons_nd = mask_to_polygons(mask)

        polygons: list[Polygon] = []
        for polygon_nd in polygons_nd:
            ring: Ring = polygon_nd.tolist()
            # Add single ring into array to be compliant with GeoJSON spec
            polygon: Polygon = [ring]
            polygons.append(polygon)

        return SegmentResponse(polygons=polygons)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {str(e)}")


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "cuda_available": torch.cuda.is_available(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
