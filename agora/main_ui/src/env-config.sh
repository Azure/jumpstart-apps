#!/bin/sh
# line endings must be \n, not \r\n ! Use LF and not CRLF!
# dynamically converts the .env file to a javascript object
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
awk -F '=' '{ gsub(/"/, "", $2); print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' /usr/share/nginx/html/.env >> /usr/share/nginx/html/env-config.js
echo "}" >> /usr/share/nginx/html/env-config.js

# Check for required environment variables and replace placeholders in nginx config
required_vars=("REACT_APP_FOOTFALL_VIDEO_URL")

# Update or add environment variables in .env file
for var in "${required_vars[@]}"; do
    if grep -q "^$var=" /usr/share/nginx/html/.env; then
        sed -i "s|^$var=.*|$var=${!var}|g" /usr/share/nginx/html/.env
    else
        echo "$var=${!var}" >> /usr/share/nginx/html/.env
    fi
done