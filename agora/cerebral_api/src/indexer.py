# indexer.py
import os
from typing import List, Optional
import chromadb
from chromadb.config import Settings
import time
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
# load_dotenv()

class DocumentIndexer:
    def __init__(self):
        # Get configuration from environment variables
        self.host = os.getenv('CHROMA_HOST')
        self.port = int(os.getenv('CHROMA_PORT', 8040))
        self.collection_name = os.getenv('CHROMA_COLLECTION', 'documents')

        if not self.host:
            raise ValueError("CHROMA_HOST environment variable is not set")

        self._setup_chroma_client()
        self._setup_text_splitter()

    def _setup_chroma_client(self):
        """Setup ChromaDB client with retry logic"""
        max_retries = 5
        retry_delay = 5
        
        logging.info(f"Attempting to connect to ChromaDB at {self.host}:{self.port}")
        
        for attempt in range(max_retries):
            try:
                settings = Settings(
                    chroma_server_host=self.host,
                    chroma_server_http_port=self.port,
                    chroma_server_cors_allow_origins=["*"]
                )

                self.client = chromadb.HttpClient(
                    host=settings.chroma_server_host,
                    port=settings.chroma_server_http_port,
                    settings=settings
                )

                heartbeat = self.client.heartbeat()
                logging.info(f"Successfully connected to ChromaDB. Heartbeat: {heartbeat}")
                
                self.collection = self.client.get_or_create_collection(
                    name=self.collection_name,
                    metadata={"hnsw:space": "cosine"}
                )
                logging.info(f"Successfully created/accessed collection: {self.collection_name}")
                break
                
            except Exception as e:
                if attempt < max_retries - 1:
                    logging.warning(f"Connection attempt {attempt + 1} failed. Retrying in {retry_delay} seconds... Error: {str(e)}")
                    time.sleep(retry_delay)
                else:
                    raise Exception(f"Could not connect to ChromaDB after {max_retries} attempts: {str(e)}")

    def _setup_text_splitter(self):
        """Configure the text splitter"""
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def process_document(self, file_path: str) -> List[str]:
        """Process a document and split it into chunks."""
        try:
            # Choose the appropriate loader based on file extension
            file_extension = os.path.splitext(file_path)[1].lower()
            
            if file_extension == '.pdf':
                logging.info(f"Loading PDF document: {file_path}")
                loader = PyPDFLoader(file_path)
            elif file_extension in ['.txt', '.md']:
                logging.info(f"Loading text document: {file_path}")
                loader = TextLoader(file_path)
            else:
                logging.warning(f"Unsupported file type: {file_extension}")
                return []

            # Load and split the document
            documents = loader.load()
            logging.info(f"Document loaded successfully: {file_path}")
            
            texts = self.text_splitter.split_documents(documents)
            logging.info(f"Document split into {len(texts)} chunks")
            
            return [doc.page_content for doc in texts]
            
        except Exception as e:
            logging.error(f"Error processing document {file_path}: {str(e)}", exc_info=True)
            return []

    def index_documents(self, directory_path: Optional[str] = None) -> None:
        """Index all documents in a directory."""
        try:
            # Use directory path from environment variable if not provided
            directory_path = directory_path or os.getenv('DOCUMENTS_PATH')
            if not directory_path:
                raise ValueError("No documents path provided and DOCUMENTS_PATH environment variable is not set")

            if not os.path.exists(directory_path):
                raise ValueError(f"Documents directory does not exist: {directory_path}")

            logging.info(f"Starting document indexing from directory: {directory_path}")
            
            total_documents = 0
            processed_documents = 0
            failed_documents = []

            for root, _, files in os.walk(directory_path):
                for file in files:
                    if file.endswith(('.txt', '.md', '.pdf')):
                        total_documents += 1
                        file_path = os.path.join(root, file)
                        logging.info(f"Processing document {file_path}")
                        
                        try:
                            # Process the document
                            chunks = self.process_document(file_path)
                            
                            if chunks:
                                # Generate unique IDs for each chunk
                                ids = [f"{file}_{i}" for i in range(len(chunks))]
                                
                                # Index in ChromaDB
                                self.collection.add(
                                    documents=chunks,
                                    ids=ids,
                                    metadatas=[{"source": file_path} for _ in chunks]
                                )
                                processed_documents += 1
                                logging.info(f"Successfully indexed document: {file_path}")
                            else:
                                failed_documents.append(file_path)
                                logging.warning(f"No content extracted from: {file_path}")
                                
                        except Exception as e:
                            failed_documents.append(file_path)
                            logging.error(f"Failed to process document {file_path}: {str(e)}")
            
            logging.info(f"Indexing completed. Processed {processed_documents}/{total_documents} documents.")
            if failed_documents:
                logging.warning("Failed documents:")
                for doc in failed_documents:
                    logging.warning(f"- {doc}")
                        
        except Exception as e:
            logging.error(f"Error during indexing: {str(e)}", exc_info=True)
            raise

    def search_documents(self, query: str, n_results: int = 5) -> List[dict]:
        """Search for documents similar to the query."""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            return results
        except Exception as e:
            logging.error(f"Error during search: {str(e)}")
            return []

def test_connection():
    """Test the ChromaDB connection using environment variables."""
    try:
        indexer = DocumentIndexer()
        logging.info("Connection test successful!")
        return True
    except Exception as e:
        logging.error(f"Connection test failed: {str(e)}")
        return False

if __name__ == "__main__":
    try:
        if test_connection():
            indexer = DocumentIndexer()
            indexer.index_documents()
            
            # Example search
            query = "your query here"
            results = indexer.search_documents(query)
            logging.info(f"Search results for '{query}': {results}")
    except Exception as e:
        logging.error(f"Application error: {str(e)}")