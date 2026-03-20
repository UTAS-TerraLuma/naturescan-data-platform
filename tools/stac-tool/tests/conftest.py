import json
from pathlib import Path

import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_user_json():
    return (FIXTURES_DIR / "sample_user.json").read_text()


@pytest.fixture
def sample_mission_json():
    return (FIXTURES_DIR / "sample_mission.json").read_text()


@pytest.fixture
def sample_user_data(sample_user_json):
    return json.loads(sample_user_json)


@pytest.fixture
def sample_mission_data(sample_mission_json):
    return json.loads(sample_mission_json)
