#!/bin/bash

# Build React app
echo "Building React app..."
npm run build

# Ensure the build directory exists in the backend
echo "Setting up build directory..."
mkdir -p backend/build

# Copy build files to backend
echo "Copying build files to backend..."
cp -r build/* backend/build/

echo "Build complete!" 