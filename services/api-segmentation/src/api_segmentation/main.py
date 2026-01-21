from contextlib import asynccontextmanager
import os
from pathlib import Path
from typing import cast
import torch
import numpy as np
import rasterio
import supervision as sv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pyproj import Transformer
from rasterio.crs import CRS
from rasterio.io import DatasetReader
from rasterio.plot import reshape_as_image
from rasterio.warp import transform
from rasterio.windows import Window
from shapely import MultiPolygon, Polygon
from shapely.affinity import affine_transform, translate
from shapely.geometry import mapping
from shapely.ops import transform as shapely_transform
from ultralytics.models.sam import SAM

DEFAULT_MODEL_PATH = Path("/home/jamesg/models/sam3.pt")
MODEL_PATH = Path(os.environ.get("MODEL_PATH", DEFAULT_MODEL_PATH))


# Model will be stored here after loading
class AppState:
    model: SAM | None = None


app_state = AppState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model on startup and clean up on shutdown."""
    # Startup: Load the FastSAM model
    if not MODEL_PATH.exists():
        print(f"WARNING: Model file not found at {MODEL_PATH}")
        print("Set MODEL_PATH or place the model under services/api-segmentation/models/")
        app_state.model = None
    else:
        print(f"Loading FastSAM model from {MODEL_PATH}...")
        app_state.model = SAM(str(MODEL_PATH))
        print("Model loaded successfully!")

    yield

    # Shutdown: Clean up if needed
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def root():
    return {
        "message": "Image Segmentation API",
        "model_loaded": app_state.model is not None,
    }


Coordinate = tuple[float, float]


class SegmentRequest(BaseModel):
    url: str
    points: list[Coordinate]
    labels: list[int]


@app.post("/segment")
def predict(payload: SegmentRequest):
    """
    Perform image segmentation using FastSAM.

    Args:
        payload: Contains image URL, prompt points, and labels

    Returns:
        Segmentation results
    """
    model = app_state.model

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Set MODEL_PATH or place the model under services/api-segmentation/models/",
        )

    try:
        # Use first point as the center point
        center_point = payload.points[0]

        def wgs_point_to_crs(
            point: tuple[float, float], crs: CRS
        ) -> tuple[float, float]:
            lon, lat = point
            x, y = cast(
                tuple[list[float], list[float]],
                transform("EPSG:4326", crs, [lon], [lat]),
            )
            return (x[0], y[0])

        # Size of the image to extract from the orthomosaic
        img_pixel_size = 1004

        with rasterio.open(payload.url, mode="r") as src:
            src = cast(DatasetReader, src)
            src_coords = wgs_point_to_crs(center_point, src.crs)
            row, col = src.index(*src_coords)
            half_size = img_pixel_size // 2
            col_off = col - half_size
            row_off = row - half_size
            window = Window(
                col_off=col_off,  # type: ignore
                row_off=row_off,  # type: ignore
                width=img_pixel_size,  # type: ignore
                height=img_pixel_size,  # type: ignore
            )
            raster = src.read(window=window)
            image = reshape_as_image(raster)
            image = np.ascontiguousarray(image)

            # TODO: Actually use input points and labels
            #       Will need to translate them to image coordinates
            results = model.predict(image, points=[[half_size, half_size]], labels=[1])

            detections = sv.Detections.from_ultralytics(results[0])

            mask = detections.mask

            if mask is None:
                # TODO:
                raise HTTPException(
                    status_code=500,
                    detail="Segmentation failed.",
                )

            # TODO: Handle multipls masks
            # Note, polygons are in sub-image coordinates
            mask_polygons = sv.mask_to_polygons(mask[0])

            # Remove any small slithers? Though what area is 100. Not quite number
            # of pizels. Something about Green's Formula
            mask_polygons = sv.filter_polygons_by_area(mask_polygons, 100)

            # Create a single geometry
            multi_polygon = MultiPolygon([Polygon(points) for points in mask_polygons])

            # Translate to orthomsoaic pixel coordinates
            multi_polygon = translate(multi_polygon, xoff=col_off, yoff=row_off)

            T = src.transform
            shapely_affine_transform_mat: list[float] = [
                T.a,
                T.b,
                T.d,
                T.e,
                T.xoff,
                T.yoff,
            ]
            multi_polygon = affine_transform(
                multi_polygon, shapely_affine_transform_mat
            )

            crs_transformer = Transformer.from_crs(src.crs, "EPSG:4326", always_xy=True)

            multi_polygon = shapely_transform(crs_transformer.transform, multi_polygon)

            feature = {
                "type": "Feature",
                "geometry": mapping(multi_polygon),
                "properties": {
                    "url": payload.url,
                    "prompt_points": payload.points,
                    "prompt_labels": payload.labels,
                    # TODO: Add metadata about the predictions
                },
            }

        return feature

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Segmentation failed: {str(e)}",
        )


@app.get("/debug/gpu-info")
def gpu_info():
    """Check GPU availability and model device placement."""
    return {
        "cuda_available": torch.cuda.is_available(),
        "cuda_device_count": torch.cuda.device_count(),
        "cuda_current_device": torch.cuda.current_device() if torch.cuda.is_available() else None,
        "cuda_device_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "model_device": str(next(app_state.model.model.parameters()).device) if app_state.model else "No model loaded",
    }

@app.get("/health")
def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": app_state.model is not None,
    }
