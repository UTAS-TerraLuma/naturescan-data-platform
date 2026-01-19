# STAC Architecture

This document outlines the current STAC structure / architecture that we've chosen to follow.

## STAC Structure

```txt
Catalog: NatureScan
|-- Collection: RGB Orthomosaics
|   |-- Item: RGB Item 1
|   |   |-- Asset: Main (RGB Orthomosaic)
|   |   |-- Asset: Thumbnail
|   |-- Item: RGB Item 2
|   |   |-- Asset: Main (RGB Orthomosaic)
|   |   |-- Asset: Thumbnail
|-- Collection: MS Orthomosaics
|   |-- Item: RGB Item 1
|   |   |-- Asset: Main (MS Orthomosaic)
|   |   |-- Asset: Thumbnail
|   |-- Item: RGB Item 2
|   |   |-- Asset: Main (MS Orthomosaic)
|   |   |-- Asset: Thumbnail
|-- Collection: SfM Point Clouds (Eventually)
```

We can create other collections eventually. Would that create duplicate items? Or do the collections link to the original items?

## STAC Spec

We are using the latest STAC 1.1. This includes the common metadata (some of which is previously in the bands and raster extension).

### Common Metadata

See [common metadata spec page](https://github.com/radiantearth/stac-spec/blob/master/commons/common-metadata.md)

- Basics
  - `title`, `description`: as spected
  - `keywords`, `roles`: TBC
- Date & Time
  - `datetime`: as expected. Though it is recommended for drones we use a start and end time
- Licensing
  - `license`: Exact details TBC. Should be added at a collection level
- Provider
  - provider object: Exact details TBC. Terra Luma def should be included.
- Instrument
  - `platform`: DJI Mavic 3M (item)
  - `instruments`: [DJI Mavic 3M RGB Camera] (item)
  - `mission`: NTAFIN0013 (item)
  - `gsd`: (item) if we can
- Bands
  - Can include some of this information at the collection level. But we should
    still include it at the asset level. Slight variations for previous eo and raster extensions
  - `name`: unique name, e.g. b1 or eed
  - `description`: For us likely same as name (or not needed)
- Data Values (can go at asset level or band level)
  - `nodata`: -32767.0 (asset)
  - `data_type`: float32 (asset)
  - `statistics`: min, max, mean, stddev (band)
  - `unit`: ?? should not be metre though

### Proj Extension 2.0

Most of this can come directly from GDAL raster info.

- `proj:code`: GDAL provides as proj:epsg
- `proj:wkt2`: GDAL provides
- `proj:projjson`: GDAL provides but it [needs reordering](https://github.com/stac-extensions/projection?tab=readme-ov-file#projtransform)
- `proj:shape`: GDAL provides
- `proj:transform`: GDAL provides

Seemingly that's all that's needed to comply with best practices. However, proj:geometry, proj:bbox
and proj:centroid can also be derived fairly easily from other parts of GDAL info.

- `proj:geometry` - GeoJSON but in original CRS
- `proj:bbox` - BBox in original CRS
- `proj:centroid` - Centroid coordinates but in lat/lng

### EO Extension 2.0

These (expect maybe common_name and center wavelength) need to be provided. (i.e. they won't reliably be in the COG metadata).

- `eo:common_name` (band)
- `eo:center_wavelength` (band)
- `eo:full_width_half_max` (band)
- `eo:cloud_cover`: Might have from user metadata (estimated percentage) (asset)
- `eo:snow_cover`: N/A? (asset)

Previously included eo:bands but is not required anymore as bands are in common metadata. The presence of eo: fields indicate that a band is spectral.

Might need some info on what the values are.

### Raster Extension 2.0

- `raster:sampling`: area (asset)
- `raster:bits_per_sample`: not required as we are using a standard amount of bits per the data_type
- `raster:spatial_resolution`: (asset) Average spatial resolution (in meters) of the pixels in the band. How does this differ to GSD?
- `raster:scale`: Multiplicator factor of the pixel value to transform into the value (i.e. translate digital number to reflectance). I don't think we have
- `raster:offset`: Number to be added to the pixel value (after scaling) to transform into the value (i.e. translate digital number to reflectance). I don't think we have
- `raster:histogram`: (band) Histogram distribution information of the pixels values in the band.
  - histogram object
  - count: # of buckets
  - min: min value or mean value of first bucket
  - max: max value or mean value of last bucket
  - buckets: number[] # of pixels per bucket

## Detailed Structure

```yaml
# Collection
title: NatureScan RGB Orthomosaics                                  # Hard Coded ✅
description: ...                                                    # Hard Coded ✅
license: TBC                                                        # Hard Coded 🚧
providers:                                                          # Hard Coded ✅🚧
    -   name: TerraLuma
        description: ...
        url: https://www.utas.edu.au/research/projects/terraluma
        roles:
            - licensor
            - producer
            - processor
            - host

# Item
title: ...                                                          # Derived from metadata (filename) ✅
datetime: ...                                                       # Derived from metadata (filename) ✅
mission: ...                                                        # Derived from metadata (filename) ✅
platform: DJI Mavic 3M                                              # Hard Coded ✅
instruments: [DJI Mavic 3M RGB Camera]                              # Hard Coded ✅
# -- proj extension --
proj:code: from GDAL info stac                                      # Derived from dataset ✅
proje:wkt2: from GDAL info stac                                     # Derived from dataset ✅
proj:projjson: from GDAL info stac                                  # Derived from dataset ✅
proj:shape: from GDAL info stac                                     # Derived from dataset ✅
proj:transform: from GDAL info geoTransform with reordering         # Derived from dataset ✅
proj:geometry: TBC from GDAL info corners                           # Derived from dataset 🚧
proj:bbox: TBC from GDAL info corners                               # Derived from dataset 🚧
proj:centroid: TBC form GDAL info wgs84 extent                      # Derived from dataset 🚧

# Main Asset
nodata: 255                                                         # Derived from dataset (expected) ✅
data_type: uint8                                                    # Derived from dataset (expected) ✅
unit: TBC                                                           # ? 🚧
# -- eo extension --
eo:cloud_cover: TBC if possible                                     # Derived from metadata (TBC) 🚧
# -- raster extension --
raster:sampling: area                                               # literal value ✅
raster:spatial_resolution: TBC if I can work out                    # Derived from dataset (TBC how) 🚧
# bands
bands:
    -   name: b1                                                    # Hard coded* ✅
        description: Red (R)                                        # Hard coded* ✅
        statistics:                                                 # Derived from dataset ✅
            minimum: ...
            maximum: ...
            mean: ...
            stddev: ...
        eo:common_name: red                                         # Hard coded* ✅
        eo:center_wavelength: ...                                   # Hard coded* ✅
        eo:full_width_half_max: ...                                 # Hard coded* ✅
        raster:historgram: ...                                      # Derived from dataset ✅
            count: ..
            min: ..
            max: ..
            buckets: ..
    -   ...
```

Comments explain where data comes from:

- hard coded - values are coded into the STAC pipeline. Could also be considered user provided. The `*` is marked for fields that could in theory be derived from the dataset but are instead provided for ease as the GDAL info stac `eo:bands`, `raster:bands` and `bands` fields are not 100% what we want.
- derived from dataset - values should be within required COG metadata (e.g. geospatial info)
- derived from metadata - values derived from metadata, be it from the COG, from the COG file name or other source
