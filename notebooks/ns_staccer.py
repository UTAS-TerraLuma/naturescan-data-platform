from osgeo import gdal
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo

import pystac
from pystac.extensions.projection import ProjectionExtension

from ns_types import BandConfig, AssetConfig, ItemConfig

gdal.UseExceptions()

"""
See ./STAC_architecture.md for details on STAC choices.
"""


def create_bands_info(cog_path: Path, band_configs: list[BandConfig]) -> any:
    """
    Create the bands info object to go an a COG STAC item. A band contains
    name, description, eo:common_name, statistics, raster:histogram and
    eo:center_wavelength and eo:full_width_half_max if provided. Note, this
    function takes a while as the full asset statistics and histogram are
    calculated.

    :param cog_path: Path to the COG asset
    :type cog_path: Path
    :param band_configs: Config for the expected bands in the asset
    :type band_configs: list[BandConfig]

    :return: An object with band information. Compliant with STAC spec 1.1,
    eo and raster extensions version 2.0.
    """

    # Read in COG info
    cog_info = gdal.alg.raster.info(cog_path, stats=True, hist=True).Output()

    # Check number of bands is the same
    bands_info = cog_info["bands"]

    combined_bands = zip(bands_info, band_configs)
    bands = []
    for cog_band, config_band in combined_bands:
        band = {
            "name": config_band.name,
            "description": config_band.description,
            "eo:common_name": config_band.common_name,
        }

        # If statistics are there, add them to the band data
        statistics = {}
        if "maximum" in cog_band:
            statistics["maximum"] = cog_band["maximum"]
        if "minimum" in cog_band:
            statistics["minimum"] = cog_band["minimum"]
        if "mean" in cog_band:
            statistics["mean"] = cog_band["mean"]
        if "stdDev" in cog_band:
            statistics["stddev"] = cog_band["stdDev"]
        if statistics:
            band["statistics"] = statistics

        # If histogram info is there, add
        if "histogram" in cog_band:
            band["raster:histogram"] = cog_band["histogram"]

        # If extra config is included add it
        if config_band.center_wavelength:
            band["eo:center_wavelength"] = config_band.center_wavelength
        if config_band.full_width_half_max:
            band["eo:full_width_half_max"] = config_band.full_width_half_max

        bands.append(band)

    return bands


def create_main_asset(cog_path: Path, asset_config: AssetConfig, asset_href: str | None = None) -> pystac.Asset:
    """
    Create the main STAC asset object for the given asset and config.

    :param cog_path: Path to the main COG asset.
    :type cog_path: Path
    :param thumbnail_path: Path to a preview thumbnail for the COG.
    :type thumbnail_path: Path
    :param asset_config: Config for the provided asset.
    :type asset_config: AssetConfig
    :return: A stac asset onbject.
    :rtype: Asset
    """

    # Read in COG info
    cog_info = gdal.alg.raster.info(cog_path).Output()

    # Check number of bands is the same
    bands_info = cog_info["bands"]
    num_cog_bands = len(bands_info)
    num_config_bands = len(asset_config.bands)
    assert (
        num_config_bands == num_cog_bands
    ), f"Expected {num_config_bands} bands. COG had {num_cog_bands} bands."

    # Check nodata value is consistent across all bands
    nodata = bands_info[0]["noDataValue"]
    assert all(
        band["noDataValue"] == nodata for band in bands_info
    ), "All bands must share the same nodata"
    # Check nodata value is the same as provided
    assert (
        asset_config.nodata == nodata
    ), f"Expected no data value of {asset_config.nodata}. Instead found {nodata}."

    # Change datatype from GDAL naming to STAC naming
    if asset_config.data_type == "Byte":
        data_type = "uint8"
    elif asset_config.data_type == "Float32":
        data_type = "float32"
    else:
        raise Exception(f"Unhandled data type {data_type}")

    asset = pystac.Asset(
        href=asset_href if asset_href else str(cog_path),
        title=asset_config.title,
        description=asset_config.description,
        roles=["data"],
        media_type=pystac.MediaType.COG,
        extra_fields={
            "data_type": data_type,
            "nodata": nodata,
            "bands": create_bands_info(cog_path, asset_config.bands),
            "raster:sampling": "area",
        },
    )

    return asset


