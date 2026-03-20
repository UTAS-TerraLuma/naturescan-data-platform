import subprocess
from pathlib import Path


def glob_one(directory: Path, pattern: str) -> Path:
    matches = list(directory.glob(pattern))
    if len(matches) != 1:
        raise ValueError(
            f"Expected 1 match for '{pattern}' in {directory}, found {len(matches)}"
        )
    return matches[0]


def run_cmd(cmd: list[str]):
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    for line in process.stdout or []:
        print(line, end="", flush=True)

    process.wait()

    if process.returncode != 0:
        raise subprocess.CalledProcessError(process.returncode, process.args)
