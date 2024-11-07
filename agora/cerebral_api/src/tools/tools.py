# tools.py
import os
import logging
from typing import Optional, List
import argparse
from indexer import DocumentIndexer

VERBOSE=True

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IndexTools:
    def __init__(self):
        """Initialize IndexTools with DocumentIndexer instance."""
        try:
            self.indexer = DocumentIndexer()
            logger.info("IndexTools initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing IndexTools: {str(e)}")
            raise

    def clear_index(self) -> bool:
        """
        Clear all documents from the index.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info("Starting index cleanup...")
            
            # Get current index stats before clearing
            count_before = self.indexer.collection.count()
            logger.info(f"Current document count: {count_before}")
            
            if count_before > 0:
                # Get all document IDs
                results = self.indexer.collection.get()
                if results and 'ids' in results:
                    # Delete all documents by their IDs
                    self.indexer.collection.delete(
                        ids=results['ids']
                    )
                    logger.info(f"Deleted {len(results['ids'])} documents")
            
            # Clear the tracking set
            self.indexer.indexed_files.clear()
            
            # Verify deletion
            count_after = self.indexer.collection.count()
            logger.info(f"Document count after clearing: {count_after}")
            
            return count_after == 0
            
        except Exception as e:
            logger.error(f"Error clearing index: {str(e)}")
            return False

    def delete_collection(self) -> bool:
        """
        Delete the entire collection and recreate it empty.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info(f"Deleting collection: {self.indexer.collection_name}")
            
            # Delete the collection
            self.indexer.client.delete_collection(self.indexer.collection_name)
            
            # Recreate the collection
            self.indexer.collection = self.indexer.client.create_collection(
                name=self.indexer.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            
            # Clear the tracking set
            self.indexer.indexed_files.clear()
            
            logger.info("Collection deleted and recreated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting collection: {str(e)}")
            return False

    def reindex_documents(self, documents_path: Optional[str] = None) -> bool:
        """
        Clear existing index and reindex all documents.
        
        Args:
            documents_path: Optional path to documents directory. 
                          If not provided, uses DOCUMENTS_PATH from environment.
                          
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info("Starting reindexing process...")
            
            # Clear existing index
            if not self.delete_collection():
                logger.error("Failed to clear existing collection")
                return False
                
            # Reindex documents
            logger.info("Starting document indexing...")
            self.indexer.index_documents(documents_path)
            
            # Verify indexing
            count = self.indexer.collection.count()
            logger.info(f"Reindexing completed. New document count: {count}")
            
            return count > 0
            
        except Exception as e:
            logger.error(f"Error during reindexing: {str(e)}")
            return False

    def get_index_stats(self) -> dict:
        """
        Get current statistics about the index.
        
        Returns:
            dict: Statistics about the index
        """
        try:
            stats = {
                "total_documents": self.indexer.collection.count(),
                "indexed_files": len(self.indexer.indexed_files),
                "collection_name": self.indexer.collection_name
            }
            
            # Get sample document
            try:
                results = self.indexer.collection.get(limit=1)
                stats["has_documents"] = bool(results and results['documents'] and results['documents'])
                if stats["has_documents"]:
                    stats["sample_sources"] = [
                        os.path.basename(meta.get('source', 'Unknown'))
                        for meta in results['metadatas'][:1]
                    ]
            except Exception as e:
                stats["has_documents"] = False
                if VERBOSE:
                    logger.debug(f"Error getting sample: {str(e)}")
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting index stats: {str(e)}")
            return {}
    def search_content(self, 
                      query: str = None, 
                      document_name: str = None, 
                      limit: int = 5, 
                      show_scores: bool = False) -> List[dict]:
        """
        Search for content in the index by query or document name.
        
        Args:
            query: Optional semantic search query
            document_name: Optional specific document name to search for
            limit: Maximum number of results to return
            show_scores: Whether to include relevance scores in results
            
        Returns:
            List[dict]: List of matching documents with their metadata
        """
        try:
            logger.info(f"Searching content{'by query: ' + query if query else ' by document name: ' + document_name if document_name else ''}")
            
            if not query and not document_name:
                logger.error("Must provide either query or document_name")
                return []

            if document_name:
                logger.info("1. document_name")
                # Search by document name in metadata
                results = self.indexer.collection.get(
                    where={"source": {"$eq": document_name}}
                )
            else:
                logger.info("1. by query")
                # Semantic search by query
                results = self.indexer.collection.query(
                    query_texts=[query],
                    n_results=10,
                    where_document={"$contains": "search_string"}
                    #where_document={"$contains":"search_string"}
                    #n_results=limit,
                    #include=['documents', 'metadatas', 'distances']
                )

            # Process and format results
            formatted_results = []
            
            if document_name:
                # Format results from get()
                if results and 'documents' in results and results['documents']:
                    for doc, meta in zip(results['documents'], results['metadatas']):
                        result = {
                            'content': doc,
                            'source': os.path.basename(meta.get('source', 'Unknown')),
                            'metadata': meta
                        }
                        formatted_results.append(result)
            else:
                # Format results from query()
                if results and 'documents' in results and results['documents'][0]:
                    documents = results['documents'][0]
                    metadatas = results['metadatas'][0]
                    distances = results['distances'][0] if show_scores else None
                    
                    for idx, (doc, meta) in enumerate(zip(documents, metadatas)):
                        result = {
                            'content': doc,
                            'source': os.path.basename(meta.get('source', 'Unknown')),
                            'metadata': meta
                        }
                        if show_scores and distances:
                            result['relevance_score'] = 1 - distances[idx]  # Convert distance to similarity score
                        formatted_results.append(result)

            # Log results summary
            logger.info(f"Found {len(formatted_results)} matching documents")
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching content: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(traceback.format_exc())
            return []

    def display_search_results(self, results: List[dict], show_full_content: bool = False):
        """
        Display search results in a formatted way.
        
        Args:
            results: List of search results
            show_full_content: Whether to show full content or just a preview
        """
        if not results:
            logger.info("No results found")
            return

        logger.info(f"\nFound {len(results)} results:")
        for idx, result in enumerate(results, 1):
            logger.info(f"\n--- Result {idx} ---")
            logger.info(f"Source: {result['source']}")
            
            if 'relevance_score' in result:
                logger.info(f"Relevance: {result['relevance_score']:.2%}")
            
            content = result['content']
            if not show_full_content and len(content) > 200:
                content = content[:200] + "..."
            logger.info(f"Content:\n{content}\n")

def main():
    """Command line interface for index tools."""
    parser = argparse.ArgumentParser(description='ChromaDB Index Management Tools')
    parser.add_argument('--clear', action='store_true', help='Clear the existing index')
    parser.add_argument('--delete-collection', action='store_true', help='Delete and recreate the collection')
    parser.add_argument('--reindex', action='store_true', help='Reindex all documents')
    parser.add_argument('--stats', action='store_true', help='Show index statistics')
    parser.add_argument('--documents-path', help='Path to documents directory for reindexing')

    # Add search arguments
    parser.add_argument('--search', help='Search query for semantic search')
    parser.add_argument('--document', help='Search for specific document by name')
    parser.add_argument('--limit', type=int, default=5, help='Maximum number of results to return')
    parser.add_argument('--show-scores', action='store_true', help='Show relevance scores in results')
    parser.add_argument('--full-content', action='store_true', help='Show full content instead of preview')
    
    args = parser.parse_args()
    
    try:
        tools = IndexTools()
        
        if args.stats or (not args.clear and not args.delete_collection and not args.reindex):
            # Always show stats unless specifically only clearing/reindexing
            stats = tools.get_index_stats()
            logger.info("Index Statistics:")
            for key, value in stats.items():
                logger.info(f"- {key}: {value}")
        
        if args.clear:
            logger.info("Clearing index...")
            success = tools.clear_index()
            logger.info("Index cleared successfully" if success else "Failed to clear index")
            
        if args.delete_collection:
            logger.info("Deleting and recreating collection...")
            success = tools.delete_collection()
            logger.info("Collection recreated successfully" if success else "Failed to recreate collection")
            
        if args.reindex:
            logger.info("Reindexing documents...")
            success = tools.reindex_documents(args.documents_path)
            logger.info("Reindexing completed successfully" if success else "Reindexing failed")

        # Handle search operations
        if args.search or args.document:
            results = tools.search_content(
                query=args.search,
                document_name=args.document,
                limit=args.limit,
                show_scores=args.show_scores
            )
            tools.display_search_results(results, show_full_content=args.full_content)
            return 0
            
    except Exception as e:
        logger.error(f"Error running tools: {str(e)}")
        return 1
        
    return 0

if __name__ == "__main__":
    exit(main())