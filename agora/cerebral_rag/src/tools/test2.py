# test_connection.py
import os
from dotenv import load_dotenv
import chromadb
from chromadb.config import Settings
import time

# Load environment variables
load_dotenv()

def test_chroma_connection():
    host = os.getenv('CHROMA_HOST')
    port = int(os.getenv('CHROMA_PORT', 8040))
    collection_name = os.getenv('CHROMA_COLLECTION', 'documents')

    if not host:
        raise ValueError("CHROMA_HOST environment variable is not set")

    print(f"Testing connection to ChromaDB at {host}:{port}")

    settings = Settings(
        chroma_server_host=host,
        chroma_server_http_port=port,
        chroma_server_cors_allow_origins=["*"]
    )

    try:
        client = chromadb.HttpClient(
            host=host,
            port=port,
            settings=settings
        )
        
        # Test heartbeat
        heartbeat = client.heartbeat()
        print(f"Heartbeat successful: {heartbeat}")
        
        # Test collection creation
        collection = client.get_or_create_collection(name=collection_name)
        print(f"Successfully accessed collection: {collection_name}")
        
        return True
        
    except Exception as e:
        print(f"Connection test failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_chroma_connection()