def create_thumbnail_asset(thumbnail_path: Path, thumbnail_href: str | None = None) -> pystac.Asset:
    """
    Create a thumbnail asset item

    :param thumbnail_path: Path to the thumbnail
    :type thumbnail_path: Path
    :return: A STAC asset item for the thumbnail
    :rtype: Asset
    """

    assert thumbnail_path.exists(), "Thumbnail file must exist"
    assert thumbnail_path.suffix == ".png", "Thumbnail file should be a PNG"

    thumbnail_info = gdal.alg.raster.info(thumbnail_path).Output()
    width, height = thumbnail_info["size"]

    asset = pystac.Asset(
        href=thumbnail_href if thumbnail_href else str(thumbnail_path),
        roles=["thumbnail"],
        media_type=pystac.MediaType.PNG,
        extra_fields={
            # Declare thumbnail as not geolocated
            # (though I think it technically still is via sidecar file)
            "proj:code": None,
            "proj:shape": [height, width],
        },
    )

    return asset


def create_item(cog_path: Path, thumbnail_path: Path, item_config: ItemConfig):
    """
    Create a STAC item for the given COG. Compliant with STAC spec 1.1 and the eo, raster
    and proj extensions v2.0.

    :param cog_path: Main COG asset path.
    :type cog_path: Path
    :param thumbnail_path: Thumbnail asset path.
    :type thumbnail_path: Path
    :param item_config: Config for this item.
    :type item_config: ItemConfig
    """

    # Use file name as ID
    id = cog_path.name.replace(".cog.tif", "")

    # Pull some metadata from file name
    # TODO: Pull further metadata from parent directories or other files
    # once the processing structure has been finalised.
    name_parts = cog_path.name.split("_")
    item_date = datetime.strptime(name_parts[0], "%Y%m%d")
    item_date = item_date.replace(tzinfo=ZoneInfo("Australia/Hobart"), hour=12)
    item_date = item_date.astimezone(ZoneInfo("UTC"))
    site = name_parts[1]
    agl = int(name_parts[3].replace("mAGL", ""))
    title = f"{site} {item_config.title}"

    # Use GDAL for most of the STAC geometry info
    cog_info = gdal.alg.raster.info(cog_path).Output()
    geometry = cog_info["wgs84Extent"]
    bbox = pystac.utils.geometry_to_bbox(geometry)

    item = pystac.Item(
        id=id,
        geometry=geometry,
        bbox=bbox,
        datetime=item_date,
        properties={
            # Common Metadata
            "title": title,
            "description": (
                item_config.description if item_config.description else title
            ),
            "mission": site,
            "platform": item_config.platform,
            "instruments": item_config.instruments,
            # Custom to NatureScan
            "naturescan:site": site,
            "naturescan:agl_m": agl,
            "naturescan:data_product": item_config.naturescan_data_product,
        },
        assets={
            "main": create_main_asset(cog_path, item_config.asset_config, item_config.asset_href),
            "thumbnail": create_thumbnail_asset(thumbnail_path, item_config.thumbnail_href),
        },
        # Add Raster and EO extensions 2.0.0 as I've done them manually
        stac_extensions=[
            "https://stac-extensions.github.io/raster/v2.0.0/schema.json",
            "https://stac-extensions.github.io/eo/v2.0.0/schema.json",
        ],
    )

    # Add Projection Extension
    proj = ProjectionExtension.ext(item, add_if_missing=True)
    stac_info = cog_info["stac"]
    proj.epsg = stac_info["proj:epsg"]
    proj.wkt2 = stac_info["proj:wkt2"]
    proj.shape = stac_info["proj:shape"]
    proj.projjson = stac_info["proj:projjson"]

    # Ordering via: https://github.com/stac-extensions/projection?tab=readme-ov-file#projtransform
    g = cog_info["geoTransform"]
    proj.transform = [g[1], g[2], g[0], g[4], g[5], g[3], 0, 0, 1]

    return item
