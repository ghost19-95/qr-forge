# ⚡  qr-forge

![qrforge screenshot](./screenshot.png)


### _Precision‑built, Debian‑powered QR generation for professionals._

A sleek, containerized QR code generator engineered for **local**, **cloud**, and **DevOps‑grade** deployments.


---

# ✨ Features

```
▸ /       → Beautiful HTML UI (dark mode)
▸ /qr     → PNG API endpoint
▸ Debian  → python:3.12-slim-bookworm
▸ Docker  → Fully isolated dependency stack
▸ Cloud   → Identical behavior across all environments
```

---

# 🧩 Architecture Overview

```
qrforge
│
├── app/
│   ├── main.py         # FastAPI server + routing
│   ├── __init__.py
│   └── templates/
│       └── index.html  # Dark UI template
│
├── Dockerfile          # Debian-slim base container
├── docker-compose.yml  # Production-ready service definition
├── requirements.txt
└── README.md
```

---

# 🚀 Quick Start — docker compose (recommended)

### Start the stack
```bash
docker compose up --build --detach
```

### Check status
```bash
docker compose ps
```

### Open the UI
```bash
http://localhost:8002/
```

### Stop the service
```bash
docker compose down
```

---

# 🚀 Quick Start — docker run

### Build
```bash
docker build --tag qrforge:1.0.0 .
```

### Run
```bash
docker run   --rm   --name qrforge   --publish 8002:8002   qrforge:1.0.0
```

### Visit
```bash
http://localhost:8002/
```

Stop:
```bash
docker stop qrforge
```

---

# 🎨 HTML UI

A minimal zero-learning-curve interface.

```
▸ Enter text/URL
▸ Adjust scale & border
▸ Generate QR
▸ Save
```

Open it:

```bash
http://localhost:8002/
```

---

# 📡 API Reference — GET /qr

### Parameters
```bash
data   (required)  → string to encode
scale  (optional)  → default 5
border (optional)  → default 4
```

### Basic example
```bash
curl --get   --data-urlencode "data=https://example.com"   http://localhost:8002/qr   --output qr.png
```

### Custom QR
```bash
curl --get   --data-urlencode "data=Hello qrforge"   --data "scale=10"   --data "border=2"   http://localhost:8002/qr   --output qr_custom.png
```

---

# 🧠 Internals

### FastAPI + segno
```
FastAPI   → Web server, routing, HTML rendering
segno     → High-accuracy QR generation
uvicorn   → High-performance ASGI server
```

### Flow
```
HTML → User inputs
main.py → Validates & builds QR
segno → Generates PNG in-memory
Response → image/png
```

Zero disk writes. Zero temp files.

---

# ⚙️ Config

### Default port
```bash
8002
```

### Change port
Edit Dockerfile CMD + docker-compose.yml → then rebuild.

---

# ☁️ Cloud Deployment Strategy

### VM (Debian recommended)
```bash
docker compose up --build --detach
```
Expose **8002** → Access externally.

### Managed container environments
```
Build → Push → Deploy → Map port 8002 → Done
```

Stateless → horizontally scalable instantly.

---

# 📊 Logs

```bash
docker compose logs qrforge
docker logs qrforge
```

---

# 🛠 Troubleshooting

### Service not starting
```bash
docker compose logs qrforge
```

### Nothing at :8002
```bash
docker compose ps
```

### QR too dense
```bash
scale=10
border=4
```

---

# 🔧 Dev Workflow

```bash
git init
git add .
git commit -m "Initial qrforge implementation"

git remote add origin git@your.git/qrforge.git
git push --set-upstream origin main
```

Feature branches:

```bash
git checkout -b feature/update-ui
```

---

# 🏷️ Possible Enhancements (future)

- 🔒 Optional password protection
- 🌓 Light/Dark theme toggle
- 📦 Docker Hub automated builds
- 📈 Health endpoints
- 📜 QR history log
- 🖼️ SVG output

---

# ⚠️ License

This work is created up the GNU GENERAL PUBLIC LICENSE Version 3.  See LICENSE.


# ⚠️ Disclaimer

Software is provided **AS‑IS**.
Production security posture is **your** responsibility.

---

# ✔️ End of File
