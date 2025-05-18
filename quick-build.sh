#!/bin/bash
# Quick build script for on-premises Cline without type checking

cd /home/hik90/sol/cline_origin

# Build the webview UI first
cd webview-ui
npx --no vite build

# Now build the extension without type checks
cd ..
node esbuild.js --force-no-check

# Set proper path for assets
echo "Fixing asset paths..."

# Create the extension package
cd dist
mkdir -p webview-ui/build
cp -r ../webview-ui/build/* webview-ui/build/

echo "Quick build completed!"