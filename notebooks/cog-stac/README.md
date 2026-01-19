# COG STAC Notebooks

Notebooks and scripts for converting GeoTiffs to COGs and creating a STAC around them.
Currently doesn't deal with uploading COGs and STAC to object storage.

## Peoj Issue

I had an issue with proj (via GDAL) not being able to find its database directory (where it storeds `proj.db`). It only occured on VSCode via WSL. To solve add a `PROJ_DATA` variable to a `.env` file. Verify it is working correctly via 

```
import os, pyproj
print("PROJ_DATA:", os.environ.get("PROJ_DATA"))
print("pyproj data dir:", pyproj.datadir.get_data_dir())
```