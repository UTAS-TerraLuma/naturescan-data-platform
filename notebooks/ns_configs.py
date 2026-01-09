from ns_types import BandConfig, AssetConfig, ItemConfig

RGB_ASSET_CONFIG = AssetConfig(
    title="RGB Orthmosaic Asset",
    nodata=255,
    data_type="Byte",
    bands=[
        BandConfig(
            name="b1",
            description="Red (R)",
            common_name="red",
            gdal_color_interpretation=3,
        ),
        BandConfig(
            name="b2",
            description="Green (G)",
            common_name="blue",
            gdal_color_interpretation=4,
        ),
        BandConfig(
            name="b3",
            description="Blue (B)",
            common_name="blue",
            gdal_color_interpretation=5,
        ),
    ],
)

MS_ASSET_CONFIG = AssetConfig(
    title="MS Orthomosaic Asset",
    nodata=-32767.0,
    data_type="Float32",
    bands=[
        BandConfig(
            name="b1",
            description="Green (G): 560 ± 16 nm",
            common_name="green",
            center_wavelength=0.56,
            full_width_half_max=0.016,
            gdal_color_interpretation=4,
        ),
        BandConfig(
            name="b2",
            description="Red (R): 650 ± 16 nm",
            common_name="red",
            center_wavelength=0.65,
            full_width_half_max=0.016,
            gdal_color_interpretation=3,
        ),
        BandConfig(
            name="b3",
            description="Red Edge (RE): 730 ± 16 nm",
            common_name="rededge",
            center_wavelength=0.73,
            full_width_half_max=0.016,
            gdal_color_interpretation=19,
        ),
        BandConfig(
            name="b4",
            description="Near infrared (NIR): 860 ± 26 nm",
            common_name="nir",
            center_wavelength=0.86,
            full_width_half_max=0.026,
            gdal_color_interpretation=20,
        ),
    ],
)

RGB_ITEM_CONFIG = ItemConfig(
    title="RGB Orthomosaic Item",
    instruments=["dji-mavic-3m-rgb-camera"],
    naturescan_data_product="rgb",
    asset_config=RGB_ASSET_CONFIG,
)

MS_ITEM_CONFIG = ItemConfig(
    title="MS Orthomosaic Item",
    instruments=["dji-mavic-3m-ms-camera"],
    naturescan_data_product="ms",
    asset_config=MS_ASSET_CONFIG,
)
