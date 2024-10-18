from flask import Flask, request, jsonify
from flask_restx import Api, Resource, fields
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT"]}})

api = Api(app, version='1.0', title='Agora Backend API',
          description='API for agora')

# PostgreSQL setup
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DATABASE_HOST', 'localhost'),
        dbname=os.getenv('DATABASE_NAME', 'contoso'),
        user=os.getenv('DATABASE_USER', 'postgres'),
        password=os.getenv('DATABASE_PASSWORD', 'password')
    )
    return conn

# Namespaces
cameras_ns = api.namespace('cameras', description='Camera operations')
zones_ns = api.namespace('zones', description='Zone operations')
ovens_ns = api.namespace('ovens', description='Oven operations')
fridges_ns = api.namespace('fridges', description='Refrigerator operations')
regions_ns = api.namespace('regions', description='Region operations')

# Models
camera_model = api.model('Camera', {
    'id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'description': fields.String(required=True)
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
    'pressure': fields.String(required=True)
})

fridge_model = api.model('Fridge', {
    'id': fields.Integer(readonly=True),
    'status': fields.String(required=True),
    'temperature': fields.String(required=True),
    'humidity': fields.String(required=True)
})
# Region model
region_model = api.model('Region', {
    'id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'description': fields.String(required=True),
    'camera_id': fields.Integer(required=True)
})

