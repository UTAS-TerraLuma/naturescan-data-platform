import marimo

__generated_with = "0.19.4"
app = marimo.App(width="medium")


@app.cell
def _():
    import requests
    import ultralytics
    import torch
    import supervision
    from PIL import Image
    from io import BytesIO

    torch.cuda.is_available()
    return BytesIO, Image, requests, supervision


@app.cell
def _(requests):
    r = requests.get("http://localhost:8001/cog/bbox/135.52650495,-30.54683775,135.52681805,-30.54656835/1036x1036.png?url=https%3A%2F%2Fobject-store.rc.nectar.org.au%2Fv1%2FAUTH_4df2f67c2eed48a2aaeeed008a4bf0de%2Fnaturescan-assets%2FBonBon%2FSAAGAW0007%2F20241002_SAAGAW0007_m3m_50mAGL_ortho_RGB.cog.tif")
    return (r,)


@app.cell
def _(BytesIO, Image, r):
    img = Image.open(BytesIO(r.content)).convert("RGB")
    return


@app.cell
def _():
    model_path = "/home/jamesg/models/sam3.pt"
    test_img_path = "/home/jamesg/test_data/test_img.png"
    return (model_path,)


@app.cell
def _(model_path):
    from ultralytics.models.sam import SAM
    model = SAM(model_path)
    return (model,)


@app.cell
def _(model):
    results = model.predict("http://localhost:8001/cog/bbox/135.52650495,-30.54683775,135.52681805,-30.54656835/1036x1036.png?url=https%3A%2F%2Fobject-store.rc.nectar.org.au%2Fv1%2FAUTH_4df2f67c2eed48a2aaeeed008a4bf0de%2Fnaturescan-assets%2FBonBon%2FSAAGAW0007%2F20241002_SAAGAW0007_m3m_50mAGL_ortho_RGB.cog.tif", points=[512, 512], labels=[1], imgsz=1036)
    results[0].show()
    return (results,)


@app.cell
def _(results, supervision):
    detections = supervision.Detections.from_ultralytics(results[0])
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
