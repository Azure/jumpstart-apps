from flask import Flask, request, jsonify
from flask_restx import Api, Resource, Namespace, fields
from werkzeug.exceptions import BadRequest
import random
from flask_cors import CORS
from llm import LLM
from InfluxDBHandler import InfluxDBHandler
import logging
from SqlDBHandler import SqlDBHandler
from datetime import datetime
import os
from SpeechToText import STT
import azure.cognitiveservices.speech as speechsdk 

app = Flask(__name__)

llm = LLM()
influx_handler = InfluxDBHandler()
sql_handler = SqlDBHandler()
stt = STT()

logger = logging.getLogger(__name__)

api = Api(app, version='1.0', title='Genie API',
          description='Manage industries and roles in the Genie application.')

ns = api.namespace('Genie', description='Genie Operations')

CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT"]}})

# Sample data for demonstration purposes
industries = [
        {
            "manufacturing": ["maintenance engineer", "shift supervisor"],
            "retail": ["store manager", "buyer"],
            "hypermarket": ["store manager", "shopper", "maintenance worker"]
        }
    ]

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
    @api.expect(integrated_query_model)
    def post(self):
        """Process question based on classification and generate appropriate response"""
        print("****Process question based on classification and generate appropriate response***\n")
        if request.content_type != 'application/json':
            raise BadRequest('Content-Type must be application/json')
        
        try:
            data = request.get_json(force=True)
            question = data.get('question')
            industry = data.get('industry')
            role = data.get('role')
            
            if not question or not industry or not role:
                return jsonify({'error': 'Question, industry, and role parameters are required'}), 400
            
            # Step 1: Classify the question
            category = llm.classify_question(question, industry, role)
            print("Step 1: Classify the question :" + category + "\n")
            
            if category == 'data':
                # Step 2a: Handle data query (InfluxDB)
                influx_query = llm.convert_question_query_influx(question, industry, role)
                print("Step 2a: Handle data query (InfluxDB)" + influx_query + "\n")

                query_result = influx_handler.execute_query_and_return_data(influx_query)
                print("Step 2a: execute_query_and_return_data (InfluxDB)" + query_result + "\n")

                recommendations = llm.generate_recommendations(question, influx_query, query_result, industry, role)
                
                return jsonify({
                    'question': question,
                    'category': category,
                    'query': influx_query,
                    'query_result': query_result,
                    'recommendations': recommendations
                })
                
            elif category == 'relational':
                # Step 2b: Handle relational query (SQL)
                print("Step 2b: Handle relational query (SQL)\n")
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
                
            elif category == 'documentation':
                # Step 2c: Handle documentation query
                response = llm.chat_llm(question, industry, role)  # You need to implement this method in your LLM class
                
                return jsonify({
                    'question': question,
                    'category': category,
                    'recommendations': response
                })
            
            else:
                return jsonify({'error': 'Unknown question category'}), 400
            
        except Exception as e:
            print(f"Error in process_question route: {str(e)}")
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5004)