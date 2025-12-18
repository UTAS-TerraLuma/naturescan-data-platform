"""API routes for the segmentation service."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "api-segmentation",
        "version": "0.1.0",
        "description": "Image segmentation API using FastSAM",
    }
