import chromadb
from chromadb.config import Settings

# Test connection
settings = Settings(
    chroma_server_host="10.0.0.4",
    chroma_server_http_port=8040,
    chroma_server_cors_allow_origins=["*"]
)

client = chromadb.HttpClient(
    host=settings.chroma_server_host,
    port=settings.chroma_server_http_port,
    settings=settings
)

# Test heartbeat
print(client.heartbeat())