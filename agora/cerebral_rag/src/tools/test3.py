# test_connection.py
import os
from dotenv import load_dotenv
import chromadb
from chromadb.config import Settings
import time

# Load environment variables
load_dotenv()

def test_chroma_connection():
    # Get configuration from environment variables
    host = os.getenv('CHROMA_HOST')
    port = int(os.getenv('CHROMA_PORT', 8040))
    
    print(f"Testing connection to ChromaDB at {host}:{port}")

    try:
        # Configure settings exactly as in the working version
        settings = Settings(
            chroma_server_host=host,
            chroma_server_http_port=port,
            chroma_server_cors_allow_origins=["*"]
        )

        # Create client exactly as in the working version
        client = chromadb.HttpClient(
            host=settings.chroma_server_host,
            port=settings.chroma_server_http_port,
            settings=settings
        )
        
        # Test heartbeat
        heartbeat = client.heartbeat()
        print(f"Heartbeat successful: {heartbeat}")
        return client
        
    except Exception as e:
        print(f"Connection test failed: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        client = test_chroma_connection()
        print("Connection test successful!")
    except Exception as e:
        print(f"Final error: {str(e)}")