#store_simulator
import os
import json
import random
import time
import logging
from datetime import timedelta, datetime
from azure.eventhub import EventHubProducerClient, EventData
import paho.mqtt.client as mqtt
import pyodbc

#DevMode
#from dotenv import load_dotenv

class PriceRange:
    def __init__(self, min, max):
        self.min = min
        self.max = max

    def __repr__(self):
        return f"PriceRange(min={self.min}, max={self.max})"

class Product:
    def __init__(self, product_id, name, price_range, stock, photo_path, category):
        self.product_id = product_id
        self.name = name
        self.price_range = PriceRange(**price_range) if price_range else None
        self.stock = stock
        self.photo_path = photo_path
        self.category = category

    def __repr__(self):
        return f"Product(product_id={self.product_id}, name={self.name}, price_range={self.price_range}, stock={self.stock}, photo_path={self.photo_path}, category={self.category})"

class ProductInventory:
    def __init__(self, date_time, product_id, store_id, retail_price, in_stock, reorder_threshold, last_restocked):
        self.date_time = date_time
        self.product_id = product_id
        self.store_id = store_id
        self.retail_price = retail_price
        self.in_stock = in_stock
        self.reorder_threshold = reorder_threshold
        self.last_restocked = last_restocked

    def __repr__(self):
        return f"ProductInventory(date_time={self.date_time}, product_id={self.product_id}, store_id={self.store_id}, retail_price={self.retail_price}, in_stock={self.in_stock}, reorder_threshold={self.reorder_threshold}, last_restocked={self.last_restocked})"

    def to_dict(self):
        return {
            "date_time": self.date_time.isoformat(),
            "product_id": self.product_id,
            "store_id": self.store_id,
            "retail_price": self.retail_price,
            "in_stock": self.in_stock,
            "reorder_threshold": self.reorder_threshold,
            "last_restocked": self.last_restocked.isoformat()
        }

