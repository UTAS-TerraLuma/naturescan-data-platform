import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from stac_tool.metadata import (
    MissionMetadata,
    SurveyMetadata,
    UserMetadata,
    read_mission_metadata,
    read_survey_metadata,
    read_user_metdata,
)

_USER_JSON = json.dumps(
    {
        "site": "TestSite",
        "date": "20240315",
        "site_visit_id": "TestSite_20240315",
        "variant": "m3m",
        "survey_uid": "TestSite_20240315_m3m",
        "property": "Test Property",
        "landholder": "Test Landholder",
    }
)

_MINIMAL_USER_JSON = json.dumps(
    {
        "site": "TestSite",
        "date": "20240315",
        "site_visit_id": "TestSite_20240315",
        "variant": "m3m",
        "survey_uid": "TestSite_20240315_m3m",
        "property": "Test Property",
        "landholder": "Test Landholder",
    }
)


def _write_user_json(directory: Path, filename: str = "test_user.json") -> Path:
    p = directory / filename
    p.write_text(_USER_JSON)
    return p


def _write_mission_json(
    directory: Path, sample_mission_json: str, filename: str = "test_mission.json"
) -> Path:
    p = directory / filename
    p.write_text(sample_mission_json)
    return p


def test_read_user_metadata(tmp_path):
    p = _write_user_json(tmp_path)
    result = read_user_metdata(p)
    assert result.site == "TestSite"
    assert result.date == "20240315"


def test_user_metadata_optional_fields(tmp_path):
    p = tmp_path / "minimal_user.json"
    p.write_text(_MINIMAL_USER_JSON)
    result = read_user_metdata(p)
    assert result.calibration_panel is None
    assert result.white_balance is None
    assert result.comments is None
    assert result.traditional_owner is None


def test_read_mission_metadata(tmp_path, sample_mission_json):
    p = tmp_path / "mission.json"
    p.write_text(sample_mission_json)
    result = read_mission_metadata(p)
    assert result.type == "Feature"
    assert result.properties.sensor == "m3m"


def test_mission_geometry_coordinates(tmp_path, sample_mission_json, sample_mission_data):
    p = tmp_path / "mission.json"
    p.write_text(sample_mission_json)
    result = read_mission_metadata(p)
    expected = sample_mission_data["geometry"]["coordinates"]
    assert result.geometry.coordinates == expected


def test_read_survey_metadata(tmp_path, sample_mission_json):
    metadata_dir = tmp_path / "metadata"
    metadata_dir.mkdir()
    _write_user_json(metadata_dir, "test_user.json")
    _write_mission_json(metadata_dir, sample_mission_json)
    result = read_survey_metadata(tmp_path)
    assert result.user.site == "TestSite"
    assert len(result.mission) == 1


def test_read_survey_metadata_multiple_missions(tmp_path, sample_mission_json):
    metadata_dir = tmp_path / "metadata"
    metadata_dir.mkdir()
    _write_user_json(metadata_dir, "test_user.json")
    _write_mission_json(metadata_dir, sample_mission_json, "mission_001.json")
    _write_mission_json(metadata_dir, sample_mission_json, "mission_002.json")
    result = read_survey_metadata(tmp_path)
    assert len(result.mission) == 2


def test_user_serialization_aliases(tmp_path):
    p = _write_user_json(tmp_path)
    result = read_user_metdata(p)
    dumped = result.model_dump(by_alias=True)
    assert "ns:site" in dumped
    assert "ns:date" in dumped
    assert "site" not in dumped


def test_mission_serialization_aliases(tmp_path, sample_mission_json):
    p = tmp_path / "mission.json"
    p.write_text(sample_mission_json)
    result = read_mission_metadata(p)
    dumped = result.properties.model_dump(by_alias=True)
    assert "ns:platform" in dumped
    assert "platform" not in dumped


def test_invalid_json_raises():
    with pytest.raises(ValidationError):
        UserMetadata.model_validate_json("{not valid json at all")
