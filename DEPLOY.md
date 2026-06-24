# Deploy CleanPC

## 1. GitHub

```bash
# Desde la terminal:
gh auth login
git init
git add .
git commit -m "Initial commit"
gh repo create cleanpc --public --push
```

O desde GitHub.com: crear repo, subir código.

## 2. Frontend → Cloudflare Pages

1. Ir a https://dash.cloudflare.com → Pages
2. Conectar repo de GitHub (`cleanpc`)
3. Build config:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Output directory:** `frontend/dist`
4. Listo. Dominio: `cleanpc.pages.dev`

## 3. Backend → Render

1. Ir a https://dashboard.render.com/ → New Web Service
2. Conectar el mismo repo
3. Config:
   - **Name:** `cleanpc-api`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `./backend/Dockerfile`
4. Agregar variable: `SECRET_KEY` → generar valor aleatorio
5. Crear. Queda en `https://cleanpc-api.onrender.com`

## 4. Conectar frontend con backend

Crear `frontend/.env`:

```
VITE_API_URL=https://cleanpc-api.onrender.com
```

Reconstruir frontend.

## 5. Desktop releases

```bash
cd desktop && npm install
npx electron-builder --linux AppImage   # Linux
npx electron-builder --win nsis         # Windows
npx electron-builder --mac dmg          # macOS
```

Subir instaladores a GitHub Releases.

## 6. Stripe (pagos)

1. Crear cuenta en https://stripe.com
2. Agregar `STRIPE_SECRET_KEY` en Render
3. Public key va en `frontend/.env`: `VITE_STRIPE_PUBLIC_KEY=pk_live_...`