class StoreSimulator:
    def __init__(self):
        # Set up logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # dev mode
        # Load environment variables from .env file
        #load_dotenv()
        
        # Load configuration from environment variables
        self.EVENTHUB_CONNECTION_STRING = os.getenv('EVENTHUB_CONNECTION_STRING')
        self.ORDERS_EVENTHUB_NAME = os.getenv('ORDERS_EVENTHUB_NAME')
        self.INVENTORY_EVENTHUB_NAME = os.getenv('INVENTORY_EVENTHUB_NAME')
        self.HISTORICAL_DATA_DAYS = (0-int(os.getenv('HISTORICAL_DATA_DAYS', 1)))
        self.ORDER_FREQUENCY = int(os.getenv('ORDER_FREQUENCY', 5))
        self.PRODUCTS_FILE = os.getenv('PRODUCTS_FILE', 'products.json')

        self.SQL_SERVER = os.getenv("SQL_SERVER", "localhost")
        self.SQL_DATABASE = os.getenv("SQL_DATABASE", "RetailStore")
        self.SQL_USERNAME = os.getenv("SQL_USERNAME", "sa")
        self.SQL_PASSWORD = os.getenv("SQL_PASSWORD", "YourPassword123!")
        self.ENABLE_SQL = os.getenv("ENABLE_SQL", "True").lower() == "true"
        self.ENABLE_HISTORICAL = os.getenv("ENABLE_HISTORICAL", "True").lower() == "true"

        if self.ENABLE_SQL:
            self.init_database()

        # MQTT Settings
        MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
        MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

        self.mqtt_client = mqtt.Client()
        self.mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
        
        # Initialize Event Hub clients
        if self.ENABLE_HISTORICAL:
            self.orders_producer = EventHubProducerClient.from_connection_string(
                conn_str=self.EVENTHUB_CONNECTION_STRING, 
                eventhub_name=self.ORDERS_EVENTHUB_NAME
            )
            self.inventory_producer = EventHubProducerClient.from_connection_string(
                conn_str=self.EVENTHUB_CONNECTION_STRING, 
                eventhub_name=self.INVENTORY_EVENTHUB_NAME
            )

        # Initialize store details data structures
        self.store_details = [
            { "store_id": "CHI", "city": "Chicago", "state": "IL", "country": "United States" },
            { "store_id": "SEA", "city": "Seattle", "state": "WA", "country": "United States" },
            { "store_id": "NYC", "city": "New York City", "state": "NY", "country": "United States" },
            { "store_id": "DAL", "city": "Dallas", "state": "TX", "country": "United States" },
            { "store_id": "ATL", "city": "Atlanta", "state": "GA", "country": "United States" },
            { "store_id": "LAS", "city": "Las Vegas", "state": "NV", "country": "United States" },
            { "store_id": "MIA", "city": "Miami", "state": "FL", "country": "United States" },
            { "store_id": "LAX", "city": "Los Angeles", "state": "CA", "country": "United States" }
        ]

        self.store_registers = ["R-001", "R-002", "R-003", "R-004", "R-005"]
        self.payment_methods = ["credit_card", "cash", "debit_card", "check"]
        self.product_discount = [0, 5, 10, 15, 20]

        self.products_list = []
        self.current_inventory = {}

        # Add orders storage
        self.recent_orders = []
        self.max_orders_history = 100

    def add_order(self, order_data):
        """Add order to recent orders list"""
        self.recent_orders.append(order_data)
        # keep only the recent orders
        if len(self.recent_orders) > self.max_orders_history:
            self.recent_orders.pop(0)

    def init_database(self):
        """Initialize database connection and create tables if they don't exist"""
        try:
            drivers = [
                '{ODBC Driver 18 for SQL Server}',
                '{ODBC Driver 17 for SQL Server}',
                'ODBC Driver 18 for SQL Server',
                'ODBC Driver 17 for SQL Server'
            ]
            
            connected = False
            for driver in drivers:
                try:
                    conn_str = f'DRIVER={driver};SERVER={self.SQL_SERVER};DATABASE={self.SQL_DATABASE};UID={self.SQL_USERNAME};PWD={self.SQL_PASSWORD};TrustServerCertificate=yes'
                    self.sql_conn = pyodbc.connect(conn_str)
                    connected = True
                    self.logger.info(f"Successfully connected using driver: {driver}")
                    break
                except pyodbc.Error as e:
                    self.logger.warning(f"Failed to connect with driver {driver}: {str(e)}")
                    continue
            
            if not connected:
                raise Exception("Could not connect with any available driver")
                
            #self.create_tables()
            self.logger.info("Successfully connected to SQL Server")
        except Exception as e:
            self.logger.error(f"Error connecting to SQL Server: {str(e)}")
            raise


    def create_tables(self):
        """Create necessary tables for store data"""
        cursor = self.sql_conn.cursor()
        try:
            # Create Stores table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Stores')
                CREATE TABLE Stores (
                    store_id VARCHAR(10) PRIMARY KEY,
                    city VARCHAR(100),
                    state VARCHAR(50),
                    country VARCHAR(100)
                )
            """)
            
            # Create Products table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
                CREATE TABLE Products (
                    product_id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(200),
                    category VARCHAR(100),
                    price_min DECIMAL(10,2),
                    price_max DECIMAL(10,2),
                    stock INT
                )
            """)
            
            # Create Inventory table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Inventory')
                CREATE TABLE Inventory (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    date_time DATETIME2,
                    store_id VARCHAR(10),
                    product_id VARCHAR(50),
                    retail_price DECIMAL(10,2),
                    in_stock INT,
                    reorder_threshold INT,
                    last_restocked DATETIME2
                )
            """)
            
            # Create Sales table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sales')
                CREATE TABLE Sales (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    sale_id VARCHAR(50),
                    sale_date DATETIME2,
                    store_id VARCHAR(10),
                    store_city VARCHAR(100),
                    product_id VARCHAR(50),
                    product_category VARCHAR(100),
                    product_name VARCHAR(200),
                    price DECIMAL(10,2),
                    discount DECIMAL(5,2),
                    quantity INT,
                    item_total DECIMAL(10,2),
                    profit DECIMAL(10,2),
                    payment_method VARCHAR(50),
                    customer_id VARCHAR(50),
                    register_id VARCHAR(20)
                )
            """)
            
            self.sql_conn.commit()
            self.logger.info("Database tables created successfully")
        except Exception as e:
            self.logger.error(f"Error creating tables: {str(e)}")
            self.sql_conn.rollback()
        finally:
            cursor.close()

    def save_to_sql(self, data_type, data):
        """Save data to SQL Server based on the data type"""
        if not self.ENABLE_SQL:
            return
            
        try:
            cursor = self.sql_conn.cursor()
            
            if data_type == "inventory":
                cursor.execute("""
                    INSERT INTO Inventory 
                    (date_time, store_id, product_id, retail_price, in_stock, reorder_threshold, last_restocked)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    data["date_time"],
                    data["store_id"],
                    data["product_id"],
                    data["retail_price"],
                    data["in_stock"],
                    data["reorder_threshold"],
                    data["last_restocked"]
                ))
                
            elif data_type == "sales":
                cursor.execute("""
                    INSERT INTO Sales 
                    (sale_id, sale_date, store_id, store_city, product_id, product_category, 
                     product_name, price, discount, quantity, item_total, profit, 
                     payment_method, customer_id, register_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    data["sale_id"],
                    data["sale_date"],
                    data["store_id"],
                    data["store_city"],
                    data["product_id"],
                    data["product_category"],
                    data["product_name"],
                    data["price"],
                    data["discount"],
                    data["quantity"],
                    data["item_total"],
                    data["profit"],
                    data["payment_method"],
                    data["customer_id"],
                    data["register_id"]
                ))
                
            self.sql_conn.commit()
            if os.getenv("VERBOSE", "False").lower() == "true":
                self.logger.info(f"Saved {data_type} data to SQL Server")
                
        except Exception as e:
            self.logger.error(f"Error saving {data_type} data to SQL Server: {str(e)}")
            self.sql_conn.rollback()
        finally:
            cursor.close()

    def load_products(self):
        if not os.path.exists(self.PRODUCTS_FILE):
            raise FileNotFoundError(f"Products file not found: {self.PRODUCTS_FILE}")

        with open(self.PRODUCTS_FILE, 'r') as file:
            products = json.load(file)
            self.products_list = [Product(**product) for product in products]

    def publish_data_to_mqtt(self, simulation_data, topic):
        try:
            staging_event = json.dumps({
            "source": "simulator",
            "subject": topic,
            "event_data": json.loads(simulation_data)
            })

            mqtt_topic = "topic/commercial"
            self.mqtt_client.publish(f"{mqtt_topic}", staging_event)

            # Save to SQL Server
            if self.ENABLE_SQL:
                event_data = json.loads(simulation_data)
                if topic == "topic/inventory":
                    self.save_to_sql("inventory", event_data)
                elif topic == "topic/sales":
                    self.save_to_sql("sales", event_data)


            if os.getenv("VERBOSE", "False").lower() == "true":
                self.logger.info(f"Data for {mqtt_topic} published to MQTT: {staging_event}")

        except Exception as e:
            self.logger.error(f"Error publishing data to MQTT for {mqtt_topic}: {str(e)}")

    def cleanup(self):
        """Cleanup resources"""
        try:
            if hasattr(self, 'sql_conn'):
                self.sql_conn.close()
                self.logger.info("SQL Server connection closed")
        except Exception as e:
            self.logger.error(f"Error closing SQL connection: {str(e)}")
        
        if os.getenv("ENABLE_HISTORICAL", "True").lower() == "true":
            self.logger.info("Closing Event Hub producers...")
            if self.orders_producer:
                self.orders_producer.close()
            if self.inventory_producer:
                self.inventory_producer.close()

    

    def generate_inventory_data(self, current_time, destination="MQTT"):
        """Generate initial inventory data for all stores and products"""
        try:
            for store in self.store_details:
                for product in self.products_list:
                    try:
                        product_price = round(random.uniform(product.price_range.min, product.price_range.max), 2)
                        product_inventory = ProductInventory(
                            date_time=current_time,
                            store_id=store["store_id"],
                            product_id=str(product.product_id), 
                            retail_price=product_price,
                            in_stock=product.stock,
                            reorder_threshold=int(product.stock * 0.2),
                            last_restocked=current_time - timedelta(days=random.randint(1, 30))
                        )

                        key = (store["store_id"], str(product.product_id)) 
                        self.current_inventory[key] = product_inventory

                        if self.VERBOSE:
                            self.logger.info(f"Generated inventory for store {store['store_id']}, product {product.product_id}")

                        # Send inventory data to event hub or MQTT
                        simulation_data = json.dumps(product_inventory.to_dict())
                        if destination == "EventHub":
                            self.send_inventory_to_event_hub(simulation_data)
                        else:
                            self.publish_data_to_mqtt(simulation_data, "topic/inventory")

                    except Exception as e:
                        self.logger.error(f"Error generating inventory for store {store['store_id']}, product {product.product_id}: {str(e)}")

        except Exception as e:
            self.logger.error(f"Error in generate_inventory_data: {str(e)}")

    def simulate_order_data(self, current_time, destination="MQTT"):
        try:
            day_name = current_time.strftime('%A')
            current_time_str = str(current_time)

            # Determine number of random orders
            randomOrders = self.calculate_random_orders(current_time, day_name)
            
            product_count = len(self.products_list)
            for orderIndex in range(1, randomOrders + 1):
                try:
                    store_index = random.randint(0, len(self.store_details) - 1)
                    store = self.store_details[store_index]
                    order_id = current_time.strftime('%Y%m%d%H%M%S-') + '{:03d}'.format(orderIndex)

                    # Seleccionar productos aleatorios para esta orden
                    selected_products = random.sample(self.products_list, random.randint(1, min(5, product_count)))
                    profit_choices = random.sample(range(-20, 30), 5)

                    for product in selected_products:
                        try:
                            quantity_sold = random.randint(1, 10)
                            inventory_key = (store["store_id"], str(product.product_id))

                            if inventory_key not in self.current_inventory:
                                self.logger.warning(f"Inventory not found for {inventory_key}, generating new inventory")
                                product_price = round(random.uniform(product.price_range.min, product.price_range.max), 2)
                                self.current_inventory[inventory_key] = ProductInventory(
                                    date_time=current_time,
                                    store_id=store["store_id"],
                                    product_id=str(product.product_id),
                                    retail_price=product_price,
                                    in_stock=product.stock,
                                    reorder_threshold=int(product.stock * 0.2),
                                    last_restocked=current_time
                                )

                            product_inventory = self.current_inventory[inventory_key]

                            # Update inventory
                            if product_inventory.in_stock > quantity_sold:
                                product_inventory.in_stock -= quantity_sold
                            else:
                                product_inventory.in_stock = product.stock - quantity_sold
                                product_inventory.last_restocked = current_time

                            product_inventory.date_time = current_time
                            self.current_inventory[inventory_key] = product_inventory

                            # Generate sales data
                            discount = random.choice(self.product_discount) / 100
                            line_item_total_price = round(product_inventory.retail_price * quantity_sold * (1 - discount), 2)
                            profit = round(line_item_total_price * random.choice(profit_choices) / 100, 2)

                            line_item = {
                                'sale_id': order_id,
                                'sale_date': current_time_str,
                                'store_id': store["store_id"],
                                'store_city': store["city"],
                                'product_id': str(product.product_id),
                                'product_category': product.category,
                                'product_name': product.name,
                                'price': product_inventory.retail_price,
                                'discount': discount,
                                'quantity': quantity_sold,
                                'item_total': line_item_total_price,
                                'profit': profit,
                                'payment_method': random.choice(self.payment_methods),
                                'customer_id': f'C-{random.randint(1,1000):03d}',
                                'register_id': random.choice(self.store_registers)
                            }

                            # Add to recent orders
                            self.add_order({
                                "timestamp": current_time_str,
                                "order_data": line_item
                            })

                            # Save to SQL if enabled
                            if self.ENABLE_SQL:
                                self.save_to_sql("sales", line_item)

                            # Send to destination
                            simulation_data = json.dumps(line_item)
                            if destination == "EventHub":
                                self.send_orders_to_event_hub(simulation_data)
                            else:
                                self.publish_data_to_mqtt(simulation_data, "topic/sales")

                        except Exception as e:
                            self.logger.error(f"Error processing product {product.product_id} in order {order_id}: {str(e)}")

                except Exception as e:
                    self.logger.error(f"Error processing order {orderIndex}: {str(e)}")

        except Exception as e:
            self.logger.error(f"Error in simulate_order_data: {str(e)}")

    def calculate_random_orders(self, current_time, day_name):
        """Calculate number of random orders based on time and day"""
        if day_name in ['Saturday', 'Sunday']:
            if 8 < current_time.hour < 20:
                return random.randint(20, 50)
            elif 6 < current_time.hour < 22:
                return random.randint(10, 20)
            else:
                return random.randint(1, 5)
        else:
            if 8 < current_time.hour < 20:
                return random.randint(10, 30)
            elif 6 < current_time.hour < 22:
                return random.randint(5, 10)
            else:
                return random.randint(1, 5)


    def send_inventory_to_event_hub(self, simulation_data):
        
        if not os.getenv("ENABLE_HISTORICAL", "True").lower() == "true":
            return
    
        staging_event = {
        "source": "simulator",
        "subject": "topic/inventory",
        "event_data": json.loads(simulation_data)
        }

        event_data = EventData(json.dumps(staging_event))
        self.inventory_producer.send_batch([event_data])
        if os.getenv("VERBOSE", "False").lower() == "true":
            self.logger.info(f"Sent inventory data: {simulation_data}")

    def send_orders_to_event_hub(self, simulation_data):
        if not os.getenv("ENABLE_HISTORICAL", "True").lower() == "true":
            return
        
        staging_event = {
        "source": "simulator",
        "subject": "topic/sales",
        "event_data": json.loads(simulation_data)
        }

        event_data = EventData(json.dumps(staging_event))
        self.orders_producer.send_batch([event_data])
        if os.getenv("VERBOSE", "False").lower() == "true":
            self.logger.info(f"Sent order data: {simulation_data}")

    def run(self):
        try:
            self.logger.info("Starting store simulator...")
            # Load products
            self.load_products()
            self.logger.info(f"Loaded {len(self.products_list)} products")

            # Generate batch and continue with live data
            production_datetime = datetime.now() + timedelta(days=self.HISTORICAL_DATA_DAYS)

            if self.ENABLE_HISTORICAL:
                # Generate initial inventory and historical data
                self.logger.info("Historical data enabled. Generating initial inventory...")
                # Generate initial inventory
                self.logger.info("Generating initial inventory...")
                self.generate_inventory_data(production_datetime)

                # Process historical data
                self.logger.info("Processing historical data...")
                while production_datetime <= datetime.now():
                    self.logger.info(f'Generating data for: {production_datetime}')
                    self.simulate_order_data(production_datetime, destination="EventHub")
                    production_datetime += timedelta(minutes=self.ORDER_FREQUENCY)  # Increment by ORDER_FREQUENCY minutes

                self.logger.info("Historical data generation completed.")

            # Generate live data
            self.logger.info("Now generating live data...")
            while True:
                current_time = datetime.now()
                self.logger.info(f'Generating for: {current_time}')
                self.simulate_order_data(current_time, destination="MQTT")
                time.sleep(60)  # Sleep for 1 minute for live data

        except KeyboardInterrupt:
            self.logger.info("Received keyboard interrupt, shutting down...")
        except Exception as e:
            self.logger.error(f"Error in store simulator: {str(e)}")
        finally:
            self.cleanup()

def run_store_simulator():
    """Function to run the store simulator that can be called from other scripts"""
    simulator = StoreSimulator()
    simulator.run()

if __name__ == "__main__":
    run_store_simulator()

