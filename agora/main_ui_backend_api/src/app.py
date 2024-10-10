from flask import Flask, request, jsonify
from flask_restx import Api, Resource, Namespace, fields
from werkzeug.exceptions import BadRequest
import random
from flask_cors import CORS
import logging
import sqlite3

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT"]}})

api = Api(app, version='1.0', title='Agora API',
          description='Api for providing data to the frontend',
          doc='/swagger/',
          prefix='/api')  # Add prefix here

ns = api.namespace('', description='Agora operations')

# Dummy data for demonstration purposes
industries = [
        {
            "manufacturing": ["maintenance engineer", "shift supervisor"],
            "retail": ["store manager", "buyer"]
        }
    ]

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
