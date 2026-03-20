@echo off
for /f "usebackq tokens=1,* delims==" %%A in (`findstr /v "^#" .env`) do (
    if not "%%A"=="" (
        set "%%A=%%B"
    )
)