# Region endpoints
@regions_ns.route('/')
class RegionList(Resource):
    @regions_ns.doc('list_regions')
    @regions_ns.marshal_list_with(region_model)
    def get(self):
        """List all regions"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM regions')
        regions = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(id=row[0], name=row[1], description=row[2], camera_id=row[3]) for row in regions]

    @regions_ns.doc('create_region')
    @regions_ns.expect(region_model)
    @regions_ns.marshal_with(region_model, code=201)
    def post(self):
        """Create a new region"""
        new_region = api.payload
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO regions (name, description, camera_id) VALUES (%s, %s, %s) RETURNING id',
                    (new_region['name'], new_region['description'], new_region['camera_id']))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        new_region['id'] = new_id
        return new_region, 201

@regions_ns.route('/<int:id>')
class Region(Resource):
    @regions_ns.doc('get_region')
    @regions_ns.marshal_with(region_model)
    def get(self, id):
        """Fetch a region given its identifier"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM regions WHERE id = %s', (id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row is None:
            api.abort(404, "Region {} doesn't exist".format(id))
        return dict(id=row[0], name=row[1], description=row[2], camera_id=row[3])

    @regions_ns.doc('update_region')
    @regions_ns.expect(region_model)
    @regions_ns.marshal_with(region_model)
    def put(self, id):
        """Update a region given its identifier"""
        updated_region = api.payload
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE regions SET name = %s, description = %s, camera_id = %s WHERE id = %s',
                    (updated_region['name'], updated_region['description'], updated_region['camera_id'], id))
        conn.commit()
        cur.close()
        conn.close()
        updated_region['id'] = id
        return updated_region

    @regions_ns.doc('delete_region')
    @regions_ns.response(204, 'Region deleted')
    def delete(self, id):
        """Delete a region given its identifier"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM regions WHERE id = %s', (id,))
        conn.commit()
        cur.close()
        conn.close()
        return '', 204

# Camera endpoints
@cameras_ns.route('/')
class CameraList(Resource):
    @cameras_ns.doc('list_cameras')
    @cameras_ns.marshal_list_with(camera_model)
    def get(self):
        """List all cameras"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM cameras')
        cameras = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(id=row[0], name=row[1], description=row[2]) for row in cameras]

    @cameras_ns.doc('create_camera')
    @cameras_ns.expect(camera_model)
    @cameras_ns.marshal_with(camera_model, code=201)
    def post(self):
        """Create a new camera"""
        new_camera = api.payload
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO cameras (name, description) VALUES (%s, %s) RETURNING id',
                    (new_camera['name'], new_camera['description']))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
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
        cur = conn.cursor()
        cur.execute('SELECT * FROM cameras WHERE id = %s', (id,))
        camera = cur.fetchone()
        cur.close()
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
        cur = conn.cursor()
        cur.execute('SELECT * FROM cameras WHERE id = %s', (id,))
        camera = cur.fetchone()
        if camera is None:
            cur.close()
            conn.close()
            cameras_ns.abort(404, f"Camera {id} doesn't exist")
        cur.execute('UPDATE cameras SET name = %s, description = %s WHERE id = %s',
                     (update_camera['name'], update_camera['description'], id))
        conn.commit()
        cur.execute('SELECT * FROM cameras WHERE id = %s', (id,))
        updated_camera = cur.fetchone()
        cur.close()
        conn.close()
        return dict(updated_camera)

    @cameras_ns.doc('delete_camera')
    @cameras_ns.response(204, 'Camera deleted')
    def delete(self, id):
        """Delete a camera"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM cameras WHERE id = %s', (id,))
        camera = cur.fetchone()
        if camera is None:
            cur.close()
            conn.close()
            cameras_ns.abort(404, f"Camera {id} doesn't exist")
        cur.execute('DELETE FROM cameras WHERE id = %s', (id,))
        conn.commit()
        cur.close()
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
        cur = conn.cursor()
        cur.execute('SELECT * FROM zones')
        zones = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(id=row[0], name=row[1], description=row[2]) for row in zones]

    @zones_ns.doc('create_zone')
    @zones_ns.expect(zone_model)
    @zones_ns.marshal_with(zone_model, code=201)
    def post(self):
        """Create a new zone"""
        new_zone = api.payload
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO zones (name, description) VALUES (%s, %s) RETURNING id',
                    (new_zone['name'], new_zone['description']))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
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
        cur = conn.cursor()
        cur.execute('SELECT * FROM zones WHERE id = %s', (id,))
        zone = cur.fetchone()
        cur.close()
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
        cur = conn.cursor()
        cur.execute('SELECT * FROM zones WHERE id = %s', (id,))
        zone = cur.fetchone()
        if zone is None:
            cur.close()
            conn.close()
            zones_ns.abort(404, f"Zone {id} doesn't exist")
        cur.execute('UPDATE zones SET name = %s, description = %s WHERE id = %s',
                     (update_zone['name'], update_zone['description'], id))
        conn.commit()
        cur.execute('SELECT * FROM zones WHERE id = %s', (id,))
        updated_zone = cur.fetchone()
        cur.close()
        conn.close()
        return dict(updated_zone)

    @zones_ns.doc('delete_zone')
    @zones_ns.response(204, 'Zone deleted')
    def delete(self, id):
        """Delete a zone"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM zones WHERE id = %s', (id,))
        zone = cur.fetchone()
        if zone is None:
            cur.close()
            conn.close()
            zones_ns.abort(404, f"Zone {id} doesn't exist")
        cur.execute('DELETE FROM zones WHERE id = %s', (id,))
        conn.commit()
        cur.close()
        conn.close()
        return '', 204

