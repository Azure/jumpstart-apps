from flask import Flask, request, jsonify
from flask_restx import Api, Resource, Namespace, fields
from werkzeug.exceptions import BadRequest
import random
from flask_cors import CORS
from llm import LLM
from InfluxDBHandler import InfluxDBHandler
import logging
import sqlite3

app = Flask(__name__)

llm = LLM()
influx_handler = InfluxDBHandler()
logger = logging.getLogger(__name__)

api = Api(app, version='1.0', title='Cerebral API',
          description='Manage industries and roles in the Cerebral application.')

ns = api.namespace('Cerebral', description='Cerebral Operations')

CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT"]}})

# Dummy data for demonstration purposes
industries = [
        {
            "manufacturing": ["maintenance engineer", "shift supervisor"],
            "retail": ["store manager", "buyer"]
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

camera_model = api.model('Camera', {
    'name': fields.String(required=True, description='Camera name'),
    'endpoint': fields.String(required=True, description='Camera endpoint'),
    'tags': fields.List(fields.String, description='Camera tags'),
    'status': fields.String(required=True, description='Camera status')
})

def get_db_connection():
    conn = sqlite3.connect('cameras.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS cameras
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     endpoint TEXT NOT NULL,
                     tags TEXT,
                     status TEXT NOT NULL)''')
    conn.close()

init_db()

def validate_json_content_type():
    if request.content_type != 'application/json':
        ns.abort(400, 'Content-Type must be application/json')

@ns.route('/api/camera')
class CameraResource(Resource):
    @ns.expect(camera_model)
    @ns.response(201, 'Camera created successfully')
    @ns.response(400, 'Bad Request')
    @ns.response(500, 'Internal Server Error')
    def put(self):
        """Create a new camera or update an existing one"""
        validate_json_content_type()
        data = request.json
        conn = get_db_connection()
        
        try:
            tags = ','.join(data['tags']) if data.get('tags') else ''
            conn.execute('INSERT OR REPLACE INTO cameras (name, endpoint, tags, status) VALUES (?, ?, ?, ?)',
                         (data['name'], data['endpoint'], tags, data['status']))
            conn.commit()
            return {'message': 'Camera created/updated successfully'}, 201
        except sqlite3.Error as e:
            ns.abort(500, f'Database error: {str(e)}')
        finally:
            conn.close()

    @ns.response(200, 'Success', [camera_model])
    @ns.response(500, 'Internal Server Error')
    def get(self):
        """Get all cameras"""
        conn = get_db_connection()
        try:
            cameras = conn.execute('SELECT * FROM cameras').fetchall()
            return jsonify([dict(camera) for camera in cameras])
        except sqlite3.Error as e:
            ns.abort(500, f'Database error: {str(e)}')
        finally:
            conn.close()

@ns.route('/api/camera/<string:name>')
@ns.param('name', 'The camera name')
class CameraDetailResource(Resource):
    @ns.response(200, 'Success', camera_model)
    @ns.response(404, 'Camera not found')
    @ns.response(500, 'Internal Server Error')
    def get(self, name):
        """Get a specific camera by name"""
        conn = get_db_connection()
        try:
            camera = conn.execute('SELECT * FROM cameras WHERE name = ?', (name,)).fetchone()
            if camera:
                return dict(camera)
            ns.abort(404, 'Camera not found')
        except sqlite3.Error as e:
            ns.abort(500, f'Database error: {str(e)}')
        finally:
            conn.close()




if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5004)
