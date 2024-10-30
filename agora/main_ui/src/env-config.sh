#!/bin/sh
# line endings must be \n, not \r\n ! Use LF and not CRLF!

# Get all variable names from the environment that start with REACT_APP_
env_vars=$(printenv | awk -F '=' '/^REACT_APP_/ { print $1 }')

# Update or add environment variables in .env file
for var in $env_vars; do
    # Check if the environment variable exists
    env_value=$(eval echo \${$var})

    # Escape special characters for sed (e.g., /, &, :)
    escaped_value=$(printf '%s\n' "$env_value" | sed 's/[&/\]/\\&/g')

    # Replace placeholders in nginx config
    sed -i "s|\${$var}|${escaped_value}|g" /etc/nginx/nginx.conf.default
done

# Ensure the file has proper newlines to avoid concatenation issues
sed -i 's/\r//' /usr/share/nginx/html/.env