#!/bin/sh
# line endings must be \n, not \r\n ! Use LF and not CRLF!
# dynamically converts the .env file to a javascript object
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
awk -F '=' '{ gsub(/"/, "", $2); print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' /usr/share/nginx/html/.env >> /usr/share/nginx/html/env-config.js
echo "}" >> /usr/share/nginx/html/env-config.js

# Get all variable names from .env file
env_vars=$(awk -F '=' '/^REACT_APP_/ { print $1 }' /usr/share/nginx/html/.env)

# Update or add environment variables in .env file
for var in $env_vars; do
    # Check if the environment variable exists
    env_value=$(eval echo \${$var})

    # Escape special characters for sed (e.g., /, &, :)
    escaped_value=$(printf '%s\n' "$env_value" | sed 's/[&/\]/\\&/g')

    # Use grep to check if the variable exists in the .env file
    if grep -q "^$var=" /usr/share/nginx/html/.env; then
        # Replace the existing value of the variable with the escaped value
        sed -i "s|^$var=.*|$var=$escaped_value|g" /usr/share/nginx/html/.env
    else
        # Append the variable to the .env file if it doesn't exist
        echo "$var=$escaped_value" >> /usr/share/nginx/html/.env
    fi
done

# Ensure the file has proper newlines to avoid concatenation issues
sed -i 's/\r//' /usr/share/nginx/html/.env