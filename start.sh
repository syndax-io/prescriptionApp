#!/bin/bash

# PrescriptionApp Startup Script
# Usage: ./start.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
DB_PATH="$BACKEND_DIR/data/prescription_app.db"

# Store PIDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""

# Cleanup function
cleanup() {
    local status=$?
    echo ""
    echo -e "${BLUE}[INFO]${NC} Shutting down servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on ports
    lsof -ti:9000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}[SUCCESS]${NC} Servers stopped. Goodbye!"
    exit "$status"
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Print banner
echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   PrescriptionApp — Vanguard Clinical Desk               ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check and install backend dependencies
echo -e "${BLUE}[INFO]${NC} Checking backend dependencies..."
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo -e "${YELLOW}[WARN]${NC} Installing backend dependencies..."
    cd "$BACKEND_DIR" && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
fi
echo -e "${GREEN}[SUCCESS]${NC} Backend dependencies ready"

# Check and install frontend dependencies
echo -e "${BLUE}[INFO]${NC} Checking frontend dependencies..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}[WARN]${NC} Installing frontend dependencies..."
    cd "$FRONTEND_DIR" && npm install
fi
echo -e "${GREEN}[SUCCESS]${NC} Frontend dependencies ready"

# The chart, allergies, and suggestions all read Mongo. Do not boot the API without it.
mongo_up() {
    python3 -c 'import socket; socket.create_connection(("127.0.0.1", 27017), 1).close()' >/dev/null 2>&1
}

echo -e "${BLUE}[INFO]${NC} Checking MongoDB..."
if mongo_up; then
    echo -e "${GREEN}[SUCCESS]${NC} MongoDB is accepting connections on port 27017"
else
    if ! command -v docker >/dev/null 2>&1; then
        echo -e "${RED}[ERROR]${NC} MongoDB is not running on localhost:27017."
        echo "Start it with: docker compose -f backend/docker-compose.yml up -d"
        exit 1
    fi
    echo -e "${YELLOW}[WARN]${NC} Starting MongoDB with Docker Compose..."
    docker compose -f "$BACKEND_DIR/docker-compose.yml" --project-directory "$BACKEND_DIR" up -d
    ready=0
    for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
        if mongo_up; then
            ready=1
            break
        fi
        sleep 1
    done
    if [ "$ready" -ne 1 ]; then
        echo -e "${RED}[ERROR]${NC} MongoDB did not accept connections on localhost:27017."
        echo "Start it with: docker compose -f backend/docker-compose.yml up -d"
        exit 1
    fi
    echo -e "${GREEN}[SUCCESS]${NC} MongoDB is accepting connections on port 27017"
fi

# Initialize database if needed
echo -e "${BLUE}[INFO]${NC} Checking database..."
if [ ! -f "$DB_PATH" ]; then
    echo -e "${YELLOW}[WARN]${NC} Database not found. Initializing..."
    cd "$BACKEND_DIR" && .venv/bin/python -m scripts.init_db
    echo -e "${GREEN}[SUCCESS]${NC} Database initialized with sample data"
else
    echo -e "${GREEN}[SUCCESS]${NC} Database already exists"
fi

# A previous dev server may still own these ports. Release them before binding again.
free_port() {
    local port="$1"
    local pids
    pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -z "$pids" ]; then
        echo -e "${BLUE}[INFO]${NC} Port ${port} is free"
        return 0
    fi
    echo -e "${YELLOW}[WARN]${NC} Stopping process on port ${port}: $(echo "$pids" | tr '\n' ' ')"
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    local still
    still="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$still" ]; then
        echo -e "${RED}[ERROR]${NC} Port ${port} is still in use"
        exit 1
    fi
}

free_port 9000
free_port 3001

# Start backend server
echo -e "${BLUE}[INFO]${NC} Starting backend server..."
cd "$BACKEND_DIR"
PORT=9000 .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 9000 --log-level warning &
BACKEND_PID=$!
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}[ERROR]${NC} Backend failed to start"
    exit 1
fi
echo -e "${GREEN}[SUCCESS]${NC} Backend running on port 9000"

# Start frontend server
echo -e "${BLUE}[INFO]${NC} Starting frontend dev server..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
sleep 3

# Print ready message
echo ""
echo -e "${BOLD}${GREEN}════════════════════════════════════════════════════════════"
echo "  🚀 Application is ready!"
echo -e "════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:3001"
echo -e "  ${CYAN}Backend:${NC}   http://localhost:9000/api"
echo ""
echo -e "  ${YELLOW}Demo Credentials:${NC}"
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │  Physician: doctor@example.com / doctor123     │"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo -e "  ${BOLD}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for processes
wait
