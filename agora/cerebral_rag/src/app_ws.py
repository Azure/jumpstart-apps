# app_ws.py
import os
import logging
from typing import Dict, Optional
from dotenv import load_dotenv
import onnxruntime_genai as og
from indexer import DocumentIndexer
import time
import argparse
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import threading

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
#load_dotenv()

# Initialize Flask and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

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

        self.search_options = {
            'max_length': 2048,
            'temperature': 0.7,
            'top_p': 0.9,
            'top_k': 50,
            'do_sample': True,
            'repetition_penalty': 1.1,
            'min_length': 1
        }

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
            
            contexts = []
            for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
                source = metadata.get('source', 'Unknown source')
                contexts.append(f"From {source}:\n{doc}")
            
            return "\n\n".join(contexts)
            
        except Exception as e:
            logging.error(f"Error retrieving context: {str(e)}")
            return "Error retrieving context information."

    def generate_response(self, question: str, sid: str) -> None:
        """Generate a response using RAG with Socket.IO streaming."""
        try:
            start_time = time.time()
            
            # Retrieve context and emit
            #context = self._retrieve_context(question)
            context = ""
            socketio.emit('context', {'context': context}, room=sid)

            # Format prompt with context and question
            prompt = self.rag_template.format(
                context=context,
                question=question
            )

            # Encode input
            input_tokens = self.tokenizer.encode(prompt)
            
            # Create generator
            params = og.GeneratorParams(self.model)
            params.set_search_options(**self.search_options)
            params.input_ids = input_tokens
            generator = og.Generator(self.model, params)

            # Generate response
            generated_text = ""
            token_count = 0
            first_token_time = None
            
            try:
                while not generator.is_done():
                    generator.compute_logits()
                    generator.generate_next_token()
                    
                    new_token = generator.get_next_tokens()[0]
                    token_text = self.tokenizer_stream.decode(new_token)
                    generated_text += token_text
                    token_count += 1

                    if first_token_time is None:
                        first_token_time = time.time()
                    
                    # Emit token through Socket.IO
                    socketio.emit('token', {'token': token_text}, room=sid)
                    socketio.sleep(0)  # Allow other threads to run
                    
            except Exception as e:
                logging.error(f"Error during generation: {str(e)}")
                socketio.emit('error', {'error': str(e)}, room=sid)

            # Calculate and emit metrics
            end_time = time.time()
            metrics = {
                'total_tokens': token_count,
                'time_to_first_token': first_token_time - start_time if first_token_time else 0,
                'total_time': end_time - start_time,
                'tokens_per_second': token_count / (end_time - first_token_time) if first_token_time else 0
            }
            socketio.emit('metrics', metrics, room=sid)
            
            # Emit completion signal
            socketio.emit('complete', room=sid)

            # Cleanup
            del generator

        except Exception as e:
            logging.error(f"Error generating response: {str(e)}")
            socketio.emit('error', {'error': str(e)}, room=sid)

# Global RAG assistant instance
rag_assistant = None

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    logging.info("Client connected")
    emit('connected', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    logging.info("Client disconnected")

@socketio.on('question')
def handle_question(data):
    question = data.get('question', '').strip()
    if not question:
        emit('error', {'error': 'Question cannot be empty'})
        return

    logging.info(f"Received question: {question}")
    
    # Get the session ID for this connection
    sid = request.sid
    
    # Start generation in a separate thread
    thread = threading.Thread(
        target=rag_assistant.generate_response,
        args=(question, sid)
    )
    thread.daemon = True
    thread.start()

def main():
    parser = argparse.ArgumentParser(description="RAG Assistant with Phi-3")
    parser.add_argument('-m', '--model', type=str, required=True, 
                       help='Path to the model directory')
    parser.add_argument('-p', '--port', type=int, default=5000,
                       help='Port to run the server on')
    parser.add_argument('-d', '--debug', action='store_true',
                       help='Run in debug mode')
    args = parser.parse_args()

    try:
        global rag_assistant
        rag_assistant = RAGAssistant(args.model)
        logging.info("RAG Assistant initialized successfully")
        
        socketio.run(app, 
                    host='0.0.0.0',
                    port=args.port,
                    debug=args.debug,
                    allow_unsafe_werkzeug=True)

    except Exception as e:
        logging.error(f"Application error: {str(e)}")
        raise

if __name__ == "__main__":
    main()