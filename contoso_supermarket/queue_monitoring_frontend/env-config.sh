#!/bin/sh
# line endings must be \n, not \r\n ! Use LF and not CRLF!
# dynamically converts the .env file to a javascript object
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
awk -F '=' '{ gsub(/"/, "", $2); print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' /usr/share/nginx/html/.env >> /usr/share/nginx/html/env-config.js
echo "}" >> /usr/share/nginx/html/env-config.js

# Check for required environment variables and replace placeholders in nginx config
required_vars=("BACKEND_API_URL" "BACKEND_API_HOST" "AI_API_URL" "AI_API_HOST")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Environment variable $var is not set."
        exit 1
    fi
done

# Replace placeholders in nginx config
sed -i "s|\${BACKEND_API_URL}|${BACKEND_API_URL}|g" /etc/nginx/nginx.conf.default
sed -i "s|\${BACKEND_API_HOST}|${BACKEND_API_HOST}|g" /etc/nginx/nginx.conf.default
sed -i "s|\${AI_API_URL}|${AI_API_URL}|g" /etc/nginx/nginx.conf.default
sed -i "s|\${AI_API_HOST}|${AI_API_HOST}|g" /etc/nginx/nginx.conf.default