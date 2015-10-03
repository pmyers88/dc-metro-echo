#!/usr/bin/env sh
zip dc-metro-echo.zip node_modules secret lib resources index.js package.json > /dev/null
aws lambda update-function-code --function-name MetroTransit --zip-file fileb://dc-metro-echo.zip
rm dc-metro-echo.zip
