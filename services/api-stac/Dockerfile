FROM ghcr.io/prefix-dev/pixi:latest

WORKDIR /app

COPY pyproject.toml /app/pyproject.toml
RUN pixi install

EXPOSE 8002
ENTRYPOINT ["pixi", "run", "dev", "8002"]
CMD ["/home/jamesg/test_data/naturescan/stac/collections.json"]
