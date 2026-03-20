import os
from asyncio import run as aiorun
from pathlib import Path
from typing import Annotated

import typer
from rich import print

from stac_tool.fs import find_surveys_with_level1
from stac_tool.stac import (
    create_collection,
    create_stac_item,
    normalise_and_save_collection,
    save_feature_collection,
    save_stac_geoparquet,
)
from stac_tool.title import title_ascii
from stac_tool.utils import run_cmd

app = typer.Typer()

DRONE_DIR = Path(r"R:\CoSE\GPSS\TerraLuma\_data\NatureScan_data\NatureScan_drone")
DRONE_CONTAINER = "naturescan-drone"
STAC_DIR = Path(r"R:\CoSE\GPSS\TerraLuma\_data\NatureScan_data\NatureScan_stac")
STAC_CONTAINER = "naturescan-stac"
OBJECT_STORAGE_URL = os.getenv("OS_STORAGE_URL")


@app.command(
    help="Upload NatureScan_drone folder via rclone. Ignore the archive and raw data."
)
def upload_drone(
    dry_run: Annotated[
        bool, typer.Option("--dry-run", help="Perform a dry run without uploading")
    ] = False,
):
    print(f"Uploading {DRONE_DIR} to container {DRONE_CONTAINER}...")
    cmd = [
        "rclone",
        "sync",
        str(DRONE_DIR),
        f"myremote:{DRONE_CONTAINER}",
        "--filter",
        "- archive/**",
        "--filter",
        "- **/level0_raw/**",
        "--filter",
        "+ **/level1_proc/**",
        "--filter",
        "+ **/metadata/**",
        "--filter",
        "- *",
        "--verbose",
    ]

    if dry_run:
        cmd.append("--dry-run")

    run_cmd(cmd)


@app.command(help="Upload the NatureScan_stac folder.")
def upload_stac(
    dry_run: Annotated[
        bool, typer.Option("--dry-run", help="Perform a dry run without uploading")
    ] = False,
):
    cmd = [
        "rclone",
        "sync",
        str(STAC_DIR),
        f"myremote:{STAC_CONTAINER}",
        "--verbose",
    ]

    if dry_run:
        cmd.append("--dry-run")

    run_cmd(cmd)


@app.command(help="Create a stac catalog for all surveys with level1 data")
def create_stac():
    # Must have OS_STORAGE_URL env var for creating stac
    assert OBJECT_STORAGE_URL, "Missing OS_STORAGE_UL"

    # Find all relevant surveys
    surveys = find_surveys_with_level1(DRONE_DIR)
    print(f"Found {len(surveys)} surveys with level1 data.")

    # Assets will have a href relative to this base
    asset_base_href = f"{OBJECT_STORAGE_URL}/{DRONE_CONTAINER}"
    # Stac items will have a href relative to this base
    stac_base_href = f"{OBJECT_STORAGE_URL}/{STAC_CONTAINER}"

    # Create and save stac catalog
    stac_items = [create_stac_item(s, DRONE_DIR, asset_base_href) for s in surveys]
    collection = create_collection(stac_items)
    normalise_and_save_collection(collection, stac_base_href, STAC_DIR)
    print(f"Saved static catalog to {STAC_DIR}")

    stac_geoparquet_path = STAC_DIR / "naturescan.parquet"
    aiorun(save_stac_geoparquet(str(stac_geoparquet_path), stac_items))
    print(f"Saved as stac-geoparquet to {stac_geoparquet_path}")

    fc_path = STAC_DIR / "naturescan-items.json"
    save_feature_collection(fc_path, stac_items)
    print(f"Saved as a feature collection to {fc_path}")


@app.callback()
def print_title():
    print(title_ascii)
