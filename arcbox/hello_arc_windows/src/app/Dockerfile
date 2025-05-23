FROM mcr.microsoft.com/windows/servercore:ltsc2022-amd64

# Arguments for metadata
ARG IMAGE_CREATE_DATE
ARG IMAGE_VERSION
ARG IMAGE_SOURCE_REVISION

# Set environment variables for Node.js version and download URL
ENV NODE_VERSION=18.18.2
ENV NODE_DOWNLOAD_URL=https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-x64.zip

# Download Node.js, extract, and set up the path
SHELL ["powershell", "-Command"]

RUN Invoke-WebRequest -Uri $Env:NODE_DOWNLOAD_URL -OutFile 'node.zip' ; \
    Expand-Archive -Path 'node.zip' -DestinationPath 'C:\\nodejs' ; \
    Remove-Item -Force 'node.zip' ; \
    setx /M PATH $('C:\\nodejs\\node-v' + $Env:NODE_VERSION + '-win-x64;' + $Env:PATH)

# Verify the installation
RUN node -v; npm -v

# Metadata as defined in OCI image spec annotations - https://github.com/opencontainers/image-spec/blob/master/annotations.md
LABEL org.opencontainers.image.title="Hello Arc!" \
      org.opencontainers.image.description="Provides a demo app to deploy to an Azure Arc-enabled Kubernetes cluster. It displays a message, the name of the pod and details of the node it is deployed to." \
      org.opencontainers.image.created=$IMAGE_CREATE_DATE \
      org.opencontainers.image.version=$IMAGE_VERSION \
      org.opencontainers.image.authors="Jan Egil Ring" \
      org.opencontainers.image.url="azurearcjumpstart.azurecr.io/hello-arc:windows" \
      org.opencontainers.image.documentation="https://github.com/microsoft/azure-arc-jumpstart-apps/tree/main/hello-arc-windows" \
      org.opencontainers.image.vendor="Microsoft" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/microsoft/azure-arc-jumpstart-apps.git" \
      org.opencontainers.image.revision=$IMAGE_SOURCE_REVISION

# Create app directory
RUN mkdir -p c:\app
WORKDIR  c:\\app

# Install app dependencies
COPY package.json c:\\app
RUN npm install

# Bundle app source
COPY . c:\\app

#USER node
CMD [ "C:\\nodejs\\node-v18.18.2-win-x64\\npm.cmd", "start" ]