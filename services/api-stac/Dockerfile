FROM ghcr.io/prefix-dev/pixi:noble

WORKDIR /app

COPY pyproject.toml pixi.lock /app/
# In the future should make this configurable?
COPY collections.json /app/collections.json

RUN pixi install --locked && rm -rf ~/.cache/rattler


EXPOSE 8002
CMD ["pixi", "run", "dev", "8002", "/app/collections.json"]
