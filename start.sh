#!/bin/bash
# CleanPC - Script de inicio
# Backend
cd "$(dirname "$0")/backend"
source venv/bin/activate 2>/dev/null
echo "Iniciando backend en http://localhost:8000"
python run.py &
BACKEND_PID=$!

# Frontend
cd "$(dirname "$0")/frontend"
echo "Iniciando frontend en http://localhost:5173"
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "CleanPC corriendo:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
