from pathlib import Path
from typing import Literal, Optional

from pydantic import AliasGenerator, BaseModel, ConfigDict

from stac_tool.utils import glob_one

ns_alias_generator = AliasGenerator(
    serialization_alias=lambda field_name: f"ns:{field_name}",
)


class PolygonGeometry(BaseModel):
    type: Literal["Polygon"]
    coordinates: list[list[list[float]]]


class MissionProperties(BaseModel):
    model_config = ConfigDict(alias_generator=ns_alias_generator)

    platform: str
    sensor: str
    mission_updated_timestamp: int
    flight_height_m: float
    flight_speed_ms: float
    orientation_deg: float
    margin_m: float
    forward_overlap: float
    side_overlap: float
    terrain_follow: str
    terrain_type: str
    target_surface_takeoff_m: float
    polygon: str
    polygon_with_buffer: str
    utm_crs: str


class MissionMetadata(BaseModel):
    type: Literal["Feature"]
    geometry: PolygonGeometry
    properties: MissionProperties


class UserMetadata(BaseModel):
    model_config = ConfigDict(alias_generator=ns_alias_generator)

    site: str
    date: str
    site_visit_id: str
    variant: str
    survey_uid: str
    property: str
    landholder: str
    traditional_owner: Optional[str] = None
    base_station_type: Optional[str] = None
    antenna_height_m: Optional[float] = None
    calibration_panel: Optional[str] = None
    white_balance: Optional[str] = None
    sky_conditions: Optional[str] = None
    wind_conditions: Optional[str] = None
    base_station_established: Optional[str] = None
    collected_by: Optional[str] = None
    comments: Optional[str] = None


class SurveyMetadata(BaseModel):
    user: UserMetadata
    mission: list[MissionMetadata]


def read_survey_metadata(survey: Path) -> SurveyMetadata:

    metadata_folder = survey / "metadata"

    user_metadata_file = glob_one(metadata_folder, "*_user.json")
    user_metadata = read_user_metdata(user_metadata_file)

    mission_metadata_files = [
        p for p in metadata_folder.glob("*.json") if not p.name.endswith("_user.json")
    ]
    mission_metadata = [read_mission_metadata(p) for p in mission_metadata_files]

    return SurveyMetadata(user=user_metadata, mission=mission_metadata)


def read_user_metdata(path: Path) -> UserMetadata:
    return UserMetadata.model_validate_json(path.read_text())


def read_mission_metadata(path: Path) -> MissionMetadata:
    return MissionMetadata.model_validate_json(path.read_text())
