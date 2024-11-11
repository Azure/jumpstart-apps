# indexer.py

import os
import logging
from typing import List, Optional, Dict, Any
import chromadb
import tempfile
from langchain.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
#from dotenv import load_dotenv

# Load environment variables
#load_dotenv()

# Global Configuration
VERBOSE = os.getenv("VERBOSE", "false").lower() == "true"
CHROMA_COLLECTION = os.getenv('CHROMA_COLLECTION', 'documents')
DOCUMENTS_PATH = os.getenv('DOCUMENTS_PATH')
DEFAULT_PERSIST_DIR = os.path.join(os.getcwd(), 'chroma_data')
PERSIST_DIRECTORY = os.getenv('CHROMA_PERSIST_DIR', DEFAULT_PERSIST_DIR)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if VERBOSE else logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DocumentIndexer:
    """
    Singleton class for managing document indexing and search operations using ChromaDB.
    """
    _instance = None
    _initialized = False

    def __new__(cls):
        """Ensure singleton pattern."""
        if cls._instance is None:
            cls._instance = super(DocumentIndexer, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize the DocumentIndexer if not already initialized."""
        if DocumentIndexer._initialized:
            return

        try:
            # Initialize basic attributes
            self.collection_name = CHROMA_COLLECTION
            self.indexed_files = set()
            
            # Initialize text splitter with original, more efficient settings
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
            )
            
            # Setup persistence directory
            self.persist_directory = self._setup_persist_directory()
            
            # Initialize database
            self.initialize_db()
            
            DocumentIndexer._initialized = True
            logger.info("DocumentIndexer initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing DocumentIndexer: {str(e)}")
            raise


    def _setup_persist_directory(self) -> str:
        """
        Setup and return the persistence directory path.
        Returns:
            str: Path to the persistence directory
        """
        try:
            # Start with the global PERSIST_DIRECTORY
            persist_dir = PERSIST_DIRECTORY

            # Check if we can write to the directory
            if os.path.exists(persist_dir):
                if not os.access(persist_dir, os.W_OK):
                    # If no write access, use a temporary directory
                    persist_dir = tempfile.mkdtemp(prefix='chroma_')
                    logger.info(f"No write access to {PERSIST_DIRECTORY}, using temporary directory: {persist_dir}")
                else:
                    logger.info(f"Using existing directory: {persist_dir}")
            else:
                # Try to create the directory
                try:
                    os.makedirs(persist_dir, mode=0o755, exist_ok=True)
                    logger.info(f"Created directory: {persist_dir}")
                except OSError:
                    # If creation fails, use a temporary directory
                    persist_dir = tempfile.mkdtemp(prefix='chroma_')
                    logger.info(f"Failed to create {PERSIST_DIRECTORY}, using temporary directory: {persist_dir}")

            return persist_dir

        except Exception as e:
            logger.error(f"Error setting up persistence directory: {str(e)}")
            # Fallback to temporary directory
            temp_dir = tempfile.mkdtemp(prefix='chroma_')
            logger.info(f"Using fallback temporary directory: {temp_dir}")
            return temp_dir

    def initialize_db(self):
        """Initialize ChromaDB client and collection."""
        try:
            # Ensure directory exists
            os.makedirs(self.persist_directory, mode=0o755, exist_ok=True)

            # Initialize client with PersistentClient for better performance
            self.client = chromadb.PersistentClient(
                path=self.persist_directory
            )
            
            # Reset collection if it exists
            try:
                self.client.delete_collection(self.collection_name)
                logger.info(f"Deleted existing collection: {self.collection_name}")
            except Exception as e:
                logger.debug(f"No existing collection to delete: {str(e)}")

            # Create new collection
            self.collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            
            logger.info("ChromaDB initialized with clean state")
            
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {str(e)}")
            raise


    def reinitialize(self) -> bool:
        """
        Reinitialize ChromaDB client and collection from scratch.
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info("Starting ChromaDB reinitialization...")
            
            # Clear tracking set
            self.indexed_files.clear()
            
            # Reinitialize database
            self.initialize_db()
            
            logger.info("ChromaDB reinitialization completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error during ChromaDB reinitialization: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(traceback.format_exc())
            return False

    def process_document(self, file_path: str) -> List[Any]:
        """
        Process a document and split it into chunks.
        
        Args:
            file_path (str): Path to the document to process
            
        Returns:
            List[Any]: List of document chunks
        """
        try:
            if VERBOSE:
                logger.debug(f"Processing file: {file_path}")
                
            file_extension = os.path.splitext(file_path)[1].lower()
            
            # Load document based on file type
            if file_extension == '.pdf':
                logger.info(f"Loading PDF document: {file_path}")
                loader = PyPDFLoader(file_path)
            elif file_extension in ['.txt', '.md']:
                logger.info(f"Loading text document: {file_path}")
                loader = TextLoader(file_path, encoding='utf-8')
            else:
                logger.warning(f"Unsupported file type: {file_extension}")
                return []

            # Load and split document
            documents = loader.load()
            if VERBOSE:
                logger.debug(f"Document loaded successfully: {len(documents)} pages")
            
            # Split into chunks
            texts = self.text_splitter.split_documents(documents)
            if VERBOSE:
                logger.debug(f"Document split into {len(texts)} chunks")
                if texts:
                    logger.debug(f"Average chunk size: {sum(len(t.page_content) for t in texts) / len(texts):.0f} characters")
            
            return texts
            
        except Exception as e:
            logger.error(f"Error processing document {file_path}: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(traceback.format_exc())
            return []

    def search_documents(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        """
        Search for relevant documents using optimized querying.
        
        Args:
            query (str): Search query
            k (int): Number of results to return
            
        Returns:
            List[Dict[str, Any]]: List of relevant documents with metadata
        """
        try:
            if not query.strip():
                return []

            if VERBOSE:
                logger.debug(f"Searching for: '{query}'")

            # Optimized query without extra includes for better performance
            results = self.collection.query(
                query_texts=[query],
                n_results=k
            )
            
            # Format results
            documents = []
            if results['documents'] and results['documents'][0]:
                for doc, metadata in zip(
                    results['documents'][0],
                    results['metadatas'][0]
                ):
                    documents.append({
                        'content': doc,
                        'source': metadata['source'],
                        'page': metadata.get('page', 0)
                    })

            if VERBOSE:
                logger.debug(f"Found {len(documents)} matching documents")
            
            return documents
            
        except Exception as e:
            logger.error(f"Error during search: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(traceback.format_exc())
            return []
        
    def index_documents(self, directory_path: Optional[str] = None) -> bool:
        """
        Index documents from a directory with optimized chunking.
        
        Args:
            directory_path (Optional[str]): Path to directory containing documents
            
        Returns:
            bool: True if indexing was successful, False otherwise
        """
        try:
            directory_path = directory_path or DOCUMENTS_PATH
            if not directory_path or not os.path.exists(directory_path):
                raise ValueError(f"Invalid directory path: {directory_path}")

            logger.info(f"Starting document indexing from: {directory_path}")
            
            # Track progress
            processed_files = set()
            total_chunks = 0
            processed_count = 0

            # Process each file
            for root, _, files in os.walk(directory_path):
                for file in files:
                    if file.endswith(('.pdf', '.txt', '.md')):
                        file_path = os.path.join(root, file)
                        
                        # Skip if already processed
                        if file_path in processed_files:
                            continue
                        
                        try:
                            # Process document
                            texts = self.process_document(file_path)
                            
                            if texts:
                                # Prepare data for ChromaDB with minimal metadata
                                documents = [text.page_content for text in texts]
                                metadatas = [{"source": file_path, "page": i} for i in range(len(texts))]
                                
                                # Generate simple IDs
                                ids = [f"{os.path.basename(file_path)}_{i}" for i in range(len(texts))]
                                
                                # Add to ChromaDB
                                self.collection.add(
                                    documents=documents,
                                    metadatas=metadatas,
                                    ids=ids
                                )
                                
                                # Update statistics
                                total_chunks += len(texts)
                                processed_count += 1
                                processed_files.add(file_path)
                                
                                if VERBOSE:
                                    logger.debug(f"Indexed {len(texts)} chunks from {file_path}")
                            else:
                                logger.warning(f"No content extracted from: {file_path}")
                                
                        except Exception as e:
                            logger.error(f"Error processing {file_path}: {str(e)}")
                            continue

            logger.info(f"Indexing completed: {processed_count} files, {total_chunks} chunks")
            return total_chunks > 0
            
        except Exception as e:
            logger.error(f"Error during indexing: {str(e)}")
            return False

    def get_collection_info(self) -> Dict[str, Any]:
        """
        Get information about the current collection.
        
        Returns:
            Dict[str, Any]: Collection statistics and metadata
        """
        try:
            info = {
                "collection_name": self.collection_name,
                "total_documents": self.collection.count(),
                "indexed_files": len(self.indexed_files),
                "has_documents": self.collection.count() > 0
            }
            return info
        except Exception as e:
            logger.error(f"Error getting collection info: {str(e)}")
            return {
                "collection_name": self.collection_name,
                "error": str(e)
            }

    def clear_index(self) -> bool:
        """
        Clear the entire index.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.reinitialize()

def cleanup_temp_dirs():
    """Cleanup temporary directories on exit."""
    temp_dir = tempfile.gettempdir()
    for item in os.listdir(temp_dir):
        if item.startswith('chroma_'):
            try:
                path = os.path.join(temp_dir, item)
                if os.path.isdir(path):
                    import shutil
                    shutil.rmtree(path)
                    logger.debug(f"Cleaned up temporary directory: {path}")
            except Exception as e:
                logger.warning(f"Could not remove temporary directory {item}: {str(e)}")

# Register cleanup
import atexit
atexit.register(cleanup_temp_dirs)