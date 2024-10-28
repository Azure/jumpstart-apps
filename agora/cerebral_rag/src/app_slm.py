# app.py
import os
import logging
from typing import List, Dict, Optional
from dotenv import load_dotenv
import onnxruntime_genai as og
from indexer import DocumentIndexer
import time
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

class RAGAssistant:
    def __init__(self, model_path: str):
        """Initialize RAG components: document indexer and language model."""
        self.model_path = model_path
        if not os.path.exists(self.model_path):
            raise ValueError(f"Model path does not exist: {self.model_path}")

        # Initialize document indexer
        try:
            self.indexer = DocumentIndexer()
            logging.info("Document indexer initialized successfully")
        except Exception as e:
            logging.error(f"Error initializing document indexer: {str(e)}")
            raise

        # Initialize language model and tokenizer
        try:
            logging.info(f"Loading model from {self.model_path}")
            self.model = og.Model(self.model_path)
            self.tokenizer = og.Tokenizer(self.model)
            self.tokenizer_stream = self.tokenizer.create_stream()
            logging.info("Language model initialized successfully")
        except Exception as e:
            logging.error(f"Error initializing language model: {str(e)}")
            raise

        # Default search options for the model
        self.search_options = {
            'max_length': 2048,
            'temperature': 0.7,
            'top_p': 0.9,
            'top_k': 50,
            'do_sample': True,
            'repetition_penalty': 1.1,
            'min_length': 1
        }

        # RAG prompt template
        self.rag_template = """<|user|>
Context information:
{context}

Using the context information above, please answer the following question:
{question}
<|end|>
<|assistant|>"""

    def _retrieve_context(self, query: str, n_results: int = 3) -> str:
        """Retrieve relevant context from the document store."""
        try:
            results = self.indexer.search_documents(query, n_results=n_results)
            
            if not results or not results.get('documents'):
                return "No relevant context found."
            
            # Format context from results
            contexts = []
            for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
                source = metadata.get('source', 'Unknown source')
                contexts.append(f"From {source}:\n{doc}")
            
            return "\n\n".join(contexts)
            
        except Exception as e:
            logging.error(f"Error retrieving context: {str(e)}")
            return "Error retrieving context information."

    def generate_response(self, 
                         question: str, 
                         stream: bool = True,
                         custom_search_options: Optional[Dict] = None,
                         verbose: bool = False,
                         timings: bool = False) -> str:
        """Generate a response using RAG."""
        try:
            started_timestamp = time.time() if timings else None
            first_token_timestamp = None

            # Retrieve relevant context
            context = self._retrieve_context(question)
            if verbose:
                logging.info("Context retrieved successfully")
                print("\nContext used for generation:")
                print(context)
                print("\nGenerating response...")

            # Format prompt with context and question
            prompt = self.rag_template.format(
                context=context,
                question=question
            )

            # Encode input
            input_tokens = self.tokenizer.encode(prompt)
            
            # Set up generation parameters
            search_opts = self.search_options.copy()
            if custom_search_options:
                search_opts.update(custom_search_options)

            # Create generator
            params = og.GeneratorParams(self.model)
            params.set_search_options(**search_opts)
            params.input_ids = input_tokens
            generator = og.Generator(self.model, params)

            if verbose:
                print("Starting generation...")

            # Generate response
            output_tokens = []
            generated_text = ""
            
            try:
                while not generator.is_done():
                    generator.compute_logits()
                    generator.generate_next_token()
                    
                    new_token = generator.get_next_tokens()[0]
                    output_tokens.append(new_token)
                    
                    if first_token_timestamp is None and timings:
                        first_token_timestamp = time.time()
                    
                    if stream:
                        token_text = self.tokenizer_stream.decode(new_token)
                        print(token_text, end='', flush=True)
                        generated_text += token_text
                    
            except KeyboardInterrupt:
                logging.warning("\nGeneration interrupted by user")
            
            if not stream:
                generated_text = self.tokenizer.decode(output_tokens)

            # Print timing information
            if timings and started_timestamp and first_token_timestamp:
                end_timestamp = time.time()
                prompt_time = first_token_timestamp - started_timestamp
                run_time = end_timestamp - first_token_timestamp
                print(f"\n\nTiming metrics:")
                print(f"Prompt length: {len(input_tokens)}")
                print(f"Generated tokens: {len(output_tokens)}")
                print(f"Time to first token: {prompt_time:.2f}s")
                print(f"Prompt tokens per second: {len(input_tokens)/prompt_time:.2f} tps")
                print(f"Generation tokens per second: {len(output_tokens)/run_time:.2f} tps")

            # Cleanup
            del generator
            
            return generated_text

        except Exception as e:
            logging.error(f"Error generating response: {str(e)}")
            return f"Error generating response: {str(e)}"

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="RAG Assistant with Phi-3")
    parser.add_argument('-m', '--model', type=str, required=True, 
                       help='Path to the model directory')
    parser.add_argument('-v', '--verbose', action='store_true', default=False,
                       help='Enable verbose output')
    parser.add_argument('-t', '--timings', action='store_true', default=False,
                       help='Show timing information')
    args = parser.parse_args()

    try:
        # Initialize RAG assistant
        model_path = args.model
        rag = RAGAssistant(model_path)
        logging.info("RAG Assistant initialized successfully")

        # Print configuration information
        if args.verbose:
            print("\nConfiguration:")
            print(f"Model path: {model_path}")
            print(f"Chroma host: {os.getenv('CHROMA_HOST')}")
            print(f"Chroma port: {os.getenv('CHROMA_PORT')}")
            print(f"Collection: {os.getenv('CHROMA_COLLECTION')}")
            print(f"Documents path: {os.getenv('DOCUMENTS_PATH')}")

        # Interactive loop
        print("\nRAG Assistant ready. Type 'exit' to quit.")
        while True:
            try:
                question = input("\nQuestion: ").strip()
                if not question:
                    print("Please enter a question.")
                    continue
                if question.lower() == 'exit':
                    print("Goodbye!")
                    break

                print("\nGenerating response...")
                response = rag.generate_response(
                    question,
                    verbose=args.verbose,
                    timings=args.timings
                )

            except KeyboardInterrupt:
                print("\nGeneration interrupted by user")
                continue
            except Exception as e:
                logging.error(f"Error processing question: {str(e)}")
                print(f"Error: {str(e)}")
                continue

    except Exception as e:
        logging.error(f"Application error: {str(e)}")
        raise

if __name__ == "__main__":
    main()