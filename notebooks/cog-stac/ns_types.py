from pydantic import BaseModel
from pathlib import Path


class BandConfig(BaseModel):
    name: str
    description: str
    common_name: str
    center_wavelength: float | None = None
    full_width_half_max: float | None = None
    gdal_color_interpretation: int = 0


class AssetConfig(BaseModel):
    title: str
    description: str | None = None
    nodata: int | float
    # Byte or Float32
    data_type: str
    bands: list[BandConfig]


class ItemConfig(BaseModel):
    title: str
    description: str | None = None
    platform: str = "dji-mavic-3m"
    instruments: list[str]
    naturescan_data_product: str
    asset_config: AssetConfig
    asset_href: str | None = None
    thumbnail_href: str | None = None