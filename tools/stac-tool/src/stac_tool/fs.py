from pathlib import Path

from stac_tool.utils import glob_one


def find_surveys_with_level1(naturescan_drone: Path) -> list[Path]:
    """
    Find all level dirs in the naturescan_drone folder.

    We manually navigate the root dir because using something
    like .rglob is slow on the R drive due to the network
    and large amount of files in level0_raw folders.
    """
    surveys = []

    for site_dir in naturescan_drone.iterdir():
        if not site_dir.is_dir():
            continue
        for date_dir in site_dir.iterdir():
            if not date_dir.is_dir():
                continue
            for survey_dir in date_dir.glob("survey_*"):
                if not survey_dir.is_dir():
                    continue
                for level1_dir in survey_dir.glob("level1_proc"):
                    if not level1_dir.is_dir():
                        continue
                    try:
                        check_level1_dir(level1_dir)
                        check_metadata_dir(level1_dir.parent / "metadata")
                        surveys.append(level1_dir.parent)
                    except AssertionError as e:
                        print(f"{survey_dir} did not have all the required files.\n{e}")

    return surveys


def check_level1_dir(level1_dir: Path):
    """Checks level1 dir has ms and rgb cog"""
    rgb_cog = glob_one(level1_dir, "*_rgb.cog.tif")
    assert rgb_cog.is_file(), f"RGB COG must be a file at {rgb_cog}"
    ms_cog = glob_one(level1_dir, "*_ms.cog.tif")
    assert ms_cog.is_file(), f"MS COG must be a file at {ms_cog}"
    # TODO - Check for point cloud


def check_metadata_dir(metadata_dir: Path):
    """Check metadata dir exists and has user metadata"""
    assert metadata_dir.is_dir(), f"Metadata folder should exist at {metadata_dir}"
    user_metadata = glob_one(metadata_dir, "*_user.json")
    assert user_metadata.is_file(), f"User metadata should exist at {user_metadata}"
