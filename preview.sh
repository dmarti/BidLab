#!/bin/bash

# BidLab Preview Script
# This script starts a local web server to preview the BidLab environment.

echo "========================================"
echo "   BidLab Interactive Preview Tool      "
echo "========================================"

# Options:
#   ./preview.sh        - Starts Vite dev server (for JSX development)
#   ./preview.sh prod   - Serves the production build from dist/
#   ./preview.sh demo   - Serves the build-less version (demo.html)

PORT=3000

if [ "$1" == "prod" ]; then
    echo "Starting production preview (from dist/ folder)..."
    if [ ! -d "dist" ]; then
        echo "Error: dist/ folder not found. Running build first..."
        npm run build
    fi
    echo "Serving dist/ on port $PORT..."
    npx serve -s dist -l $PORT --no-clipboard
elif [ "$1" == "demo" ]; then
    echo "Starting build-less demo preview..."
    echo "Serving root on port $PORT..."
    echo "View at: http://localhost:$PORT/demo.html"
    python3 -m http.server $PORT --directory . --bind 0.0.0.0
else
    echo "Starting development preview (with HMR)..."
    echo "Serving on port $PORT..."
    npm run dev -- --host 0.0.0.0 --port $PORT
fi
