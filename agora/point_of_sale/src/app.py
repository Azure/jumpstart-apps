#!/usr/bin/env python
import os
import cv2
import secrets
import psycopg2
import json
from datetime import datetime
from flask import Flask, render_template, Response, request, session, redirect, url_for, jsonify
from flask_session import Session

# Load environment variables
storeid = os.environ.get('STORE_ID', 0)
store_location = os.environ.get('STORE_LOCATION', "")

# Flask app setup
app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Set variables for Jinja templates
app.config['HOLIDAY_BANNER'] = os.environ.get('HOLIDAY_BANNER', 'False').lower() == 'true'
app.config['STORE_ID'] = storeid
app.config['STORE_LOCATION'] = store_location

# Database configuration
dbconfig = {
    "host": os.environ.get('SQL_HOST'),
    "user": os.environ.get('SQL_USERNAME'),
    "password": os.environ.get('SQL_PASSWORD'),
    "database": os.environ.get('SQL_DATABASE')
}

# Global database connection
conn = None

def get_conn():
    """Establish and return a database connection."""
    global conn
    if conn is None:
        conn = psycopg2.connect(**dbconfig)
        conn.autocommit = True
    return conn

def get_cursor():
    """Return a database cursor."""
    conn = get_conn()
    try:
        return conn.cursor()
    except psycopg2.InterfaceError:
        conn.reset()
        return conn.cursor()

# Routes
@app.route('/')
def index():
    """Contoso Supermarket home page."""
    cameras_enabled = os.environ.get('CAMERAS_ENABLED', 'False').lower() == 'true'
    head_title = os.environ.get('HEAD_TITLE', 'Contoso Supermarket')
    new_category = os.environ.get('NEW_CATEGORY', 'False').lower() == 'true'

    query = "SELECT productid, name, description, price, stock, photopath FROM contoso.products ORDER BY productId"
    productlist = []

    try:
        cur = get_cursor()
        cur.execute(query)
        for item in cur.fetchall():
            productlist.append({
                'productid': item[0],
                'name': item[1],
                'description': item[2],
                'price': item[3],
                'stock': item[4],
                'photopath': item[5]
            })
        cur.close()
    except Exception as e:
        print(f"Error querying items: {e}")
        conn.rollback()

    return render_template('index.html', head_title=head_title, cameras_enabled=cameras_enabled, productlist=productlist)

@app.route('/inventory')
def inventory():
    """Inventory page."""
    query = "SELECT productid, name, description, price, stock, photopath from contoso.products ORDER BY productId"
    inventorylist = []
    
    try:
        cur = get_cursor()
        cur.execute(query)
        for item in cur.fetchall():
            inventorylist.append({
                'id': item[0],
                'name': item[1],
                'description': item[2],
                'price': item[3],
                'stock': item[4],
                'photopath': item[5]
            })
        cur.close()
    except Exception as e:
        print(f"Error querying inventory: {e}")
        conn.rollback()
        return f"Error querying inventory: {e}"

    return render_template('inventory.html', inventorylist=inventorylist)

@app.route('/update_item', methods=['POST'])
def update_item():
    """Update item details."""
    try:
        item_id = int(request.form['id'])
        name = request.form['name']
        price = float(request.form['price'])

        cur = get_cursor()
        cur.execute("UPDATE contoso.products SET Name=%s, price=%s WHERE productId=%s", (name, price, item_id))
        conn.commit()
        cur.close()

        return "Item updated successfully."
    except Exception as e:
        print(f"Error updating item: {e}")
        conn.rollback()
        return f"Error updating item: {e}"

@app.route('/delete_item', methods=['POST'])
def delete_item():
    """Delete item from the database."""
    try:
        item_id = int(request.form['id'])

        cur = get_cursor()
        cur.execute("DELETE FROM contoso.products WHERE productid=%s", (item_id,))
        conn.commit()
        cur.close()

        return "Item deleted successfully."
    except Exception as e:
        print(f"Error deleting item: {e}")
        conn.rollback()
        return f"Error deleting item: {e}"

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    """Add an item to the cart."""
    product_id = request.form['product_id']
    product_name = request.form['product_name']
    product_price = float(request.form['product_price'])
    
    item = {
        'id': product_id,
        'name': product_name,
        'price': product_price,
        'quantity': 1
    }

    if 'cart' not in session:
        session['cart'] = []

    for existing_item in session['cart']:
        if existing_item['id'] == item['id']:
            existing_item['quantity'] += 1
            break
    else:
        session['cart'].append(item)

    return jsonify(session['cart'])

@app.route('/cart')
def cart():
    """Display the shopping cart."""
    cart = session.get('cart', [])
    return render_template('cart.html', cart=cart)

@app.route('/checkout')
def checkout():
    """Handle checkout process."""
    cart = session.get('cart', [])
    if not cart:
        return redirect(url_for('index'))

    orderDate = datetime.now()
    jsoncart = json.dumps(cart)
    query = f"INSERT INTO contoso.Orders (orderDate, orderdetails, storeId) VALUES ('{orderDate}', '{jsoncart}', {storeid}) returning orderId"

    try:
        cur = get_cursor()
        cur.execute(query)
        ordernumber = cur.fetchone()[0]
        conn.commit()
        cur.close()
        session.clear()  # Clear the cart after checkout
        return render_template('checkout.html', ordernumber=ordernumber, order=cart)
    except Exception as e:
        print(f"Error creating order: {e}")
        conn.rollback()
        return f"Error creating order: {e}"

@app.route('/video_feed/<feed>')
def video_feed(feed):
    """Stream video feed."""
    return Response(gen_frames(feed), mimetype='multipart/x-mixed-replace; boundary=frame')

def gen_frames(source):
    """Video streaming frame capture."""
    baseUrl = os.environ.get('CAMERAS_BASEURL', 'rtsp://localhost:554/media/')
    cap = cv2.VideoCapture(baseUrl + source)

    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

if __name__ == '__main__':
    app.run(host='0.0.0.0', threaded=True, debug=True)