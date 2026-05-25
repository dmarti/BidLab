#!/bin/bash

# BidLab Preview Script
# This script starts a local web server to preview the BidLab environment.

echo "========================================"
echo "   BidLab Interactive Preview Tool      "
echo "========================================"

if [ "$1" == "prod" ]; then
    echo "Starting production preview (from dist/ folder)..."
    if [ ! -d "dist" ]; then
        echo "Error: dist/ folder not found. Running build first..."
        npm run build
    fi
    echo "Serving dist/ on all interfaces..."
    npx serve -s dist -l 3000 --no-clipboard
else
    echo "Starting development preview (with HMR)..."
    echo "Serving on all interfaces..."
    npm run dev -- --host 0.0.0.0 --port 3000
fi
