#!/usr/bin/env bash
set -e
echo "This script packages the app for Windows using electron-builder.\nRequirements: node, npm, wine (on linux), osslsigncode (for code signing), and internet access to download dependencies.")
npm install
npm run build
npm run build:electron
# Build windows installer (requires wine on Linux)
electron-builder --win --x64
