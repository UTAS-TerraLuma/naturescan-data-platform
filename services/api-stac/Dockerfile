FROM ghcr.io/prefix-dev/pixi:latest

WORKDIR /app

COPY pyproject.toml /app/pyproject.toml

# In the future should make this configurable?
COPY collections.json /app/collections.json

RUN pixi install


EXPOSE 8002
CMD ["pixi", "run", "dev", "8002", "/app/collections.json"]
