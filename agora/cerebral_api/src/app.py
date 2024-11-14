from flask import Flask, request, jsonify, render_template
from flask_restx import Api, Resource, Namespace, fields
from flask_socketio import SocketIO, emit
from werkzeug.exceptions import BadRequest
from flask_cors import CORS
import random
import logging
import os
from typing import Union
import threading
import uuid
import time
from datetime import datetime
import azure.cognitiveservices.speech as speechsdk

# Import custom modules
from llm import LLM
from InfluxDBHandler import InfluxDBHandler
from SqlDBHandler import SqlDBHandler
from SpeechToText import STT
from indexer import DocumentIndexer
import onnxruntime_genai as og

from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

import atexit
from indexer import cleanup_temp_dirs

#DEV_MODE
#from dotenv import load_dotenv
#load_dotenv()

# Global configuration variables
VERBOSE = os.getenv("VERBOSE", "false").lower() == "true"
USE_LOCAL_LLM = os.getenv('USE_LOCAL_LLM', 'false').lower() == 'true'
MODEL_PATH = os.getenv('MODEL_PATH', './cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4')
DOCUMENTS_PATH = os.getenv('DOCUMENTS_PATH')
CHROMA_AVAILABLE = False  # Global flag for ChromaDB availability
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
REQUIRE_CHROMA_INDEX = True
DEFAULT_PERSIST_DIR = os.path.join(os.getcwd(), 'chroma_data')
PERSIST_DIRECTORY = os.getenv('CHROMA_PERSIST_DIR', DEFAULT_PERSIST_DIR)
CHROMA_COLLECTION = os.getenv('CHROMA_COLLECTION', 'documents')


API_VERSION = "0.8"

#DOCUMENT_INDEXER = None


# Initialize Flask and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Initialize REST API
api = Api(app, version='1.0', title='Cerebral API',
          description='Manage industries and roles in the Cerebral application.')

ns = api.namespace('Cerebral', description='Cerebral Operations')

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT"]}})

# Initialize handlers
llm = LLM()
influx_handler = InfluxDBHandler()
sql_handler = SqlDBHandler()
stt = STT()


def configure_logging() -> None:
    """Configure logging based on VERBOSE setting."""
    # Configure basic logging
    logging.basicConfig(
        level=logging.DEBUG if VERBOSE else logging.INFO,
        format=LOG_FORMAT
    )
    
    # Create logger for this module
    logger = logging.getLogger(__name__)
    
    # Log initial configuration
    if VERBOSE:
        logger.debug("Verbose logging enabled")
    
    return logger

# Initialize logger
logger = configure_logging()

class LoggingMixin:
    """Mixin to add logging capabilities to classes."""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        
    def log(self, level: Union[str, int], message: str, *args, **kwargs) -> None:
        """Log a message at the specified level."""
        if isinstance(level, str):
            level = getattr(logging, level.upper(), logging.INFO)
        self.logger.log(level, message, *args, **kwargs)


