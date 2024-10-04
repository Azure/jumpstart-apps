#!/bin/sh
# line endings must be \n, not \r\n ! Use LF and not CRLF!
# dynamically converts the .env file to a javascript object
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
awk -F '=' '{ gsub(/"/, "", $2); print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' /usr/share/nginx/html/.env >> /usr/share/nginx/html/env-config.js
echo "}" >> /usr/share/nginx/html/env-config.js

# Check for required environment variables and replace placeholders in nginx config
required_vars=("REACT_APP_FOOTFALL_VIDEO_URL")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Environment variable $var is not set."
        exit 1
    fi
done

# Replace placeholders in nginx config
sed -i "s|\${REACT_APP_FOOTFALL_VIDEO_URL}|${REACT_APP_FOOTFALL_VIDEO_URL}|g" /etc/nginx/nginx.conf.default