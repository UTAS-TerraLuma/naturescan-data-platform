from pathlib import Path
from ns_types import AssetConfig
from osgeo import gdal

gdal.UseExceptions()

"""
This function demonstrates creating a COG from an input GeoTiff using the new 
["gdal" application](https://gdal.org/en/stable/programs/index.html#gdal-application) 
via Python. While most of it is generic, it does make some assumptions about the original
 GeoTiffs (i.e. some of this is hardcoded to NatureScan).

The script works as follows:
1.  Check the source tif file matches the expected config (number of bands, data type, 
    no data value).
2.  Create a temporary copy of the source GeoTiff so that we don't edit the source. If 
    the source is `${ID}.tif`, this temp file is `{$ID}.tmp.tif`.
3.  Edit the temporary tif to add metadata for the nodata value and the band information. 
    Doing so directly on the COG may not be safe. The nodata value is done using 
    [`gdal raster edit`](https://gdal.org/en/stable/programs/gdal_raster_edit.html). 
    The band metadata is done using the more traditional gdal bindings.
4.  Create the COG using [`gdal raster convert`](https://gdal.org/en/stable/programs/gdal_raster_convert.html). 
5.  Cleanup by deleting any `.tmp.tif` files.

For COG creation options I went with:
-   COMPRESSION: LZW - I originally chose ZSTD however my build of QGIS didn't support it. 
    I assume that might be an issue for some other users.
-   PREDICTOR: YES - For better compression ratio for both byte and float32 datasets
-   BIG_TIFF: IF_SAFER - Some of our orthomosaics are large enough to require big tiff
-   STATISTICS: YES - Useful metadata. We read statistics again when creating STAC items 
    so this may be redudant. 
"""


def create_cog(input: Path, output: Path, config: AssetConfig, force=False) -> None:
    """
    Converts a GeoTIFF file to a Cloud Optimized GeoTIFF (COG) with validation and metadata updates.

    :param input: Path to the input .tif file to be converted.
    :type input: pathlib.Path
    :param output: Path where the output COG file will be saved.
    :type output: pathlib.Path
    :param config: Configuration object specifying band information, data type, and nodata value.
    :type config: AssetConfig
    :param force: If True, overwrite the output file if it exists. Defaults to False.
    :type force: bool, optional

    :returns: None if the output file already exists or after successful conversion.
    :rtype: None

    :raises AssertionError: If input file is not a .tif, not a GeoTIFF, has incorrect bands, or mismatched data type/nodata.
    :raises RuntimeError: GDAL will raise a runtime error if it encounters an error while processing the COG.
    """
    # If output already exists skip (unless force is True)
    if output.exists() and not force:
        print(f"Skipping {input.name} as {output.name} already exists.")
        return None

    # Assert is a .tif file
    assert input.is_file(), "Input should be a file."
    assert input.suffix == ".tif", "Input should be a .tif file."

    tif_info = gdal.alg.raster.info(input=input).Output()

    # Assert is a GeoTiff file
    driver = tif_info["driverShortName"]
    assert "GTiff" == driver, f"Expected GTiff driver. Found {driver} driver instead."

    # Assert correct number of bands
    num_bands = len(tif_info["bands"])
    config_num_bands = len(config.bands)
    assert (
        num_bands == config_num_bands
    ), f"Expected {config_num_bands} bands. Found {num_bands} bands instead."

    # Assert bands of correct type
    data_type = tif_info["bands"][0]["type"]
    assert (
        config.data_type == data_type
    ), f"Expected {config.data_type} data type. Found {data_type} data type instead."

    # If there is a nodata value, assert that it as expected
    if "noDataValue" in tif_info["bands"][0]:
        nodata = tif_info["bands"][0]["noDataValue"]
        assert (
            config.nodata == nodata
        ), f"Expected nodata of {config.nodata}. Found {nodata} instead."

    # Create temp file
    tmp_file = input.with_suffix(".tmp.tif")

    # Copy src to a tmp file not to change anything
    # In the future, we may be copying from a remote src
    gdal.alg.dataset.copy(source=input, destination=tmp_file, overwrite=True)

    # Edit temp file to add nodata values
    gdal.alg.raster.edit(dataset=tmp_file, nodata=config.nodata)

    # Edit the temp file to add some band metadata
    # This can't be done by the new gdal program yet (I think)
    ds = gdal.Open(tmp_file, gdal.GA_Update)
    for i, band_config in enumerate(config.bands, start=1):
        band = ds.GetRasterBand(i)
        band.SetDescription(band_config.description)
        band.SetMetadataItem("BAND_NAME", band_config.name)
        band.SetMetadataItem("COMMON_NAME", band_config.common_name)
        band.SetColorInterpretation(band_config.gdal_color_interpretation)
    ds.Close()

    # Create COG using GDAL
    gdal.alg.raster.convert(
        input=tmp_file,
        output=output,
        output_format="COG",  # COG Format
        creation_option={
            "COMPRESS": "LZW",  # Lossless compression
            "PREDICTOR": "YES",  # Uses appropriate level for data type
            "BIGTIFF": "IF_SAFER",  # Might need to explicitly use YES if heuristic fails
            "STATISTICS": "YES",  # Make sure stats are included
        },
        overwrite=True,  # Allow overwriting of files
    )

    # Delete temp file
    gdal.alg.dataset.delete(filename=tmp_file)

    print(f"Successfully converted {input.name} to {output.name}.")

    return None


