import json
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import pystac
import rustac
from osgeo import gdal
from pystac.extensions.projection import ProjectionExtension

from stac_tool.metadata import SurveyMetadata, read_survey_metadata
from stac_tool.utils import glob_one

gdal.UseExceptions()


def create_collection(items: list[pystac.Item]) -> pystac.Collection:
    terra_luma_provider = pystac.Provider(
        name="TerraLuma",
        description="TerraLuma University of Tasmania",
        roles=[
            pystac.ProviderRole.HOST,
            pystac.ProviderRole.LICENSOR,
            pystac.ProviderRole.PRODUCER,
            pystac.ProviderRole.PROCESSOR,
        ],
        url="https://www.utas.edu.au/research/projects/terraluma",
    )

    naturescan_collection = pystac.Collection(
        id="naturescan",
        title="TerraLuma NatureScan Collection",
        description="TerraLuma NatureScan Collection",
        extent=pystac.Extent.from_items(items),
        providers=[terra_luma_provider],
    )
    naturescan_collection.add_items(items)

    # TODO - Add collection level summaries

    return naturescan_collection


def normalise_and_save_collection(
    collection: pystac.Collection, stac_base_href: str, dest: str | Path
):
    collection.normalize_hrefs(stac_base_href)
    collection.save(
        catalog_type=pystac.CatalogType.ABSOLUTE_PUBLISHED, dest_href=str(dest)
    )


async def save_stac_geoparquet(file: str, stac_items: list[pystac.Item]):
    items = [item.to_dict() for item in stac_items]
    await rustac.write(file, items)


# Save a feature collection of the whole stac collection
def save_feature_collection(path: Path, stac_items: list[pystac.Item]):
    items = [item.to_dict() for item in stac_items]
    fc = {
        "type": "FeatureCollection",
        "features": items,
        "extent": pystac.Extent.from_items(stac_items).to_dict(),
    }
    with open(path, "w") as f:
        json.dump(fc, f, indent=2)


def create_stac_item(survey: Path, drone_root: Path, asset_base_href: str):
    metadata = read_survey_metadata(survey)

    assert len(metadata.mission) == 1, "Currently only handles surveys with one mission"
    mission_properties = metadata.mission[0].properties.model_dump(by_alias=True)

    assert metadata.mission[0].properties.sensor == "m3m", (
        "Currently only handles m3m sensors"
    )

    rgb_cog = glob_one(survey / "level1_proc", "*_rgb.cog.tif")
    rgb_href = f"{asset_base_href}/{str(rgb_cog.relative_to(drone_root))}"

    ms_cog = glob_one(survey / "level1_proc", "*_ms.cog.tif")
    ms_href = f"{asset_base_href}/{str(ms_cog.relative_to(drone_root))}"

    thumbnail = glob_one(survey / "level1_proc", "*_rgb.thumbnail.png")
    thumbnail_href = f"{asset_base_href}/{str(thumbnail.relative_to(drone_root))}"

    item_date = datetime.strptime(metadata.user.date, "%Y%m%d")
    # TODO - Get proper timezone - or use mission update timestamp ?
    item_date = item_date.replace(tzinfo=ZoneInfo("Australia/Hobart"), hour=12)
    item_date = item_date.astimezone(ZoneInfo("UTC"))

    geometry = metadata.mission[0].geometry.model_dump()
    bbox = pystac.utils.geometry_to_bbox(geometry)

    item = pystac.Item(
        id=metadata.user.survey_uid,
        geometry=geometry,
        bbox=bbox,
        datetime=item_date,
        properties={
            "title": metadata.user.survey_uid,
            "description": f"{metadata.user.property} {metadata.user.site} {item_date.day}/{item_date.month}/{item_date.year} {metadata.mission[0].properties.sensor} {metadata.mission[0].properties.flight_height_m}m AGL",
            **metadata.user.model_dump(by_alias=True),
            **mission_properties,
            "platform": metadata.mission[0].properties.platform,
            "instruments": metadata.mission[0].properties.sensor,
        },
        stac_extensions=[
            ProjectionExtension.get_schema_uri(),
            # Raster and EO are added manually as pystac doesn't do v2.0.0 of them yet
            "https://stac-extensions.github.io/raster/v2.0.0/schema.json",
            "https://stac-extensions.github.io/eo/v2.0.0/schema.json",
        ],
        assets={
            "thumbnail": create_thumbnail_asset(thumbnail, thumbnail_href),
            "rgb": create_m3m_rgb_asset(rgb_cog, metadata, rgb_href),
            "ms": create_m3m_ms_asset(ms_cog, metadata, ms_href),
        },
    )

    return item


