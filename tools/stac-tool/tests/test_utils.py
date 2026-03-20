from pathlib import Path

import pytest

from stac_tool.utils import glob_one


def test_finds_exactly_one(tmp_path):
    f = tmp_path / "file.txt"
    f.touch()
    assert glob_one(tmp_path, "*.txt") == f


def test_raises_on_zero_matches(tmp_path):
    with pytest.raises(ValueError):
        glob_one(tmp_path, "*.txt")


def test_raises_on_multiple_matches(tmp_path):
    (tmp_path / "a.txt").touch()
    (tmp_path / "b.txt").touch()
    with pytest.raises(ValueError):
        glob_one(tmp_path, "*.txt")


def test_returns_path_type(tmp_path):
    f = tmp_path / "file.txt"
    f.touch()
    result = glob_one(tmp_path, "*.txt")
    assert isinstance(result, Path)
