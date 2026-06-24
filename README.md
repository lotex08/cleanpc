<div align="center">
  <img src="frontend/public/favicon.svg" width="80" alt="CleanPC">
  <h1>🧹 CleanPC</h1>
  <p><strong>Tu PC más limpio y organizado</strong></p>
  <p>
    <a href="https://github.com/lotex08/cleanpc/releases/latest">⬇️ Descargar para Linux</a>
    ·
    <a href="#-instalación-rápida">🚀 Instalación</a>
    ·
    <a href="#-cómo-usar">📖 Cómo usar</a>
  </p>
  <br>
</div>

CleanPC escanea tu computadora, encuentra archivos duplicados, basura y te muestra todo en gráficas claras para que puedas liberar espacio fácilmente.

---

## ⚡ Instalación rápida

### App de escritorio (recomendado)

1. Descargá el **AppImage** desde [GitHub Releases](https://github.com/lotex08/cleanpc/releases/latest)
2. Dale permisos: `chmod +x CleanPC-*.AppImage`
3. Ejecutalo: `./CleanPC-*.AppImage`
4. Escaneá tu PC sin necesidad de registro

### Desarrollo local (web)

```bash
# 1. Clonar
git clone https://github.com/lotex08/cleanpc.git
cd cleanpc

# 2. Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env  # configurar claves
python run.py &
# http://localhost:8000

# 3. Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev &
# http://localhost:5173
```

---

## 📖 Cómo usar

1. **Abrí la app** (web o escritorio)
2. **Elegí una carpeta** para escanear (Ej: Descargas, Escritorio)
3. **Revisá los resultados**: archivos duplicados, grandes, viejos, por categoría
4. **Decidí qué borrar** y recuperá espacio

---

## 🏗️ Stack

| Capa      | Tecnología                        |
|-----------|-----------------------------------|
| Frontend  | React + Vite + Tailwind CSS       |
| Backend   | FastAPI + SQLAlchemy + SQLite     |
| Desktop   | Electron + electron-builder       |
| Auth      | JWT                              |

---

> 🛠️ **Proyecto hecho localmente.** Si querés mejorarlo, mandá PR o abrí un issue. Cualquier cosa avisen.

---

## 📦 Releases

Cada versión nueva se publica automáticamente via GitHub Actions.

| Plataforma | Formato        | Descargar                                      |
|------------|----------------|------------------------------------------------|
| Linux      | AppImage       | [Última versión](https://github.com/lotex08/cleanpc/releases/latest) |
| Windows    | .exe (NSIS)    | _(próximamente)_                                |
| macOS      | .dmg           | _(próximamente)_                               |

---

<div align="center">
  <p>Hecho con ❤️ por lotex08 &mdash; PRs bienvenidos</p>
</div>
