FROM ghcr.io/prefix-dev/pixi:noble

WORKDIR /app

COPY pyproject.toml pixi.lock ./
RUN pixi install --locked && rm -rf ~/.cache/rattler

# In the future should make this configurable?
COPY collections.json ./collections.json

EXPOSE 8002
CMD ["pixi", "run", "dev", "8002", "./collections.json"]
