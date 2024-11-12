from flask import Flask, request, jsonify, render_template
from flask_restx import Api, Resource, Namespace, fields
from flask_socketio import SocketIO, emit
from werkzeug.exceptions import BadRequest
from flask_cors import CORS
import random
import logging
import threading
import os
from datetime import datetime
import azure.cognitiveservices.speech as speechsdk

# Import custom modules
from llm import LLM
from InfluxDBHandler import InfluxDBHandler
from SqlDBHandler import SqlDBHandler
from SpeechToText import STT
from indexer import DocumentIndexer
MODEL_PATH = os.getenv('MODEL_PATH', './cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4')

# Conditionally import the appropriate onnxruntime package
if MODEL_PATH.startswith('cuda'):
    import onnxruntime_genai_cuda as og
    print("Using CUDA-enabled onnxruntime")
else:
    import onnxruntime_genai as og
    print("Using CPU onnxruntime")

USE_LOCAL_LLM = os.getenv('USE_LOCAL_LLM', 'false').lower() == 'true'
MODEL_PATH = os.getenv('MODEL_PATH', './cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4')

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')

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

logger = logging.getLogger(__name__)

# RAG Assistant Class
class RAGAssistant:
    def __init__(self, model_path: str):
        """Initialize RAG components: document indexer and language model."""
        self.model_path = model_path
        if not os.path.exists(self.model_path):
            raise ValueError(f"Model path does not exist: {self.model_path}")

        # Initialize document indexer
        self.indexer = DocumentIndexer()
        
        # Initialize language model and tokenizer
        self.model = og.Model(self.model_path)
        self.tokenizer = og.Tokenizer(self.model)
        self.tokenizer_stream = self.tokenizer.create_stream()

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

    def generate_response(self, question: str, industry: str, role: str, sid: str = None) -> str:
        """
        Generate a response using RAG with optional Socket.IO streaming.
        Returns the complete response if sid is None, otherwise streams via websocket.
        """
        try:
            context = self._retrieve_context(question)
            if sid:
                socketio.emit('context', {'context': context}, room=sid)

            prompt = self.rag_template.format(
                context=context,
                question=question
            )

            input_tokens = self.tokenizer.encode(prompt)
            params = og.GeneratorParams(self.model)
            params.set_search_options(**self.search_options)
            params.input_ids = input_tokens
            generator = og.Generator(self.model, params)

            generated_text = ""
            while not generator.is_done():
                generator.compute_logits()
                generator.generate_next_token()
                
                new_token = generator.get_next_tokens()[0]
                token_text = self.tokenizer_stream.decode(new_token)
                generated_text += token_text
                
                if sid:
                    socketio.emit('token', {'token': token_text}, room=sid)
                    socketio.sleep(0)

            if sid:
                socketio.emit('complete', room=sid)
            
            del generator
            return generated_text

        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            logging.error(error_msg)
            if sid:
                socketio.emit('error', {'error': error_msg}, room=sid)
            return error_msg
        
    def generate_response_general(self, question: str, sid: str) -> None:
        """Generate a response using RAG with Socket.IO streaming."""
        try:
            context = self._retrieve_context(question)
            socketio.emit('context', {'context': context}, room=sid)

            prompt = self.rag_template.format(
                context=context,
                question=question
            )

            input_tokens = self.tokenizer.encode(prompt)
            params = og.GeneratorParams(self.model)
            params.set_search_options(**self.search_options)
            params.input_ids = input_tokens
            generator = og.Generator(self.model, params)

            generated_text = ""
            while not generator.is_done():
                generator.compute_logits()
                generator.generate_next_token()
                
                new_token = generator.get_next_tokens()[0]
                token_text = self.tokenizer_stream.decode(new_token)
                generated_text += token_text
                
                socketio.emit('token', {'token': token_text}, room=sid)
                socketio.sleep(0)

            socketio.emit('complete', room=sid)
            del generator

        except Exception as e:
            logging.error(f"Error generating response: {str(e)}")
            socketio.emit('error', {'error': str(e)}, room=sid)

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
    """Handle WebSocket connection"""
    logging.info("Client connected")
    emit('connected', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    logging.info("Client disconnected")

@socketio.on('question')
def handle_question(data):
    """Handle incoming questions via WebSocket"""
    question = data.get('question', '').strip()
    if not question:
        emit('error', {'error': 'Question cannot be empty'})
        return

    logging.info(f"Received question: {question}")
    sid = request.sid
    
    thread = threading.Thread(
        target=rag_assistant.generate_response,
        args=(question, sid)
    )
    thread.daemon = True
    thread.start()

# WebSocket process_question handler
@socketio.on('process_question')
def handle_process_question(data):
    """Handle process_question via WebSocket with streaming response"""
    try:
        question = data.get('question')
        industry = data.get('industry')
        role = data.get('role')
        
        if not all([question, industry, role]):
            emit('error', {'error': 'Question, industry, and role parameters are required'})
            return
        
        # Step 1: Classify the question
        category = llm.classify_question(question, industry, role)
        emit('classification', {'category': category})
        
        if category == 'documentation':
            if USE_LOCAL_LLM:
                # Use local RAG Assistant
                thread = threading.Thread(
                    target=rag_assistant.generate_response,
                    args=(question, industry, role, request.sid)
                )
                thread.daemon = True
                thread.start()
            else:
                # Use remote LLM
                response = llm.chat_llm(question, industry, role)
                emit('result', {'result': response})
                emit('complete')
        else:
            # Handle data or relational queries as before
            if category == 'data':
                influx_query = llm.convert_question_query_influx(question, industry, role)
                emit('query', {'query': influx_query})
                query_result = influx_handler.execute_query_and_return_data(influx_query)
                emit('result', {'result': query_result})
                recommendations = llm.generate_recommendations(question, influx_query, query_result, industry, role)
                emit('recommendations', {'recommendations': recommendations})
            
            elif category == 'relational':
                sql_query = llm.convert_question_query_sql(question, industry, role)
                emit('query', {'query': sql_query})
                query_result = sql_handler.test_data(sql_query)
                emit('result', {'result': query_result})
                recommendations = llm.generate_recommendations(question, sql_query, query_result, industry, role)
                emit('recommendations', {'recommendations': recommendations})
            
            emit('complete')
        
    except Exception as e:
        logging.error(f"Error in process_question: {str(e)}")
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
        
        #result = influx_handler.execute_query_and_return_data(query)
        #TO DO 
        result = [
        {
            "ProductID": 1,
            "ProductName": "Bananas",
            "Category": "Fruits",
            "Description": "Fresh bananas",
            "Price": 0.99,
            "SupplierID": 1,
            "DateAdded": "2024-09-22"
        },
        {
            "ProductID": 2,
            "ProductName": "Apples",
            "Category": "Fruits",
            "Description": "Red apples",
            "Price": 1.49,
            "SupplierID": 2,
            "DateAdded": "2024-09-22"
        }]

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

@ns.route('/api/process_question')
class ProcessQuestion(Resource):
    @api.doc(responses={200: 'Success', 400: 'Missing required parameters', 500: 'Server error'})
    @api.expect(api.model('IntegratedQuery', {
        'question': fields.String(required=True, description='The question to process'),
        'industry': fields.String(required=True, description='The industry context'),
        'role': fields.String(required=True, description='The role context')
    }))
    def post(self):
        """Process question based on classification and generate appropriate response"""
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        try:
            data = request.get_json(force=True)
            question = data.get('question')
            industry = data.get('industry')
            role = data.get('role')
            
            if not all([question, industry, role]):
                return jsonify({'error': 'Question, industry, and role parameters are required'}), 400
            
            # Step 1: Classify the question
            category = llm.classify_question(question, industry, role)
            
            if category == 'documentation':
                if USE_LOCAL_LLM:
                    # Use local RAG Assistant
                    response = rag_assistant.generate_response(question, industry, role)
                    return jsonify({
                        'question': question,
                        'category': category,
                        'response': response
                    })
                else:
                    # Use remote LLM
                    response = llm.chat_llm(question, industry, role)
                    return jsonify({
                        'question': question,
                        'category': category,
                        'response': response
                    })
            
            elif category == 'data':
                influx_query = llm.convert_question_query_influx(question, industry, role)
                query_result = influx_handler.execute_query_and_return_data(influx_query)
                recommendations = llm.generate_recommendations(question, influx_query, query_result, industry, role)
                
                return jsonify({
                    'question': question,
                    'category': category,
                    'query': influx_query,
                    'query_result': query_result,
                    'recommendations': recommendations
                })
                
            elif category == 'relational':
                sql_query = llm.convert_question_query_sql(question, industry, role)
                query_result = sql_handler.test_data(sql_query)
                recommendations = llm.generate_recommendations(question, sql_query, query_result, industry, role)
                
                return jsonify({
                    'question': question,
                    'category': category,
                    'query': sql_query,
                    'query_result': query_result,
                    'recommendations': recommendations
                })
            
            else:
                return jsonify({'error': 'Unknown question category'}), 400
            
        except Exception as e:
            logging.error(f"Error in process_question route: {str(e)}")
            return jsonify({'error': 'An unexpected error occurred'}), 500

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

def main():
    """Initialize and run the application"""
    try:
        global rag_assistant
        #model_path = os.getenv('MODEL_PATH', 'cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4')  # Set your default model path
        #rag_assistant = RAGAssistant(MODEL_PATH)
        logging.info("RAG Assistant initialized successfully")
        
        port = int(os.getenv('PORT', 5000))
        debug = os.getenv('DEBUG', 'False').lower() == 'true'
        
        logging.info(f"Starting server with USE_LOCAL_LLM={USE_LOCAL_LLM}")
        if USE_LOCAL_LLM:
            logging.info(f"Using local LLM with model path: {MODEL_PATH}")
        
        
        socketio.run(app, 
                    host='0.0.0.0',
                    port=port,
                    debug=debug,
                    allow_unsafe_werkzeug=True)

    except Exception as e:
        logging.error(f"Application error: {str(e)}")
        raise

if __name__ == '__main__':
    main()
