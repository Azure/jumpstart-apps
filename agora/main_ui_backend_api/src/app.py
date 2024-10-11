from flask import Flask, request, jsonify
from flask_restx import Api, Resource, fields
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT"]}})

api = Api(app, version='1.0', title='Agora Backend API',
          description='API for agora')

# SQLite setup
def get_db_connection():
    conn = sqlite3.connect('agora.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS cameras
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     location TEXT NOT NULL)''')
    
    conn.execute('''CREATE TABLE IF NOT EXISTS zones
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     description TEXT NOT NULL)''')
    
    conn.execute('''CREATE TABLE IF NOT EXISTS ovens
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     description TEXT NOT NULL)''')
    
    conn.execute('''CREATE TABLE IF NOT EXISTS fridges
                    (id INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     description TEXT NOT NULL)''')
    
    conn.commit()
    conn.close()

init_db()

# Namespaces
cameras_ns = api.namespace('cameras', description='Camera operations')
zones_ns = api.namespace('zones', description='Zone operations')
ovens_ns = api.namespace('ovens', description='Oven operations')
fridges_ns = api.namespace('fridges', description='Refrigerator operations')

# Models
camera_model = api.model('Camera', {
    'id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'location': fields.String(required=True)
})

zone_model = api.model('Zone', {
    'id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'description': fields.String(required=True)
})

oven_model = api.model('Oven', {
    'id': fields.Integer(readonly=True),
    'status': fields.String(required=True),
    'temperature': fields.String(required=True),
    'humidity': fields.String(required=True),
    'pressure': fields.String(required=True),
    'zone_id': fields.String(required=True)
})

fridge_model = api.model('Fridge', {
    'id': fields.Integer(readonly=True),
    'status': fields.String(required=True),
    'temperature': fields.String(required=True),
    'humidity': fields.String(required=True),
    'zone_id': fields.String(required=True)
})

# Camera endpoints
@cameras_ns.route('/')
class CameraList(Resource):
    @cameras_ns.doc('list_cameras')
    @cameras_ns.marshal_list_with(camera_model)
    def get(self):
        """List all cameras"""
        conn = get_db_connection()
        cameras = conn.execute('SELECT * FROM cameras').fetchall()
        conn.close()
        return [dict(camera) for camera in cameras]

    @cameras_ns.doc('create_camera')
    @cameras_ns.expect(camera_model)
    @cameras_ns.marshal_with(camera_model, code=201)
    def post(self):
        """Create a new camera"""
        new_camera = api.payload
        conn = get_db_connection()
        cursor = conn.execute('INSERT INTO cameras (name, location) VALUES (?, ?)',
                              (new_camera['name'], new_camera['location']))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        new_camera['id'] = new_id
        return new_camera, 201

@cameras_ns.route('/<int:id>')
@cameras_ns.response(404, 'Camera not found')
@cameras_ns.param('id', 'The camera identifier')
class Camera(Resource):
    @cameras_ns.doc('get_camera')
    @cameras_ns.marshal_with(camera_model)
    def get(self, id):
        """Get a camera by its ID"""
        conn = get_db_connection()
        camera = conn.execute('SELECT * FROM cameras WHERE id = ?', (id,)).fetchone()
        conn.close()
        if camera is None:
            cameras_ns.abort(404, f"Camera {id} doesn't exist")
        return dict(camera)

    @cameras_ns.doc('update_camera')
    @cameras_ns.expect(camera_model)
    @cameras_ns.marshal_with(camera_model)
    def put(self, id):
        """Update a camera"""
        update_camera = api.payload
        conn = get_db_connection()
        camera = conn.execute('SELECT * FROM cameras WHERE id = ?', (id,)).fetchone()
        if camera is None:
            conn.close()
            cameras_ns.abort(404, f"Camera {id} doesn't exist")
        conn.execute('UPDATE cameras SET name = ?, location = ? WHERE id = ?',
                     (update_camera['name'], update_camera['location'], id))
        conn.commit()
        updated_camera = conn.execute('SELECT * FROM cameras WHERE id = ?', (id,)).fetchone()
        conn.close()
        return dict(updated_camera)

    @cameras_ns.doc('delete_camera')
    @cameras_ns.response(204, 'Camera deleted')
    def delete(self, id):
        """Delete a camera"""
        conn = get_db_connection()
        camera = conn.execute('SELECT * FROM cameras WHERE id = ?', (id,)).fetchone()
        if camera is None:
            conn.close()
            cameras_ns.abort(404, f"Camera {id} doesn't exist")
        conn.execute('DELETE FROM cameras WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return '', 204

# Zone endpoints
@zones_ns.route('/')
class ZoneList(Resource):
    @zones_ns.doc('list_zones')
    @zones_ns.marshal_list_with(zone_model)
    def get(self):
        """List all zones"""
        conn = get_db_connection()
        zones = conn.execute('SELECT * FROM zones').fetchall()
        conn.close()
        return [dict(zone) for zone in zones]

    @zones_ns.doc('create_zone')
    @zones_ns.expect(zone_model)
    @zones_ns.marshal_with(zone_model, code=201)
    def post(self):
        """Create a new zone"""
        new_zone = api.payload
        conn = get_db_connection()
        cursor = conn.execute('INSERT INTO zones (name, description) VALUES (?, ?)',
                              (new_zone['name'], new_zone['description']))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        new_zone['id'] = new_id
        return new_zone, 201

@zones_ns.route('/<int:id>')
@zones_ns.response(404, 'Zone not found')
@zones_ns.param('id', 'The zone identifier')
class Zone(Resource):
    @zones_ns.doc('get_zone')
    @zones_ns.marshal_with(zone_model)
    def get(self, id):
        """Get a zone by its ID"""
        conn = get_db_connection()
        zone = conn.execute('SELECT * FROM zones WHERE id = ?', (id,)).fetchone()
        conn.close()
        if zone is None:
            zones_ns.abort(404, f"Zone {id} doesn't exist")
        return dict(zone)

    @zones_ns.doc('update_zone')
    @zones_ns.expect(zone_model)
    @zones_ns.marshal_with(zone_model)
    def put(self, id):
        """Update a zone"""
        update_zone = api.payload
        conn = get_db_connection()
        zone = conn.execute('SELECT * FROM zones WHERE id = ?', (id,)).fetchone()
        if zone is None:
            conn.close()
            zones_ns.abort(404, f"Zone {id} doesn't exist")
        conn.execute('UPDATE zones SET name = ?, description = ? WHERE id = ?',
                     (update_zone['name'], update_zone['description'], id))
        conn.commit()
        updated_zone = conn.execute('SELECT * FROM zones WHERE id = ?', (id,)).fetchone()
        conn.close()
        return dict(updated_zone)

    @zones_ns.doc('delete_zone')
    @zones_ns.response(204, 'Zone deleted')
    def delete(self, id):
        """Delete a zone"""
        conn = get_db_connection()
        zone = conn.execute('SELECT * FROM zones WHERE id = ?', (id,)).fetchone()
        if zone is None:
            conn.close()
            zones_ns.abort(404, f"Zone {id} doesn't exist")
        conn.execute('DELETE FROM zones WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return '', 204
    
# Oven endpoints
@ovens_ns.route('/')
class OvenList(Resource):
    @ovens_ns.doc('list_ovens')
    @ovens_ns.marshal_list_with(oven_model)
    def get(self):
        """List all ovens"""
        return ovens

@ovens_ns.route('/<int:id>')
@ovens_ns.response(404, 'Oven not found')
@ovens_ns.param('id', 'The oven identifier')
class Oven(Resource):
    @ovens_ns.doc('get_oven')
    @ovens_ns.marshal_with(oven_model)
    def get(self, id):
        """Get an oven by its ID"""
        for oven in ovens:
            if oven['id'] == id:
                return oven
        ovens_ns.abort(404, f"Oven {id} doesn't exist")

# Refrigerator endpoints
@fridges_ns.route('/')
class FridgeList(Resource):
    @fridges_ns.doc('list_fridges')
    @fridges_ns.marshal_list_with(fridge_model)
    def get(self):
        """List all refrigerators"""
        return refrigerators

@fridges_ns.route('/<int:id>')
@fridges_ns.response(404, 'Fridge not found')
@fridges_ns.param('id', 'The fridge identifier')
class Fridge(Resource):
    @fridges_ns.doc('get_fridge')
    @fridges_ns.marshal_with(fridge_model)
    def get(self, id):
        """Get a refrigerator by its ID"""
        for fridge in refrigerators:
            if fridge['id'] == id:
                return fridge
        fridges_ns.abort(404, f"Fridge {id} doesn't exist")

if __name__ == '__main__':
    app.run(debug=True)