def create_thumbnail(input: Path, output: Path, force=False) -> None:
    """
    Docstring for create_cog

    :param input: Path to the input file to be converted.
    :type input: pathlib.Path
    :param output: Path where the output thumbnail file will be saved.
    :type output: pathlib.Path

    :param force: If True, overwrite the output file if it exists. Defaults to False.
    :type force: bool, optional

    :returns: None if the output file already exists or after successful conversion.
    :rtype: None

    :raises RuntimeError: GDAL will raise a runtime error if it encounters an error while processing the COG.
    """

    # If output already exists skip (unless force is True)
    if output.exists() and not force:
        print(f"Skipping {input.name} as {output.name} already exists.")
        return None

    # Get input info
    info = gdal.alg.raster.info(input, approx_stats=True).Output()

    # Get size and thumbnail target size
    src_width, src_height = info["size"]
    # 0 target size means GDAL will set the other dimension and create the
    # target size based off the aspect ratio (e.g. 0,512 may become 400x512)
    if src_width < src_height:
        target_size = "0,512"
    else:
        target_size = "512,0"

    num_bands = len(info["bands"])
    if num_bands == 3:
        # For RGB, jsut resize and write to PNG
        pipeline = f"read {str(input)} ! resize --size {target_size} ! write --of PNG --overwrite -o {str(output)}"
    elif num_bands == 4:
        # For MS, first we need to scale convert each band from float 32 to byte
        # First we scale each band to 0 - 1 using stdev as a cheap contrast stretch
        scale_pipelines = []
        for i, band in enumerate(info["bands"], start=1):
            mean = band["mean"]
            stddev = band["stdDev"]
            src_min = mean - 2 * stddev
            src_max = mean + 2 * stddev
            scale_pipelines.append(
                f"scale -b {i} --src-min {src_min} --src-max {src_max} --dst-min 0 --dst-max 1"
            )

        pipeline = [
            f"read {str(input)}",  # Read input
            f"resize --size {target_size}",  # Resize
            *scale_pipelines,  # Scale to 0 - 1
            f"scale --datatype Byte",  # Scale to byte (maps 0-1 to 0-255)
            "select -b 4,2,1",  # Select bands 4 (nir), 2 (red), 1 (green)
            f"write --of PNG --overwrite -o {str(output)}",  # Write to PNG
        ]

        # TODO: We loose the nodata value in this process, but an edit
        # is no good in a pipeline (not streamable?). Maybe masks in a future
        # iteration would be ideal.
        pipeline = " ! ".join(pipeline)
    else:
        raise Exception(f"Can't handle {num_bands} bands")

    gdal.alg.raster.pipeline(pipeline=pipeline)

    print(f"Successfully created thumbnail for {input.name} at {str(output)}")

    return None