def create_thumbnail_asset(thumbnail_path: Path, href: str) -> pystac.Asset:
    assert thumbnail_path.exists(), "Thumbnail file must exist"
    assert thumbnail_path.suffix == ".png", "Thumbnail file should be a PNG"

    thumbnail_info = gdal.alg.raster.info(thumbnail_path).Output()  # pyright: ignore
    width, height = thumbnail_info["size"]

    return pystac.Asset(
        href=href,
        roles=["thumbnail"],
        media_type=pystac.MediaType.PNG,
        extra_fields={
            # Declare thumbnail as not geolocated
            # (though I think it technically still is via sidecar file)
            "proj:code": None,
            "proj:shape": [height, width],
        },
    )


def create_m3m_rgb_asset(
    rgb_path: Path, metadata: SurveyMetadata, href: str
) -> pystac.Asset:
    cog_info = gdal.alg.raster.info(rgb_path).Output()  # pyright: ignore

    bands = [
        {
            "name": "b1",
            "description": "Red (R)",
            "eo:common_name": "red",
        },
        {
            "name": "b2",
            "description": "Green (G)",
            "eo:common_name": "green",
        },
        {
            "name": "b3",
            "description": "Blue (B)",
            "eo:common_name": "blue",
        },
    ]
    add_gdal_info_to_bands(cog_info, bands)

    asset = pystac.Asset(
        title=f"RGB {metadata.user.survey_uid}",
        href=href,
        roles=["data"],
        media_type=pystac.MediaType.COG,
        extra_fields={
            "data_type": "uint8",
            "nodata": 255,
            "raster:sampling": "area",
            "bands": bands,
        },
    )

    add_proj_ext(asset, cog_info)

    return asset


def create_m3m_ms_asset(
    ms_path: Path, metadata: SurveyMetadata, href: str
) -> pystac.Asset:
    cog_info = gdal.alg.raster.info(ms_path, approx_stats=True).Output()  # pyright: ignore

    bands = [
        {
            "name": "b1",
            "description": "Green (G): 560 ± 16 nm",
            "eo:common_name": "green",
            "eo:center_wavelength": 0.56,
            "eo:full_width_half_max": 0.016,
        },
        {
            "name": "b2",
            "description": "Red (R): 650 ± 16 nm",
            "eo:common_name": "red",
            "eo:center_wavelength": 0.65,
            "eo:full_width_half_max": 0.016,
        },
        {
            "name": "b3",
            "description": "Red Edge (RE): 730 ± 16 nm",
            "eo:common_name": "rededge",
            "eo:center_wavelength": 0.73,
            "eo:full_width_half_max": 0.016,
        },
        {
            "name": "b4",
            "description": "Near infrared (NIR): 860 ± 26 nm",
            "eo:common_name": "nir",
            "eo:center_wavelength": 0.86,
            "eo:full_width_half_max": 0.026,
        },
    ]
    add_gdal_info_to_bands(cog_info, bands)

    asset = pystac.Asset(
        title=f"MS {metadata.user.survey_uid}",
        href=href,
        roles=["data"],
        media_type=pystac.MediaType.COG,
        extra_fields={
            "data_type": "float32",
            "nodata": 32767.0,
            "raster:sampling": "area",
            "bands": bands,
        },
    )

    add_proj_ext(asset, cog_info)

    return asset


def add_gdal_info_to_bands(cog_info: Any, bands: list[dict[str, Any]]) -> None:

    cog_bands_info = cog_info["bands"]
    assert len(cog_bands_info) == len(bands), (
        "Expected provided bands and cog info bands length to match."
    )

    for i, band_info in enumerate(cog_bands_info):
        band = bands[i]

        # If statistics are there, add them to the band data
        statistics = {}
        if "maximum" in band_info:
            statistics["maximum"] = band_info["maximum"]
        if "minimum" in band_info:
            statistics["minimum"] = band_info["minimum"]
        if "mean" in band_info:
            statistics["mean"] = band_info["mean"]
        if "stdDev" in band_info:
            statistics["stddev"] = band_info["stdDev"]
        if statistics:
            band["statistics"] = statistics

        # If histogram info is there, add
        if "histogram" in band_info:
            band["raster:histogram"] = band_info["histogram"]


def add_proj_ext(asset: pystac.Asset, cog_info: Any):
    """Adds info for the projection extension to the asset as taken gdal info"""
    proj_ext = ProjectionExtension.ext(asset)
    proj_code = f"EPSG:{cog_info['stac']['proj:epsg']}"
    proj_json = cog_info["stac"]["proj:projjson"]
    proj_shape = cog_info["stac"]["proj:shape"]
    proj_wkt2 = cog_info["stac"]["proj:wkt2"]
    g = cog_info["geoTransform"]
    proj_transform = [g[1], g[2], g[0], g[4], g[5], g[3], 0, 0, 1]
    proj_ext.apply(
        code=proj_code,
        projjson=proj_json,
        shape=proj_shape,
        wkt2=proj_wkt2,
        transform=proj_transform,
    )
