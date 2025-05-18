#!/bin/bash
set -e

# Step 1: Build the webview UI first
cd webview-ui
npm run build
cd ..

# Step 2: Build the extension skipping type checking
node esbuild.js --force-no-check

# Step 3: Package as a VS Code extension
vsce package --no-dependencies

echo "Build completed successfully!"