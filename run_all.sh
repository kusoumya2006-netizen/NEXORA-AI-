#!/bin/bash

echo "=========================================================="
echo "          STARTING NEXORA PLATFORM (SIH 2026)             "
echo "=========================================================="

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "[!] Virtual environment not found. Creating python venv..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

echo "[1/2] Starting NEXORA FastAPI Backend on http://localhost:8000..."
PYTHONPATH=. ./venv/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "[2/2] Starting NEXORA React Frontend Dashboard on http://localhost:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

echo ""
echo "=========================================================="
echo "  NEXORA IS RUNNING!"
echo "  - Frontend SOC Dashboard: http://localhost:5173"
echo "  - Backend API & Docs:     http://localhost:8000/docs"
echo "  - Health Check:           http://localhost:8000/api/health"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."

wait
