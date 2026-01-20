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
    echo ""
    echo -e "${BLUE}[INFO]${NC} Shutting down servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on ports
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}[SUCCESS]${NC} Servers stopped. Goodbye!"
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Print banner
echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   💊 PrescriptionApp - Medicine Reminder System          ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check and install backend dependencies
echo -e "${BLUE}[INFO]${NC} Checking backend dependencies..."
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}[WARN]${NC} Installing backend dependencies..."
    cd "$BACKEND_DIR" && npm install
fi
echo -e "${GREEN}[SUCCESS]${NC} Backend dependencies ready"

# Check and install frontend dependencies
echo -e "${BLUE}[INFO]${NC} Checking frontend dependencies..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}[WARN]${NC} Installing frontend dependencies..."
    cd "$FRONTEND_DIR" && npm install
fi
echo -e "${GREEN}[SUCCESS]${NC} Frontend dependencies ready"

# Initialize database if needed
echo -e "${BLUE}[INFO]${NC} Checking database..."
if [ ! -f "$DB_PATH" ]; then
    echo -e "${YELLOW}[WARN]${NC} Database not found. Initializing..."
    cd "$BACKEND_DIR" && npm run init-db
    echo -e "${GREEN}[SUCCESS]${NC} Database initialized with sample data"
else
    echo -e "${GREEN}[SUCCESS]${NC} Database already exists"
fi

# Start backend server
echo -e "${BLUE}[INFO]${NC} Starting backend server..."
cd "$BACKEND_DIR"
node server.js &
BACKEND_PID=$!
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}[ERROR]${NC} Backend failed to start"
    exit 1
fi
echo -e "${GREEN}[SUCCESS]${NC} Backend running on port 5000"

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
echo -e "  ${CYAN}Backend:${NC}   http://localhost:5000/api"
echo ""
echo -e "  ${YELLOW}Demo Credentials:${NC}"
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │  Doctor:  doctor@example.com  / doctor123      │"
echo "  │  Patient: patient@example.com / patient123     │"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo -e "  ${BOLD}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for processes
wait
