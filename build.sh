#!/bin/bash
# Build CleanPC desktop app for distribution
# Requisitos: Node.js, npm, python3

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== CleanPC Build Script ==="
echo ""

# 1. Build frontend
echo "[1/4] Construyendo frontend..."
cd "$DIR/frontend"
npm run build
echo "  ✓ Frontend listo en frontend/dist/"

# 2. Build desktop app
echo "[2/4] Instalando dependencias del desktop..."
cd "$DIR/desktop"
npm install 2>/dev/null

echo "[3/4] Empaquetando app..."
mkdir -p "$DIR/dist"

echo "[3/4] Empaquetando app..."

# Build for current platform
cd "$DIR/desktop"
npx electron-builder --linux AppImage --linux deb 2>/dev/null || \
npx electron-builder --linux AppImage 2>/dev/null || \
echo "  ⚠ Error al empaquetar, instalá electron-builder: npm install -g electron-builder"

echo "[4/4] Copiando instaladores..."
mkdir -p "$DIR/frontend/public/downloads"
cp "$DIR/desktop/dist/"*.AppImage "$DIR/frontend/public/downloads/" 2>/dev/null || true
cp "$DIR/desktop/dist/"*.deb "$DIR/frontend/public/downloads/" 2>/dev/null || true

echo ""
echo "=== Build completo ==="
echo "Los instaladores están en:"
echo "  $DIR/desktop/dist/"
echo "  $DIR/frontend/public/downloads/"
echo ""
echo "Para deployar:"
echo "  Frontend: cd frontend && npm run build && deploy a Vercel"
echo "  Backend:  docker build -t cleanpc-api ./backend"
