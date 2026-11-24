# Deployment Guide for AirAware

AirAware can be deployed to any public cloud platform (Render, Vercel, Railway, Fly.io, or Docker / AWS / DigitalOcean).

---

## Option A: One-Click Cloud Deployment (Render / Railway / Fly.io) — Recommended

### 1. Render.com (Free Tier Available)
1. Push this project folder to your GitHub or GitLab account.
2. In [Render Dashboard](https://dashboard.render.com):
   - **Backend**: Create a **Web Service** pointing to `/backend`.
     - Environment: **Java** / Docker
     - Build Command: `mvn clean package -DskipTests`
     - Start Command: `java -jar target/airaware-backend-1.0.0.jar`
   - **Frontend**: Create a **Static Site** pointing to `/frontend`.
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
     - Rewrites/Redirects: Add Rewrite `/*` -> `/index.html`
     - Set environment variable `VITE_API_URL` pointing to your Render backend URL.

---

## Option B: Docker / Docker Compose (Any VPS, EC2, or Droplet)

We have included ready-to-use Dockerfiles and `docker-compose.yml`:

```bash
# Build and run backend + frontend behind an NGINX reverse proxy
docker-compose up --build -d
```
Access at `http://your-server-ip:80`

---

## Option C: Instant Public Preview (via Cloudflare Quick Tunnel)

To share the app instantly on the public internet without signing up for hosting:
```bash
# Download cloudflared or run:
npx localtunnel --port 5173
```
This generates a temporary public HTTPS URL accessible from any mobile or desktop device.
