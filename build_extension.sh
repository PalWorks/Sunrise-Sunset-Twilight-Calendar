#!/bin/bash

# Build script for Chrome Extension
echo "Packaging Sun Moon Calendar Chrome Extension..."

# Clean up any existing zip
rm -f sunmooncal-extension.zip

# Create a temporary directory
mkdir -p temp_extension

# Copy only the necessary files from frontend
cp -r frontend/popup.html temp_extension/
cp -r frontend/manifest.json temp_extension/
cp -r frontend/icon-192.png temp_extension/
cp -r frontend/icon-512.png temp_extension/
cp -r frontend/style.css temp_extension/
cp -r frontend/js temp_extension/
cp -r frontend/lib temp_extension/
# Remove files and directories that are not needed by the extension popup
rm -f temp_extension/js/map.js
rm -rf temp_extension/lib/leaflet
rm -f temp_extension/lib/html2canvas.min.js
rm -f temp_extension/lib/jspdf.umd.min.js

# Zip the contents
cd temp_extension
zip -r ../sunmooncal-extension.zip *
cd ..

# Cleanup
rm -rf temp_extension

echo "✅ Success! sunmooncal-extension.zip has been created."
echo "You can now upload this zip file to the Chrome Developer Dashboard."
