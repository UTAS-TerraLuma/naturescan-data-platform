FROM ghcr.io/prefix-dev/pixi:noble-cuda-13.0.0

WORKDIR /app

COPY pyproject.toml pixi.lock /app/
COPY src /app/src

RUN pixi install --locked && rm -rf ~/.cache/rattler

ENV MODEL_PATH=/app/models/sam3.pt

EXPOSE 8003
CMD ["pixi", "run", "uvicorn", "api_segmentation.main:app", "--host", "0.0.0.0", "--port", "8003"]
