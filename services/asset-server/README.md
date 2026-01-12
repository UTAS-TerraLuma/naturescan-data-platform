# Asset Server

⚠️ The asset server is only for local dev use.


Normally, assets (COGs, STAC JSONs, etc) will be loaded from a URL via object storage. For local development, we want to use the assets on our disk. However, other services need to be able to access them via a URL. This server uses nodejs http-server to server part of the local file system while allows for CORS and range requests. 


```bash
pixi run dev-asset-server /PATH/TO/ASSETS

# Runs
# npx http-server /PATH/TO/ASSETS --port 8010 --cors
```