# RAG Assistant Class
class RAGAssistant:
    """RAG Assistant using LangChain components and local model."""
    
    def __init__(self, model_path: str):
        """Initialize RAG components with LangChain."""
        try:
            if not os.path.exists(model_path):
                raise ValueError(f"Model path does not exist: {model_path}")

            logger.info("Initializing RAG Assistant...")

            # Initialize embeddings
            self.embeddings = SentenceTransformerEmbeddings(
                model_name='all-MiniLM-L6-v2',
                cache_folder=os.path.join(PERSIST_DIRECTORY, 'embeddings_cache')
            )
            logger.info("Embeddings initialized")

            # Initialize ONNX model
            self.model = og.Model(model_path)
            self.tokenizer = og.Tokenizer(self.model)
            self.tokenizer_stream = self.tokenizer.create_stream()
            logger.info("Local model initialized")

            # Initialize Chroma and retriever
            self.vectorstore = Chroma(
                persist_directory=PERSIST_DIRECTORY,
                embedding_function=self.embeddings,
                collection_name=CHROMA_COLLECTION
            )

            logger.info(f"Vector store initialized with collection: {CHROMA_COLLECTION}")

            # Verify collection has documents
            if VERBOSE:
                count = self.vectorstore._collection.count()
                logger.debug(f"Collection contains {count} documents")

            self.retriever = self.vectorstore.as_retriever(
                search_kwargs={'k': 3}
            )
            logger.info("Vector store initialized")

            # Setup prompt template
            self.prompt_template = """You are an AI assistant that helps users by providing accurate responses based on the given context.
            Always use the provided context to formulate your response. If the context doesn't contain enough
            information, acknowledge this and provide the best possible answer based on the available context.
            
            Context information:
            {context}
            
            Question:
            {question}
            """
            
            # Search parameters
            self.search_options = {
                'max_length': 2048,
                'temperature': 0.7,
                'top_p': 0.9,
                'top_k': 50,
                'do_sample': True,
                'repetition_penalty': 1.1,
                'min_length': 1
            }
            
            logger.info("RAG Assistant initialized successfully")

        except Exception as e:
            logger.error(f"Error initializing RAG Assistant: {str(e)}")
            raise

    def generate_response_slm(self, question: str, industry: str = None, role: str = None, sid: str = None) -> str:
        """Generate response using local model and retrieved context with improved socket handling."""
        try:
            if VERBOSE:
                logger.debug(f"Generating response for question: {question}")

            # Send initial status to keep connection alive
            if sid:
                socketio.emit('status', {'message': 'Searching relevant documents...'}, room=sid)

            # Get context with timeout
            try:
                context = self._get_context(question)
                
                # Send context immediately when found
                if sid:
                    socketio.emit('context', {'context': context}, room=sid)
                    socketio.emit('status', {'message': 'Generating response...'}, room=sid)
            except Exception as e:
                logger.error(f"Error retrieving context: {str(e)}")
                context = "Error retrieving context. Proceeding with general response."
                if sid:
                    socketio.emit('error', {'error': 'Context retrieval error, proceeding with general response'}, room=sid)

            # Format prompt
            prompt = self.prompt_template.format(
                context=context,
                question=question
            )

            # Keep connection alive during token generation
            last_update = time.time()
            update_interval = 2.0  # Send status update every 2 seconds

            # Generate response
            input_tokens = self.tokenizer.encode(prompt)
            params = og.GeneratorParams(self.model)
            params.set_search_options(**self.search_options)
            params.input_ids = input_tokens
            generator = og.Generator(self.model, params)

            try:
                generated_text = ""
                current_time = time.time()

                while not generator.is_done():
                    # Send keep-alive status periodically
                    if sid and (current_time - last_update) > update_interval:
                        socketio.emit('status', {'message': 'Still generating...'}, room=sid)
                        last_update = current_time

                    generator.compute_logits()
                    generator.generate_next_token()
                    
                    new_token = generator.get_next_tokens()[0]
                    token_text = self.tokenizer_stream.decode(new_token)
                    generated_text += token_text
                    
                    if sid:
                        socketio.emit('token', {'token': token_text}, room=sid)
                        # Small sleep to prevent overwhelming the socket
                        time.sleep(0.01)

                    current_time = time.time()

                if sid:
                    socketio.emit('complete', room=sid)
                
                if VERBOSE:
                    logger.debug(f"Generated response length: {len(generated_text)}")
                    logger.debug(f"Response preview: {generated_text[:200]}...")

                return generated_text

            finally:
                del generator

        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            logger.error(error_msg)
            if sid:
                socketio.emit('error', {'error': error_msg}, room=sid)
            return error_msg

    def _get_context(self, query: str) -> str:
        """Get relevant context from vector store with enhanced logging."""
        try:
            if VERBOSE:
                logger.debug(f"Searching for context with query: '{query}'")
                collection_info = self.vectorstore._collection.count()
                logger.debug(f"Total documents in collection: {collection_info}")

            # Try direct similarity search first
            documents = self.vectorstore.similarity_search_with_relevance_scores(
                query,
                k=3
            )
            
            if VERBOSE:
                logger.debug(f"Found {len(documents)} documents")
                for doc, score in documents:
                    logger.debug(f"Document score: {score}")
                    logger.debug(f"Document source: {doc.metadata.get('source', 'Unknown')}")
                    logger.debug(f"Content preview: {doc.page_content[:100]}...")

            if not documents:
                logger.warning("No documents found in similarity search")
                return "No relevant context found."
            
            # Format context with relevance information
            contexts = []
            for doc, score in documents:
                if score > 0.3:  # Filtrar por relevancia
                    source = os.path.basename(doc.metadata.get('source', 'Unknown source'))
                    context_text = (
                        f"[Relevance: {score:.2f}] From {source}:\n"
                        f"{doc.page_content.strip()}"
                    )
                    contexts.append(context_text)
                    
                    if VERBOSE:
                        logger.debug(f"Added context from {source} with score {score:.2f}")

            if not contexts:
                logger.warning("No contexts passed relevance threshold")
                return "No sufficiently relevant context found."

            final_context = "\n\n".join(contexts)
            
            if VERBOSE:
                logger.debug(f"Final context length: {len(final_context)} characters")
                logger.debug(f"Context preview: {final_context[:200]}...")
                
            return final_context
                
        except Exception as e:
            logger.error(f"Error retrieving context: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(f"Full error traceback:")
                logger.debug(traceback.format_exc())
            return "Error retrieving context from the knowledge base."

    def generate_response(self, question: str, industry: str = None, role: str = None, sid: str = None) -> str:
        """Generate response using local model and retrieved context."""
        try:
            if VERBOSE:
                logger.debug(f"Generating response for question: {question}")

            # Get context from vector store
            context = self._get_context(question)
            
            if VERBOSE:
                logger.debug("Retrieved context:")
                logger.debug(context)
            
            if sid:
                socketio.emit('context', {'context': context}, room=sid)

            # Format prompt with explicit instructions about context usage
            prompt = (
                "You are an AI assistant that provides accurate answers based on the given context. "
                "Always reference and use the provided context in your response. "
                "If the context doesn't contain enough information, acknowledge this explicitly.\n\n"
                f"Context:\n{context}\n\n"
                f"Question: {question}\n\n"
                "Answer (using the above context): "
            )

            # Generate response using local model
            input_tokens = self.tokenizer.encode(prompt)
            params = og.GeneratorParams(self.model)
            params.set_search_options(**self.search_options)
            params.input_ids = input_tokens
            
            generator = og.Generator(self.model, params)
            generated_text = ""

            try:
                while not generator.is_done():
                    generator.compute_logits()
                    generator.generate_next_token()
                    
                    new_token = generator.get_next_tokens()[0]
                    token_text = self.tokenizer_stream.decode(new_token)
                    generated_text += token_text
                    
                    if sid:
                        socketio.emit('token', {'token': token_text}, room=sid)
                
                if sid:
                    socketio.emit('complete', room=sid)
                
                if VERBOSE:
                    logger.debug(f"Generated response length: {len(generated_text)}")
                    logger.debug(f"Response preview: {generated_text[:200]}...")
                
                return generated_text

            finally:
                del generator

        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            logger.error(error_msg)
            if sid:
                socketio.emit('error', {'error': error_msg}, room=sid)
            return error_msg

# Global RAG assistant instance
rag_assistant = RAGAssistant(MODEL_PATH) if USE_LOCAL_LLM else None

# Sample data
industries = [
    {
        "manufacturing": ["maintenance engineer", "shift supervisor"],
        "retail": ["store manager", "buyer"],
        "hypermarket": ["store manager", "shopper", "maintenance worker"]
    }
]

# WebSocket routes
@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection with error handling."""
    try:
        logger.info("Client connected")
        if VERBOSE:
            logger.debug(f"Connection details: {request.sid}")
        emit('connected', {'status': 'connected'})
    except Exception as e:
        logger.error(f"Error handling connection: {str(e)}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection with error handling."""
    try:
        logger.info("Client disconnected")
        if VERBOSE:
            logger.debug(f"Disconnection details: {request.sid}")
    except Exception as e:
        logger.error(f"Error handling disconnection: {str(e)}")

@socketio.on('question')
def handle_question(data):
    """Handle incoming questions via WebSocket"""
    logger.info("Received question request")
    
    question = data.get('question', '').strip()
    if not question:
        logger.warning("Empty question received")
        emit('error', {'error': 'Question cannot be empty'})
        return

    logger.info("Processing question: %s", question)
    if VERBOSE:
        logger.debug("Full question data: %s", data)
    
    sid = request.sid
    
    try:
        thread = threading.Thread(
            target=rag_assistant.generate_response,
            args=(question, sid)
        )
        thread.daemon = True
        thread.start()
        if VERBOSE:
            logger.debug("Started response generation thread")
    except Exception as e:
        logger.error("Error starting response thread: %s", str(e))
        emit('error', {'error': 'Failed to process question'})

# WebSocket process_question handler
@socketio.on('process_question')
def handle_process_question(data):
    """Handle process_question via WebSocket with streaming response and special cases"""
    request_id = str(uuid.uuid4())
    try:
        logger.info(f"[{request_id}] Processing question request")
        
        # Extract data
        question = data.get('question')
        industry = data.get('industry')
        role = data.get('role')
        session_id = request.sid  # Get the Socket.IO session ID
        
        if VERBOSE:
            logger.debug(f"[{request_id}] Question: {question}")
            logger.debug(f"[{request_id}] Industry: {industry}")
            logger.debug(f"[{request_id}] Role: {role}")
            logger.debug(f"[{request_id}] Session ID: {session_id}")
        
        if not all([question, industry, role]):
            logger.warning(f"[{request_id}] Missing required parameters")
            emit('error', {'error': 'Question, industry, and role parameters are required'})
            return
        
        # Check for greetings or special cases using simple pattern matching
        greeting_patterns = [
            'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon',
            'good evening', 'hola', 'help', 'what can you do'
        ]

        if any(pattern in question.lower() for pattern in greeting_patterns):
            logger.info(f"[{request_id}] Detected greeting/help request, using chat_hello")
            response = llm.chat_hello(industry, role, question, session_id)  
            emit('result', {'result': response})
            emit('complete')
            return

        if question.lower() == "$version":
            logger.info(f"[{request_id}] Version request, sending API version")
            emit('result', {'result': API_VERSION})
            emit('complete')
            return
        
        # Step 1: Classify the question
        logger.info(f"[{request_id}] Classifying question")
        category = llm.classify_question(question, industry, role)
        logger.info(f"[{request_id}] Question classified as: {category}")
        emit('classification', {'category': category})
        
        # Handle unknown category
        if category == "unknown":
            logger.info(f"[{request_id}] Unknown category, using chat_hello for general response")
            response = llm.chat_hello(industry, role, question, session_id)  
            emit('result', {'result': response})
            emit('complete')
            return

        # Handle greetings category
        if category == "greetings":
            logger.info(f"[{request_id}] greetings category, using chat_hello for general response")
            response = llm.chat_hello(industry, role, question, session_id)  
            emit('result', {'result': response})
            emit('complete')
            return
        
        # Handle normal categories
        elif category == 'documentation':
            if USE_LOCAL_LLM:
                if not CHROMA_AVAILABLE:
                    logger.warning(f"[{request_id}] ChromaDB not available")
                    emit('error', {'error': 'RAG functionality is currently unavailable'})
                    return
                    
                logger.info(f"[{request_id}] Using local RAG Assistant")
                thread = threading.Thread(
                    target=rag_assistant.generate_response_slm,
                    args=(question, industry, role, request.sid)
                )
                thread.daemon = True
                thread.start()
            else:
                logger.info(f"[{request_id}] Using remote Azure OpenAI")
                response = llm.chat_llm(question, industry, role)
                emit('result', {'result': response})
                emit('complete')
        
        elif category == 'data':
            logger.info(f"[{request_id}] Processing data query")
            influx_query = llm.convert_question_query_influx(question, industry, role)
            emit('query', {'query': influx_query})
            
            query_result = influx_handler.execute_query_and_return_data(influx_query)
            
            html_formatted = llm.format_results_to_html(query_result, "influx", industry, role)
            
            recommendations = llm.generate_recommendations(
                question, influx_query, query_result, industry, role
            )
            emit('recommendations', {'recommendations': recommendations})
            emit('result', {'result': html_formatted})
            emit('complete')
        
        elif category == 'relational':
            logger.info(f"[{request_id}] Processing relational query")
            sql_query = llm.convert_question_query_sql(question, industry, role)
            emit('query', {'query': sql_query})
            
            query_result = sql_handler.test_data(sql_query)

            html_formatted = llm.format_results_to_html(query_result, "sql", industry, role)
            
            recommendations = llm.generate_recommendations(
                question, sql_query, query_result, industry, role
            )
            emit('recommendations', {'recommendations': recommendations})
            emit('result', {'result': html_formatted})
            emit('complete')
        
    except Exception as e:
        logger.error(f"[{request_id}] Error in process_question: {str(e)}")
        if VERBOSE:
            import traceback
            logger.debug(f"[{request_id}] Full error traceback:")
            logger.debug(traceback.format_exc())
        emit('error', {'error': str(e)})

# REST API routes
@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@ns.route('/api/get_industries' , methods=['GET'])
class Industries(Resource):
    def get(self):
        logger.info("Starting /api/get_industries")
        """Retrieve all available industries"""
        return industries, 200

# Define the expected input model
industry_model = ns.model('Industry', {
    'industry': fields.String(required=True, description='Specify the industry to retrieve roles')
})

@ns.route('/api/get_roles' , methods=['POST'])
class Roles(Resource):
    @api.doc(responses={200: 'Success', 400: 'Missing required parameters', 404: 'Invalid industry provided'})
    @api.expect(industry_model)
    def post(self):
        print("/api/roles")
        """Fetch roles based on provided industry"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        data = request.get_json(force=True)
        print(data)
        industry = data.get('industry')
        if not industry:
            api.abort(400, 'Industry parameter is required')

        print(industry)
        
        # Flatten the industries list to a dictionary for easier lookup
        industries_dict = {k: v for d in industries for k, v in d.items()}

        if industry not in industries_dict:
            api.abort(404, 'Invalid industry provided')

        print(industries_dict[industry])
        
        return jsonify({'industry': industry, 'roles': industries_dict[industry]})    

# Possible statuses
configured_statuses = ["Pending approval", "Not yet deployed", "Approved"]
deployed_statuses = ["Not yet deployed", "Pending approval", "Error", "Running successfully"]

@ns.route('/api/get_applications' , methods=['GET'])
class Applications(Resource):
    def get(self):
        """Simulate application data as shown in the UI table"""
        applications = [
            {
                "application_name": "FRI (1)",
                "line": "FRI1",
                "configured_version": "1.0.1",
                "deployed_version": "1.0.1",
                "configured_status": random.choice(configured_statuses),
                "deployed_status": random.choice(deployed_statuses)
            },
            {
                "application_name": "CSAD",
                "line": "FRI1",
                "configured_version": "1.0.2",
                "deployed_version": "1.0.2",
                "configured_status": random.choice(configured_statuses),
                "deployed_status": random.choice(deployed_statuses)
            },
            {
                "application_name": "FRI2 (3)",
                "line": "FRI2",
                "configured_version": "1.0.3",
                "deployed_version": "1.0.3",
                "configured_status": random.choice(configured_statuses),
                "deployed_status": random.choice(deployed_statuses)
            },
            {
                "application_name": "HotMelt",
                "line": "FRI2",
                "configured_version": "1.0.2",
                "deployed_version": "1.0.2",
                "configured_status": random.choice(configured_statuses),
                "deployed_status": random.choice(deployed_statuses)
            },
            {
                "application_name": "SheetLength",
                "line": "FRI2",
                "configured_version": "1.0.3",
                "deployed_version": "1.0.3",
                "configured_status": random.choice(configured_statuses),
                "deployed_status": random.choice(deployed_statuses)
            }
        ]
        return jsonify(applications)
    
def mask_sensitive_data(value: str, visible_chars: int = 3) -> str:
    """
    Mask sensitive data showing only the first few characters.
    
    Args:
        value (str): The sensitive value to mask
        visible_chars (int): Number of characters to show at the start
        
    Returns:
        str: Masked string with only first few characters visible
    """
    if not value:
        return ''
        
    value = str(value)  # Convert to string in case it's not
    if len(value) <= visible_chars:
        return value
        
    return value[:visible_chars] + '*' * (len(value) - visible_chars)

environment_model = api.model('Environment', {
    'api_version': fields.String(description='API version'),
    'variables': fields.Raw(description='Environment variables')
})

@ns.route('/api/environment')
class Environment(Resource):
    @api.doc(responses={200: 'Success', 500: 'Server Error'})
    @api.marshal_with(environment_model)
    def get(self):
        """Retrieve all environment variables used in the application"""
        try:
            # Variables from app.py
            env_vars = {
                'VERBOSE': os.getenv("VERBOSE"),
                'USE_LOCAL_LLM': os.getenv('USE_LOCAL_LLM'),
                'MODEL_PATH': os.getenv('MODEL_PATH'),
                'DOCUMENTS_PATH': os.getenv('DOCUMENTS_PATH'),
                'PORT': os.getenv('PORT'),
                'DEBUG': os.getenv('DEBUG'),
                'CHROMA_PERSIST_DIR': os.getenv('CHROMA_PERSIST_DIR'),
                'CHROMA_COLLECTION': os.getenv('CHROMA_COLLECTION'),

                # Variables from indexer.py
                'DOCUMENTS_PATH': os.getenv('DOCUMENTS_PATH'),

                # Variables from InfluxDBHandler.py
                'INFLUXDB_URL': os.getenv("INFLUXDB_URL"),
                'INFLUXDB_BUCKET': os.getenv("INFLUXDB_BUCKET"),
                'INFLUXDB_TOKEN': mask_sensitive_data(os.getenv("INFLUXDB_TOKEN"),3),  
                'INFLUXDB_ORG': os.getenv("INFLUXDB_ORG"),

                # Variables from llm.py  
                'AZURE_OPENAI_API_KEY': mask_sensitive_data(os.getenv("AZURE_OPENAI_API_KEY"),3),  
                'CHATGPT_MODEL': os.getenv("CHATGPT_MODEL"),
                'AZURE_OPENAI_ENDPOINT': os.getenv("AZURE_OPENAI_ENDPOINT"),
                'OPENAI_API_VERSION': os.getenv("OPENAI_API_VERSION"),

                # Variables from SqlDBHandler.py
                'SQL_SERVER': os.getenv('SQL_SERVER'),
                'SQL_DATABASE': os.getenv('SQL_DATABASE'),
                'SQL_USERNAME': os.getenv('SQL_USERNAME'),
                'SQL_PASSWORD': mask_sensitive_data(os.getenv("SQL_PASSWORD"),3),  

                # Variables from speechToText.py
                'WHISPER_MODEL_PATH': os.getenv('WHISPER_MODEL_PATH'),
                'AZURE_AI_SPEECH_KEY': mask_sensitive_data(os.getenv("AZURE_AI_SPEECH_KEY"),3),  
                'AZURE_AI_SPEECH_REGION': os.getenv('AZURE_AI_SPEECH_REGION'),
            }

            return {
                'api_version': API_VERSION,
                'variables': env_vars
            }

        except Exception as e:
            logger.error(f"Error retrieving environment variables: {str(e)}")
            api.abort(500, f"Error retrieving environment variables: {str(e)}")

# Define the expected input model
alert_model = ns.model('Alert', {
    'industry': fields.String(required=True, description='Specify the industry to retrieve alerts'),
    'role': fields.String(required=True, description='Specify the role to retrieve alerts')
})

@ns.route('/api/get_proactive_alerts', methods=['POST'])
class ProactiveAlerts(Resource):
    @api.doc(responses={200: 'Success', 400: 'Missing required parameters', 404: 'Invalid industry or role provided'})
    @api.expect(alert_model)
    def post(self):
        print("/api/get_proactive_alerts")
        """Fetch proactive alerts based on provided industry and role"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        data = request.get_json(force=True)
        print(data)
        industry = data.get('industry')
        role = data.get('role')
        if not industry or not role:
            api.abort(400, 'Industry and role parameters are required')

        print(f"Industry: {industry}, Role: {role}")

        if industry not in industries or role not in industries[industry]:
            api.abort(404, 'Invalid industry or role provided')

        print(f"Alerts for {industry} - {role}")
        
        # Example alerts data
        alerts = [
            {'alert_id': 1, 'message': 'System update required', 'severity': 'High'},
            {'alert_id': 2, 'message': 'New policy changes', 'severity': 'Medium'},
            {'alert_id': 3, 'message': 'Security alert', 'severity': 'Critical'}
        ]
        
        return jsonify({'industry': industry, 'role': role, 'alerts': alerts})


# Define the expected input model
question_model = ns.model('Question', {
    'question': fields.String(required=True, description='The question to classify'),
    'industry': fields.String(required=True, description='The industry context'),
    'role': fields.String(required=True, description='The role context')
})


@ns.route('/api/classify_question', methods=['POST'])
class ClassifyQuestion(Resource):
    @api.doc(params={'question': 'Specify the question to classify', 'industry': 'Specify the industry', 'role': 'Specify the role'})
    @api.expect(question_model)
    def post(self):
        """Classify the provided question"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        data = request.get_json(force=True)
        question = data.get('question')
        industry = data.get('industry')
        role = data.get('role')
        
        if not question or not industry or not role:
            raise BadRequest('Question, industry, and role parameters are required')
        
        category = llm.classify_question(question, industry, role)

        print(jsonify({'question': question, 'category': category, 'industry': industry, 'role': role}))

        return jsonify([{'question': question, 'category': category, 'industry': industry, 'role': role}])
        
@ns.route('/api/convert_question_query_influx')
class ConvertQuestionQueryInflux(Resource):
    @api.doc(responses={200: 'Success', 400: 'Question parameter is required'})
    @api.expect(question_model)
    def post(self):
        """Converts question in query influxDb"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        data = request.get_json(force=True)
        question = data.get('question')
        industry = data.get('industry')
        role = data.get('role')
        
        if not question or not industry or not role:
            return jsonify({'error': 'Question, industry, and role parameters are required'}), 400
        
        response = llm.convert_question_query_influx(question, industry, role)
        return jsonify({'question': question, 'response': response, 'industry': industry, 'role': role})
    
question_model = ns.model('Question', {
    'question': fields.String(required=True, description='The question to convert to SQL'),
    'industry': fields.String(required=True, description='The industry context'),
    'role': fields.String(required=True, description='The role context')
})
    
@ns.route('/api/convert_question_query_sql')
class ConvertQuestionQuerySQL(Resource):
    @api.doc(responses={200: 'Success', 400: 'Missing required parameters'})
    @api.expect(question_model)
    def post(self):
        """Converts question to SQL query"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        #print(request)

        data = request.get_json(force=True)
        question = data.get('question')
        industry = data.get('industry')
        role = data.get('role')

        print(question)
        print(industry)
        print(role)
        
        if not question or not industry or not role:
            return jsonify({'error': 'Question, industry, and role parameters are required'}), 400
        
        try:
            response = llm.convert_question_query_sql(question, industry, role)
            return jsonify({
                'question': question,
                'sql_query': response,
                'industry': industry,
                'role': role
            })
        except Exception as e:
            # Log the error for debugging
            print(f"Error in convert_question_query_sql: {str(e)}")
            return jsonify({'error': 'An error occurred while processing your request'}), 500

# Define the expected input model
query_model = ns.model('Query', {
    'query': fields.String(required=True, description='The InfluxDB query to execute')
})

@ns.route('/api/execute_influx_query')
class ExecuteQuery(Resource):
    @api.doc(responses={200: 'Success', 400: 'Query parameter is required'})
    @api.expect(query_model)
    def post(self):
        """Execute an InfluxDB query and return the data"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        data = request.get_json(force=True)
        query = data.get('query')
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        result = influx_handler.execute_query_and_return_data(query)

        print(result)

        return jsonify({'query': query, 'result': result})
    
@ns.route('/api/execute_sql_query')
class ExecuteQuery(Resource):
    @api.doc(responses={200: 'Success', 400: 'Query parameter is required'})
    @api.expect(query_model)
    def post(self):
        """Execute an SQL query and return the data"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        data = request.get_json(force=True)
        query = data.get('query')
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        result = SqlDBHandler.execute_query_and_return_data(query)
        
        print(result)

        return jsonify({'query': query, 'result': result})
    
# Define the expected input model
recommendation_model = ns.model('Recommendation', {
    'question': fields.String(required=True, description='The question to classify'),
    'response': fields.String(required=True, description='The raw response data'),
    'result': fields.String(required=True, description='The processed result data')
})

@ns.route('/api/generate-recommendations')
class GenerateRecommendations(Resource):
    @api.doc(responses={200: 'Success', 400: 'Missing required parameters'})
    @api.expect(recommendation_model)
    def post(self):
        """Generate recommendations based on question, response, and result"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        data = request.get_json(force=True)
        question = data.get('question')
        response = data.get('response')
        result = data.get('result')
        if not question or not response or not result:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        recommendations = llm.generate_recommendations(question, response, result)
        return jsonify({'question': question, 'response': response, 'result': result, 'recommendations': recommendations})

#api.add_resource(GenerateRecommendations, '/generate-recommendations')

integrated_query_model = ns.model('IntegratedQuery', {
    'question': fields.String(required=True, description='The question to process'),
    'industry': fields.String(required=True, description='The industry context'),
    'role': fields.String(required=True, description='The role context')
})

@ns.route('/api/stt', methods=['POST'])
class SttDecode(Resource):
    @api.doc(responses={200: 'Success', 400: 'Missing required parameters', 500: 'Server error'})
    @api.expect(api.parser().add_argument('audio_data', type='FileStorage', location='files', required=True, help='Audio file to be processed')
                            .add_argument('model', type=str, location='form', required=False, help='Model to use for speech recognition'))
    def post(self):
        """Process speech file and get text response"""
        print("****Process speech file and get text response***\n")    
        audio_file_path = None
        try:
            # Get the audio file and model selection from the POST request
            audio_file = request.files['audio_data']
            model = request.form.get('model', 'azure')  # Default to Azure if not specified

            audio_file_size = len(audio_file.read())
            audio_file.seek(0)  # Reset file pointer to the beginning after reading
            print(f"Received audio file size: {audio_file_size} bytes, model: {model}")

            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            
            audio_file_path = f'/tmp/uploaded_audio_{timestamp}.wav'
            if os.name == 'nt':  # Check if the OS is Windows
                audio_file_path = f'uploaded_audio_{timestamp}.wav'
    
            print(f"Saving audio file to: {audio_file_path}")
            audio_file.save(audio_file_path)
            audio_file.close()

            print(f"Recognizing audio with model: {model}")
            if model == 'whisper':
                result = stt.recognize_with_whisper(audio_file_path)
            else:
                result = stt.recognize_with_azure(audio_file_path)
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                print(f"Azure recognized: {result.text}")
                return jsonify({'text': result.text})
            elif result.reason == speechsdk.ResultReason.NoMatch:
                print(f"No speech could be recognized: {result.no_match_details}")
                return jsonify({'error': 'No speech could be recognized'}), 400
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                print(f"Speech Recognition canceled: {cancellation_details.reason}")
                if cancellation_details.reason == speechsdk.CancellationReason.Error:
                    print(f"Error details: {cancellation_details.error_details}")
                    print("Did you set the speech resource key and region values?")
                return jsonify({'error': 'Speech recognition canceled'}), 400
            else:
                print(f"Speech re: {result.reason}")
                return jsonify({'error': 'Speech recognition failed'}), 400
        
        except Exception as e:
            print(f"Error in recognize function: {str(e)}")
            return jsonify({'error': f'Error processing the request: {str(e)}'}), 400
        finally:
            if audio_file_path and os.path.exists(audio_file_path):
                os.remove(audio_file_path)

def initialize_and_validate_chroma() -> bool:
    """
    Initialize ChromaDB, create index if needed, and validate document count.
    Returns True if the index exists and contains documents.
    """
    try:
        from indexer import DocumentIndexer
        
        logger.info("Starting ChromaDB initialization and validation...")
        
        # Initialize DocumentIndexer
        indexer = DocumentIndexer()
        
        if VERBOSE:
            logger.debug("DocumentIndexer initialized successfully")
            
        # Check if collection exists and has documents
        try:
            count = indexer.collection.count()
            
            if count == 0:
                logger.warning(f"ChromaDB collection '{indexer.collection_name}' exists but contains no documents")
                
                if not DOCUMENTS_PATH:
                    logger.error("DOCUMENTS_PATH environment variable is not set")
                    return False
                
                if not os.path.exists(DOCUMENTS_PATH):
                    logger.error(f"Documents directory does not exist: {DOCUMENTS_PATH}")
                    return False
                
                logger.info(f"Starting document indexing from {DOCUMENTS_PATH}")
                
                # Index documents
                try:
                    indexer.index_documents(DOCUMENTS_PATH)
                    
                    # Verify documents were indexed
                    new_count = indexer.collection.count()
                    if new_count > 0:
                        logger.info(f"Successfully indexed {new_count} documents")
                        if VERBOSE:
                            try:
                                # Get a sample using a simple query
                                sample_query = "Provide a sample of the documentation"
                                results = indexer.collection.query(
                                    query_texts=[sample_query],
                                    n_results=min(5, new_count),
                                    include=['documents', 'metadatas']
                                )
                                logger.debug("Sample of indexed documents:")
                                if results['documents'] and results['documents'][0]:
                                    logger.debug(f"- Number of documents retrieved: {len(results['documents'][0])}")
                                    if results['metadatas'] and results['metadatas'][0]:
                                        sources = [meta.get('source', 'Unknown') for meta in results['metadatas'][0]]
                                        logger.debug(f"- Document sources: {sources}")
                            except Exception as e:
                                logger.debug(f"Sample retrieval skipped: {str(e)}")
                        return True
                    else:
                        logger.error("No documents were indexed")
                        return False
                        
                except Exception as e:
                    logger.error(f"Error during document indexing: {str(e)}")
                    return False
            else:
                logger.info(f"ChromaDB collection '{indexer.collection_name}' contains {count} documents")
                if VERBOSE:
                    try:
                        # Get a sample using a simple query
                        sample_query = "Provide a sample of the documentation"
                        results = indexer.collection.query(
                            query_texts=[sample_query],
                            n_results=min(5, count),
                            include=['documents', 'metadatas']
                        )
                        logger.debug("Sample of existing documents:")
                        if results['documents'] and results['documents'][0]:
                            logger.debug(f"- Number of documents retrieved: {len(results['documents'][0])}")
                            if results['metadatas'] and results['metadatas'][0]:
                                sources = [meta.get('source', 'Unknown') for meta in results['metadatas'][0]]
                                logger.debug(f"- Document sources: {sources}")
                    except Exception as e:
                        logger.debug(f"Sample retrieval skipped: {str(e)}")
                return True

        except Exception as e:
            logger.error(f"Error checking ChromaDB collection: {str(e)}")
            return False

    except Exception as e:
        logger.error(f"Error initializing ChromaDB: {str(e)}")
        return False

def verify_chroma_setup():
    """Verify ChromaDB setup and log detailed state."""
    try:
        from indexer import DocumentIndexer
        
        logger.info("Starting ChromaDB verification...")
        indexer = DocumentIndexer()
        
        # Get collection info
        collection_info = indexer.get_collection_info()
        logger.info(f"Collection name: {collection_info.get('collection_name')}")
        logger.info(f"Status: {collection_info.get('status')}")
        logger.info(f"Indexed files: {collection_info.get('indexed_files', 0)}")
        
        # Verify collection functionality
        return indexer.verify_collection()
        
    except Exception as e:
        logger.error(f"ChromaDB verification failed: {str(e)}")
        if VERBOSE:
            import traceback
            logger.debug(traceback.format_exc())
        return False
    
def initialize_chroma() -> bool:
    """
    Initialize ChromaDB with a clean state:
    1. Get indexer instance
    2. Reinitialize to clear existing data
    3. Index all documents
    
    Returns:
        bool: True if initialization successful, False otherwise
    """
    try:
        logger.info("Starting ChromaDB clean initialization...")
        
        # Get indexer instance
        indexer = DocumentIndexer()
        
        # Reinitialize ChromaDB
        if not indexer.reinitialize():
            logger.error("Failed to reinitialize ChromaDB")
            return False
            
        # Verify documents path
        if not DOCUMENTS_PATH:
            logger.error("DOCUMENTS_PATH environment variable not set")
            return False
            
        if not os.path.exists(DOCUMENTS_PATH):
            logger.error(f"Documents directory does not exist: {DOCUMENTS_PATH}")
            return False
        
        # Index documents
        logger.info(f"Starting document indexing from: {DOCUMENTS_PATH}")
        if not indexer.index_documents(DOCUMENTS_PATH):
            logger.error("Failed to index documents")
            return False
            
        # Verify initialization
        info = indexer.get_collection_info()
        if not info.get("has_documents"):
            logger.error("No documents were indexed")
            return False
            
        logger.info(f"Successfully initialized with {info.get('total_documents', 0)} documents")
        return True
        
    except Exception as e:
        logger.error(f"Error during ChromaDB initialization: {str(e)}")
        if VERBOSE:
            import traceback
            logger.debug(traceback.format_exc())
        return False

def main():
    try:
        global rag_assistant
        global CHROMA_AVAILABLE
        
        logger.info("Starting server with configuration:")
        logger.info(f"USE_LOCAL_LLM={USE_LOCAL_LLM}")
        logger.info(f"Port={PORT}")
        logger.info(f"Debug={DEBUG}")
        
        if USE_LOCAL_LLM:
            logger.info("Initializing ChromaDB...")
            CHROMA_AVAILABLE = initialize_chroma()
            
            if not CHROMA_AVAILABLE:
                logger.warning("ChromaDB initialization failed. RAG functionality will be disabled.")
                if REQUIRE_CHROMA_INDEX:
                    cleanup_temp_dirs()  # Limpiar antes de salir
                    raise RuntimeError("ChromaDB initialization failed and REQUIRE_CHROMA_INDEX is set to true")
            else:
                logger.info("ChromaDB initialization successful")
                logger.info(f"Initializing RAG assistant with model path: {MODEL_PATH}")
                rag_assistant = RAGAssistant(MODEL_PATH)
        
        if VERBOSE:
            logger.debug("Additional configuration details:")
            logger.debug(f"Socket.IO mode: {socketio.async_mode}")
            logger.debug(f"API version: {api.version}")
            logger.debug(f"ChromaDB available: {CHROMA_AVAILABLE}")
            
        socketio.run(app, 
                    host='0.0.0.0',
                    port=PORT,
                    debug=DEBUG,
                    allow_unsafe_werkzeug=True)
        
    except Exception as e:
        logger.critical(f"Application failed to start: {str(e)}")
        if VERBOSE:
            import traceback
            logger.debug(traceback.format_exc())
        cleanup_temp_dirs()  
        raise
    finally:
        cleanup_temp_dirs()  


if __name__ == '__main__':
    main()
