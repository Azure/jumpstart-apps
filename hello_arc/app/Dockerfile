FROM mcr.microsoft.com/cbl-mariner/base/nodejs:16

# Create app directory. Replace this with your desired work directory e.g., /app.
WORKDIR /usr/src/app

# Install app dependencies.
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+).
COPY package*.json ./

# Build code for production.
RUN npm ci

# Copy the source for the app.
COPY . .

# Create an optimized production build.
RUN npm run build

# Expose the port. Replace this with your application's default port.
EXPOSE 8080

# Start the app. Replace this with your application's start command.
CMD [ "npm", "run", "start" ]