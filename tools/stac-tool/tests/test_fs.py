import pytest

from stac_tool.fs import check_level1_dir, check_metadata_dir, find_surveys_with_level1

# --- check_level1_dir ---


def test_check_level1_dir_valid(tmp_path):
    level1 = tmp_path / "level1_proc"
    level1.mkdir()
    (level1 / "survey_rgb.cog.tif").touch()
    (level1 / "survey_ms.cog.tif").touch()
    check_level1_dir(level1)  # should not raise


def test_check_level1_dir_missing_rgb(tmp_path):
    level1 = tmp_path / "level1_proc"
    level1.mkdir()
    (level1 / "survey_ms.cog.tif").touch()
    with pytest.raises(ValueError):
        check_level1_dir(level1)


def test_check_level1_dir_missing_ms(tmp_path):
    level1 = tmp_path / "level1_proc"
    level1.mkdir()
    (level1 / "survey_rgb.cog.tif").touch()
    with pytest.raises(ValueError):
        check_level1_dir(level1)


def test_check_level1_dir_multiple_rgb(tmp_path):
    level1 = tmp_path / "level1_proc"
    level1.mkdir()
    (level1 / "a_rgb.cog.tif").touch()
    (level1 / "b_rgb.cog.tif").touch()
    (level1 / "survey_ms.cog.tif").touch()
    with pytest.raises(ValueError):
        check_level1_dir(level1)


# --- check_metadata_dir ---


def test_check_metadata_dir_valid(tmp_path):
    metadata = tmp_path / "metadata"
    metadata.mkdir()
    (metadata / "test_user.json").touch()
    check_metadata_dir(metadata)  # should not raise


def test_check_metadata_dir_missing_dir(tmp_path):
    with pytest.raises(AssertionError):
        check_metadata_dir(tmp_path / "metadata")


def test_check_metadata_dir_missing_user_json(tmp_path):
    metadata = tmp_path / "metadata"
    metadata.mkdir()
    with pytest.raises(ValueError):
        check_metadata_dir(metadata)


# --- find_surveys_with_level1 ---


def _make_full_survey_tree(root):
    """Creates root/site/date/survey_001/level1_proc/ with both COGs and metadata."""
    survey = root / "SITE001" / "20240925" / "survey_001"
    level1 = survey / "level1_proc"
    level1.mkdir(parents=True)
    (level1 / "survey_rgb.cog.tif").touch()
    (level1 / "survey_ms.cog.tif").touch()
    metadata = survey / "metadata"
    metadata.mkdir()
    (metadata / "test_user.json").touch()
    return survey


def test_find_surveys_returns_valid(tmp_path):
    survey = _make_full_survey_tree(tmp_path)
    result = find_surveys_with_level1(tmp_path)
    assert result == [survey]


def test_find_surveys_empty_root(tmp_path):
    result = find_surveys_with_level1(tmp_path)
    assert result == []


def test_find_surveys_ignores_root_files(tmp_path):
    (tmp_path / "some_file.txt").touch()
    result = find_surveys_with_level1(tmp_path)
    assert result == []
