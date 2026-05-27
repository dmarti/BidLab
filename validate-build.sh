#!/bin/bash

# BidLab Build Validator
# This script checks for common issues in the build-less version of BidLab.

PROJECT_DIR="/home/team/shared/bidlab"
JS_DIR="$PROJECT_DIR/public/js"
DEMO_HTML="$PROJECT_DIR/demo.html"

echo "🔍 Starting BidLab Validation..."

# 1. Check for bare specifiers in JS files (excluding preact-config.js which handles mapping)
echo "--- Checking for bare specifiers in JS files ---"
BARE_SPECIFIERS=$(grep -r "from ['\"][^./]" "$JS_DIR" --exclude="preact-config.js")

if [ -n "$BARE_SPECIFIERS" ]; then
    echo "❌ Found bare specifiers in the following files:"
    echo "$BARE_SPECIFIERS"
    echo "Bare specifiers are not supported in standard browsers without an import map."
    # We don't exit 1 here yet because some might be intentional if handled by the import map
else
    echo "✅ No bare specifiers found in component files."
fi

# 2. Check if demo.html has an import map
echo "--- Checking for Import Map in demo.html ---"
if grep -q "type=\"importmap\"" "$DEMO_HTML"; then
    echo "✅ Import map found in demo.html"
else
    echo "❌ Missing import map in demo.html. This may cause issues with unpkg modules."
    EXIT_CODE=1
fi

# 3. Check for syntax errors in JS files
echo "--- Checking JS syntax ---"
for file in $(find "$JS_DIR" -name "*.js"); do
    if ! node --check "$file" 2>/dev/null; then
        echo "❌ Syntax error in $file"
        EXIT_CODE=1
    fi
done
if [ -z "$EXIT_CODE" ]; then
    echo "✅ JS syntax check passed."
fi

# 4. Verify local file paths in demo.html
echo "--- Verifying local file paths in demo.html ---"
MAIN_JS_PATH=$(grep "src=\"/public/js/main.js\"" "$DEMO_HTML")
if [ -z "$MAIN_JS_PATH" ]; then
    # Check if it's using a relative path instead
    if grep -q "src=\"public/js/main.js\"" "$DEMO_HTML"; then
        echo "✅ Found main.js with relative path."
    else
        echo "❌ Could not find main.js script tag with correct path in demo.html"
        EXIT_CODE=1
    fi
else
    echo "✅ Found main.js script tag."
fi

if [ "$EXIT_CODE" == "1" ]; then
    echo "❌ Validation FAILED."
    exit 1
else
    echo "✅ Validation PASSED."
    exit 0
fi
