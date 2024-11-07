# Use the official Python image
FROM python:3.9-slim

# Install Tini, Supervisor, and other required packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    libmagic1 \
    git-lfs \
    unixodbc \
    unixodbc-dev \
    freetds-dev \
    freetds-bin \
    tdsodbc \
    wget \
    curl \
    apt-transport-https \
    gnupg2 \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && ACCEPT_EULA=Y apt-get install -y mssql-tools18 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the PATH environment variable to include MSSQL tools
ENV PATH="$PATH:/opt/mssql-tools18/bin"

# Create the application directory
WORKDIR /app

RUN mkdir -p /app/chroma_data && \
    chmod -R 755 /app/chroma_data && \
    chown -R nobody:nogroup /app/chroma_data

# TO be adapted in the helm chart
#RUN mkdir -p /app/chroma_data && chmod 755 /app/chroma_data \
#    && mkdir -p /app/docs

# Copy requirements.txt and install dependencies
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies for WebSocket client (if package.json exists)
#WORKDIR /app/websocket-client
#RUN if [ -f package.json ]; then \
#        npm install && \
        # Optionally install development dependencies for testing
#        npm install --save-dev \
#            jest \
#            mocha \
#            chai \
#            socket.io-client \
#            websocket; \
#    fi

# Copy the rest of the application code
COPY . /app

# Copy WebSocket client files
COPY websocket-client /app/websocket-client

# Environment variables for Azure OpenAI
ENV AZURE_OPENAI_API_KEY=<your_azure_openai_api_key> \
    CHATGPT_MODEL=gpt-35-turbo \
    AZURE_OPENAI_ENDPOINT=<your_azure_openai_endpoint> \
    OPENAI_API_VERSION=2024-03-01-preview

# Environment variables for InfluxDB
ENV INFLUXDB_URL=http://influxdb.cerebral.svc.cluster.local:8086 \
    INFLUXDB_BUCKET=cerebral \
    INFLUXDB_TOKEN=secret-token \
    INFLUXDB_ORG=InfluxData

# Environment variables for SQL Server
ENV SQL_DATABASE=RetailDB \
    SQL_SERVER=10.0.0.4 \
    SQL_USERNAME=SA \
    SQL_PASSWORD=ArcPassword123!!

# Environment variables for RAG and ChromaDB
ENV PYTHONUNBUFFERED=1 \
    CHROMA_HOST=10.0.0.4 \
    CHROMA_PORT=8040 \
    CHROMA_COLLECTION=documents \
    #Update
    DOCUMENTS_PATH=/app/docs \
    #Update
    MODEL_PATH=/app/cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4 \
    USE_LOCAL_LLM=false \
    PORT=5003 \
    STORE_ID=SEA

# Create volume for persistent data
#VOLUME ["/app/chroma_data", "/app/docs"]

# Expose the ports that the applications will use
EXPOSE 5003

CMD ["python", "app.py"]