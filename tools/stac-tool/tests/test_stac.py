import json
from datetime import datetime, timezone

import pystac
import pytest

from stac_tool.stac import create_collection, save_feature_collection, save_stac_geoparquet


def make_test_item(item_id: str) -> pystac.Item:
    geometry = {
        "type": "Polygon",
        "coordinates": [
            [
                [133.0, -24.0],
                [134.0, -24.0],
                [134.0, -25.0],
                [133.0, -25.0],
                [133.0, -24.0],
            ]
        ],
    }
    bbox = [133.0, -25.0, 134.0, -24.0]
    dt = datetime(2024, 9, 25, 0, 0, 0, tzinfo=timezone.utc)
    return pystac.Item(id=item_id, geometry=geometry, bbox=bbox, datetime=dt, properties={})


def test_create_collection_type():
    item = make_test_item("test-001")
    result = create_collection([item])
    assert isinstance(result, pystac.Collection)
    assert result.id == "naturescan"


def test_create_collection_provider():
    item = make_test_item("test-001")
    result = create_collection([item])
    provider_names = [p.name for p in (result.providers or [])]
    assert "TerraLuma" in provider_names


def test_save_feature_collection(tmp_path):
    item = make_test_item("test-001")
    output = tmp_path / "collection.json"
    save_feature_collection(output, [item])
    assert output.exists()
    data = json.loads(output.read_text())
    assert data["type"] == "FeatureCollection"
    assert "extent" in data
    assert len(data["features"]) == 1


def test_save_feature_collection_multiple(tmp_path):
    items = [make_test_item(f"test-{i:03d}") for i in range(3)]
    output = tmp_path / "collection.json"
    save_feature_collection(output, items)
    data = json.loads(output.read_text())
    assert len(data["features"]) == 3


async def test_save_stac_geoparquet(tmp_path):
    item = make_test_item("test-001")
    output = tmp_path / "output.parquet"
    await save_stac_geoparquet(str(output), [item])
    assert output.exists()
    assert output.stat().st_size > 0
