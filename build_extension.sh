#!/bin/bash

# Build script for Chrome Extension
echo "Packaging Sun Moon Calendar Chrome Extension..."

# Clean up any existing zip
rm -f sunmooncal-extension.zip

# Create a temporary directory
mkdir -p temp_extension

# Copy only the necessary files from frontend
cp -r frontend/index.html temp_extension/
cp -r frontend/manifest.json temp_extension/
cp -r frontend/icon-192.png temp_extension/
cp -r frontend/icon-512.png temp_extension/
cp -r frontend/style.css temp_extension/
cp -r frontend/js temp_extension/

# Remove sw.js from the temp folder if it exists, as extensions use background.js service workers, not standard web service workers (though it's fine to leave it, it's safer to keep it clean)

# Zip the contents
cd temp_extension
zip -r ../sunmooncal-extension.zip *
cd ..

# Cleanup
rm -rf temp_extension

echo "✅ Success! sunmooncal-extension.zip has been created."
echo "You can now upload this zip file to the Chrome Developer Dashboard."
