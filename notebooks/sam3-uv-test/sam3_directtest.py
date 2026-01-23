import marimo

__generated_with = "0.19.4"
app = marimo.App(width="medium")


@app.cell
def _():
    import supervision
    from segment_anything import (sam_model_registry, SamAutomaticMaskGenerator)
    return


if __name__ == "__main__":
    app.run()
