from typing import Optional

import io

import segno
from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import HTMLResponse, Response
from fastapi.templating import Jinja2Templates

app = FastAPI(
    title="qrforge",
    description="Minimal QR code generator service with WiFi support",
    version="1.1.0",
)

templates = Jinja2Templates(directory="app/templates")


@app.get("/", response_class=HTMLResponse)
async def index(
    request: Request,
    # Common QR options
    mode: str = Query(default="text", description="Mode: text or wifi"),
    data: Optional[str] = Query(
        default=None,
        description="Text or URL to encode (used when mode=text)",
    ),
    scale: int = Query(default=5, ge=1, le=50, description="QR scale (size multiplier)"),
    border: int = Query(default=4, ge=0, le=20, description="Border size"),
    # WiFi-specific params
    wifi_ssid: Optional[str] = Query(default=None, description="WiFi SSID"),
    wifi_password: Optional[str] = Query(default=None, description="WiFi password"),
    wifi_auth: str = Query(
        default="WPA",
        description="WiFi auth type (WEP, WPA, nopass)",
    ),
    wifi_hidden: bool = Query(
        default=False,
        description="WiFi hidden network flag",
    ),
):
    """
    Human-friendly HTML interface for generating QR codes.

    Modes:
      - mode=text (default): encode arbitrary text/URL
      - mode=wifi: build a WiFi QR payload using SSID/PASSWORD/AUTH/HIDDEN
    """

    mode = mode.lower().strip()
    if mode not in ("text", "wifi"):
        mode = "text"

    wifi_payload: Optional[str] = None
    effective_data: Optional[str] = data

    if mode == "wifi":
        # Build WiFi QR payload according to standard format:
        # WIFI:T:<auth>;S:<ssid>;P:<password>;H:<hidden>;;
        if wifi_ssid:
            auth = wifi_auth.upper().strip() if wifi_auth else "WPA"
            if auth not in ("WEP", "WPA", "NOPASS"):
                auth = "WPA"
            hidden_flag = "true" if wifi_hidden else "false"

            # Empty password for nopass networks is allowed
            pwd = wifi_password or ""
            # Escape characters ; , : " \ as recommended in some implementations
            def _escape(value: str) -> str:
                return (
                    value.replace("\\", "\\\\")
                    .replace(";", "\\;")
                    .replace(",", "\\,")
                    .replace(":", "\\:")
                    .replace('"', '\\"')
                )

            ssid_escaped = _escape(wifi_ssid)
            pwd_escaped = _escape(pwd)

            wifi_payload = f"WIFI:T:{auth};S:{ssid_escaped};P:{pwd_escaped};H:{hidden_flag};;"
            effective_data = wifi_payload
        else:
            wifi_payload = None
            effective_data = None

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "mode": mode,
            "data": effective_data,
            "scale": scale,
            "border": border,
            "wifi_ssid": wifi_ssid or "",
            "wifi_password": wifi_password or "",
            "wifi_auth": wifi_auth,
            "wifi_hidden": wifi_hidden,
            "wifi_payload": wifi_payload,
        },
    )


@app.get("/qr")
async def generate_qr(
    data: str = Query(..., description="Text or URL to encode"),
    scale: int = Query(default=5, ge=1, le=50, description="QR scale (size multiplier)"),
    border: int = Query(default=4, ge=0, le=20, description="Border size"),
):
    """
    Machine-friendly endpoint that returns a PNG QR code.

    Example:
      curl --get \
        --data-urlencode "data=https://example.com" \
        --data "scale=5" \
        --data "border=4" \
        http://localhost:8002/qr --output qr.png
    """
    if not data:
        raise HTTPException(status_code=400, detail="Parameter 'data' is required")

    qr = segno.make(data, micro=False)

    buffer = io.BytesIO()
    qr.save(buffer, kind="png", scale=scale, border=border)
    png_bytes = buffer.getvalue()

    return Response(content=png_bytes, media_type="image/png")