# Oven endpoints
@ovens_ns.route('/')
class OvenList(Resource):
    @ovens_ns.doc('list_ovens')
    @ovens_ns.marshal_list_with(oven_model)
    def get(self):
        """List all ovens"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM ovens')
        ovens = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(id=row[0], name=row[1], description=row[2]) for row in ovens]

    @ovens_ns.doc('create_oven')
    @ovens_ns.expect(oven_model)
    @ovens_ns.marshal_with(oven_model, code=201)
    def post(self):
        """Create a new oven"""
        new_oven = api.payload
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO ovens (name, description) VALUES (%s, %s) RETURNING id',
                    (new_oven['name'], new_oven['description']))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        new_oven['id'] = new_id
        return new_oven, 201

@ovens_ns.route('/<int:id>')
@ovens_ns.response(404, 'Oven not found')
@ovens_ns.param('id', 'The oven identifier')
class Oven(Resource):
    @ovens_ns.doc('get_oven')
    @ovens_ns.marshal_with(oven_model)
    def get(self, id):
        """Get an oven by its ID"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM ovens WHERE id = %s', (id,))
        oven = cur.fetchone()
        cur.close()
        conn.close()
        if oven is None:
            ovens_ns.abort(404, f"Oven {id} doesn't exist")
        return dict(id=oven[0], name=oven[1], description=oven[2])

    @ovens_ns.doc('update_oven')
    @ovens_ns.expect(oven_model)
    @ovens_ns.marshal_with(oven_model)
    def put(self, id):
        """Update an oven by its ID"""
        updated_oven = api.payload
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE ovens SET name = %s, description = %s WHERE id = %s RETURNING id',
                    (updated_oven['name'], updated_oven['description'], id))
        updated_id = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if updated_id is None:
            ovens_ns.abort(404, f"Oven {id} doesn't exist")
        updated_oven['id'] = id
        return updated_oven

    @ovens_ns.doc('delete_oven')
    def delete(self, id):
        """Delete an oven by its ID"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM ovens WHERE id = %s', (id,))
        oven = cur.fetchone()
        if oven is None:
            cur.close()
            conn.close()
            ovens_ns.abort(404, f"Oven {id} doesn't exist")
        cur.execute('DELETE FROM ovens WHERE id = %s', (id,))
        conn.commit()
        cur.close()
        conn.close()
        return '', 204

# Refrigerator endpoints
@fridges_ns.route('/')
class FridgeList(Resource):
    @fridges_ns.doc('list_fridges')
    @fridges_ns.marshal_list_with(fridge_model)
    def get(self):
        """List all refrigerators"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM fridges')
        fridges = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(id=row[0], name=row[1], description=row[2]) for row in fridges]

    @fridges_ns.doc('create_fridge')
    @fridges_ns.expect(fridge_model)
    @fridges_ns.marshal_with(fridge_model, code=201)
    def post(self):
        """Create a new fridge"""
        new_fridge = api.payload
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO fridges (name, description) VALUES (%s, %s) RETURNING id',
                    (new_fridge['name'], new_fridge['description']))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        new_fridge['id'] = new_id
        return new_fridge, 201

@fridges_ns.route('/<int:id>')
@fridges_ns.response(404, 'Fridge not found')
@fridges_ns.param('id', 'The fridge identifier')
class Fridge(Resource):
    @fridges_ns.doc('get_fridge')
    @fridges_ns.marshal_with(fridge_model)
    def get(self, id):
        """Get a fridge by its ID"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM fridges WHERE id = %s', (id,))
        fridge = cur.fetchone()
        cur.close()
        conn.close()
        if fridge is None:
            fridges_ns.abort(404, f"Fridge {id} doesn't exist")
        return dict(id=fridge[0], name=fridge[1], description=fridge[2])

    @fridges_ns.doc('update_fridge')
    @fridges_ns.expect(fridge_model)
    @fridges_ns.marshal_with(fridge_model)
    def put(self, id):
        """Update a fridge by its ID"""
        updated_fridge = api.payload
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE fridges SET name = %s, description = %s WHERE id = %s RETURNING id',
                    (updated_fridge['name'], updated_fridge['description'], id))
        updated_id = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if updated_id is None:
            fridges_ns.abort(404, f"Fridge {id} doesn't exist")
        updated_fridge['id'] = id
        return updated_fridge

    @fridges_ns.doc('delete_fridge')
    def delete(self, id):
        """Delete a fridge by its ID"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM fridges WHERE id = %s', (id,))
        fridge = cur.fetchone()
        if fridge is None:
            cur.close()
            conn.close()
            fridges_ns.abort(404, f"Fridge {id} doesn't exist")
        cur.execute('DELETE FROM fridges WHERE id = %s', (id,))
        conn.commit()
        cur.close()
        conn.close()
        return '', 204

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)