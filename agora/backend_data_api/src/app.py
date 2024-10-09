import json
from flask import Flask, request, jsonify

app = Flask(__name__)
cameras = [
    {'id': 1, 'name': 'Camera 1', 'location': 'Kitchen 1'},
    {'id': 2, 'name': 'Camera 2', 'location': 'Kitchen 2'},
    {'id': 3, 'name': 'Camera 3', 'location': 'Server Room'}
]


zones = [
    {'id': 1, 'name': 'Zone 1', 'description': 'Main Entrance Zone 1'},
    {'id': 2, 'name': 'Zone 2', 'description': 'Main Entrance Zone 2'},
    {'id': 3, 'name': 'Zone 3', 'description': 'Restricted Area'}
]

ovens = [
    {'id': 1, 'status': 'Operating normally', 'temperature': '202', 'humidity': '35', 'pressure': '1000', 'zone_id': '1'},
    {'id': 2, 'status': 'Operating normally', 'temperature': '199', 'humidity': '36', 'pressure': '1000', 'zone_id': '1'},
    {'id': 3, 'status': 'Malfunction', 'temperature': '120', 'humidity': '80', 'pressure': '400', 'zone_id': '2'}
]

refrigerators = [
    {'id': 1, 'status': 'Operating normally', 'temperature': '2', 'humidity': '42', 'zone_id': '1'},
    {'id': 2, 'status': 'Operating normally', 'temperature': '2', 'humidity': '45', 'zone_id': '1'},
    {'id': 3, 'status': 'Malfunction', 'temperature': '10', 'humidity': '80', 'pressure': '400', 'zone_id': '2'}
]

@app.route('/cameras', methods=['GET'])
def get_cameras():
    return jsonify(cameras)

@app.route('/cameras/<int:camera_id>', methods=['GET'])
def get_camera(camera_id):
    camera = next((camera for camera in cameras if camera['id'] == camera_id), None)
    if camera is None:
        return jsonify({'error': 'Camera not found'}), 404
    return jsonify(camera)

@app.route('/cameras', methods=['PUT'])
def add_camera():
    if not request.json or not 'name' in request.json or not 'location' in request.json:
        abort(400)
    new_camera = {
        'id': cameras[-1]['id'] + 1 if cameras else 1,
        'name': request.json['name'],
        'location': request.json['location']
    }
    cameras.append(new_camera)
    return jsonify({'camera': new_camera}), 201


@app.route('/zones', methods=['GET'])
def get_zones():
    return jsonify(zones)

@app.route('/zones/<int:zone_id>', methods=['GET'])
def get_zone(zone_id):
    zone = next((zone for zone in zones if zone['id'] == zone_id), None)
    if zone is None:
        return jsonify({'error': 'Zone not found'}), 404
    return jsonify(zone)

@app.route('/zones', methods=['PUT'])
def add_zone():
    if not request.json or not 'name' in request.json or not 'description' in request.json:
        abort(400)
    new_zone = {
        'id': zones[-1]['id'] + 1 if zones else 1,
        'name': request.json['name'],
        'description': request.json['description']
    }
    zones.append(new_zone)
    return jsonify({'zone': new_zone}), 201

@app.route('/ovenhealth', methods=['GET'])
def get_ovens():
    return jsonify(ovens)

@app.route('/ovenhealth/<int:oven_id>', methods=['GET'])
def get_oven(oven_id):
    oven = next((oven for oven in ovens if oven['id'] == oven_id), None)
    if oven is None:
        return jsonify({'error': 'Oven not found'}), 404
    return jsonify(oven)

@app.route('/fridgestatus', methods=['GET'])
def get_frigdes():
    return jsonify(refrigerators)

@app.route('/fridgestatus/<int:fridge_id>', methods=['GET'])
def get_fridge(fridge_id):
    fridge = next((fridge for fridge in refrigerators if fridge['id'] == fridge_id), None)
    if fridge is None:
        return jsonify({'error': 'Fridge not found'}), 404
    return jsonify(fridge)

if __name__ == '__main__':
    app.run(debug=True)