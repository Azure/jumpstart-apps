# Use the official Python image
FROM python:3.9-slim

# Install Tini and Supervisor
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
    && rm -rf /var/lib/apt/lists/*

# Create the application directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt /app/

# Install Python dependencies
#RUN pip install --no-cache-dir -r requirements.txt && \
#    pip install --no-cache-dir huggingface-hub[cli]
# Update pip and install dependencies in specific order to avoid conflicts
RUN pip install --no-cache-dir --upgrade pip && \
    # Install core dependencies first to manage version conflicts
    #pip install --no-cache-dir langchain-core>=0.2.22,<0.3.0 && \
    #pip install --no-cache-dir langchain-community==0.2.9 && \
    #pip install --no-cache-dir langchain==0.3.0 && \
    # Install remaining dependencies
    pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /app/models/phi3 && \
    mkdir -p /app/docs && \
    mkdir -p /app/templates && \
    mkdir -p /app/cpu_and_mobile

# Download documents
RUN cd /app/docs && \
    wget -O "SmartShelf_Manual.pdf" "https://download.microsoft.com/download/2b3927e0-5342-4d84-8b55-ab958281259b/SmartShelf%20System%20User%20Manual%20for%20Contoso%20Hypermarket.pdf" && \
    wget -O "Scale_Manual.pdf" "https://download.microsoft.com/download/2b3927e0-5342-4d84-8b55-ab958281259b/Scale%20System%20User%20Manual%20for%20Contoso%20Hypermarket.pdf" && \
    wget -O "Refrigeration_Manual.pdf" "https://download.microsoft.com/download/2b3927e0-5342-4d84-8b55-ab958281259b/Refrigeration%20System%20User%20Manual%20for%20Contoso%20Hypermarket.pdf" && \
    wget -O "Checkout_Manual.pdf" "https://download.microsoft.com/download/2b3927e0-5342-4d84-8b55-ab958281259b/Automated%20Checkout%20System%20User%20Manual%20for%20Contoso%20Hypermarket.pdf" && \
    wget -O "HVAC_Manual.pdf" "https://download.microsoft.com/download/2b3927e0-5342-4d84-8b55-ab958281259b/HVAC%20System%20User%20Manual%20for%20Contoso%20Hypermarket.pdf"

# Download the model
RUN huggingface-cli download microsoft/Phi-3-mini-4k-instruct-onnx \
    --include "cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4/*" \
    --local-dir /app

# Copy the rest of the application code
COPY . /app

ENV AZURE_OPENAI_API_KEY=<your_azure_openai_api_key> \
    CHATGPT_MODEL=gpt-35-turbo \
    AZURE_OPENAI_ENDPOINT=<your_azure_openai_endpoint> \
    OPENAI_API_VERSION=2024-03-01-preview \
    # Environment variables for InfluxDB
    INFLUXDB_URL=http://influxdb.cerebral.svc.cluster.local:8086 \
    INFLUXDB_BUCKET=cerebral \
    INFLUXDB_TOKEN=secret-token \
    INFLUXDB_ORG=InfluxData \
    # Environment variables for SQL
    SQL_DATABASE=RetailDB \
    SQL_SERVER=10.0.0.4 \
    SQL_USERNAME=SA \
    SQL_PASSWORD=ArcPassword123!!
    #RAG on the Edge
    # Environment variables
    ENV PYTHONUNBUFFERED=1
    # chroma-db-service
    ENV CHROMA_HOST=10.0.0.4  
    ENV CHROMA_PORT=8040
    ENV CHROMA_COLLECTION=documents
    ENV DOCUMENTS_PATH=docs
    ENV MODEL_PATH=cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4
    ENV USE_LOCAL_LLM=false
    ENV PORT=5030

# Copy the Supervisor configuration
COPY supervisor.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports that the applications will use
#EXPOSE 5004 8000
EXPOSE 5030

# Start Supervisor
# CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
CMD ["python", "app.py"]