FROM nvidia/cuda:13.1.1-cudnn-runtime-ubuntu24.04

# Install system dependencies for OpenCV BEFORE uv sync
RUN apt-get update && apt-get install -y \
    libgl1 libglib2.0-0 libxcb1 libxkbcommon0 libxkbcommon-x11-0 libdbus-1-3 \
    libfontconfig1 libfreetype6 libxext6 libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV  UV_NO_DEV=1

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --locked

COPY main.py ./

EXPOSE 8003
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]