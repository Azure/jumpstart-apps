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
from threading import Thread


#DEV_MODE
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
    def __init__(self, date_time, product_id, store_id, retail_price, in_stock, reorder_threshold, last_restocked, product_name=""):
        self.date_time = date_time
        self.product_id = product_id
        self.store_id = store_id
        self.retail_price = retail_price
        self.in_stock = in_stock
        self.reorder_threshold = reorder_threshold
        self.last_restocked = last_restocked
        self.product_name = product_name

    def __repr__(self):
        return f"ProductInventory(date_time={self.date_time}, product_id={self.product_id}, store_id={self.store_id}, retail_price={self.retail_price}, in_stock={self.in_stock}, reorder_threshold={self.reorder_threshold}, last_restocked={self.last_restocked}, product_name={self.product_name})"

    def to_dict(self):
        return {
            "date_time": self.date_time.isoformat(),
            "product_id": self.product_id,
            "store_id": self.store_id,
            "retail_price": self.retail_price,
            "in_stock": self.in_stock,
            "reorder_threshold": self.reorder_threshold,
            "last_restocked": self.last_restocked.isoformat(),
            "product_name": self.product_name
        }

class StoreSimulator:
    def __init__(self):
        # Set up logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # DEV_MODE
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
        self.SQL_PASSWORD = os.getenv("SQL_PASSWORD", "ArcPassword123!!")
        self.ENABLE_SQL = os.getenv("ENABLE_SQL", "True").lower() == "true"
        self.ENABLE_HISTORICAL = os.getenv("ENABLE_HISTORICAL", "True").lower() == "true"
        # MQTT Settings
        self.MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
        self.MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

        # Initialize connections with error handling
        self.sql_conn = None
        self.mqtt_client = None
        self.orders_producer = None
        self.inventory_producer = None

        # Try to initialize SQL if enabled
        if self.ENABLE_SQL:
            try:
                self.init_database()
            except Exception as e:
                self.logger.error(f"Failed to initialize SQL connection: {str(e)}")
                self.ENABLE_SQL = False

        # Try to initialize MQTT
        try:
            self.init_mqtt()
        except Exception as e:
            self.logger.error(f"Failed to initialize MQTT connection: {str(e)}")
            self.mqtt_client = None

        # Try to initialize Event Hub if historical data is enabled
        if self.ENABLE_HISTORICAL:
            try:
                self.init_event_hub()
            except Exception as e:
                self.logger.error(f"Failed to initialize Event Hub: {str(e)}")
                self.ENABLE_HISTORICAL = False


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

    def init_mqtt(self):
        """Initialize MQTT connection"""
        try:
            self.mqtt_client = mqtt.Client()
            self.mqtt_client.connect(self.MQTT_BROKER, self.MQTT_PORT)
            self.mqtt_client.loop_start()
            self.logger.info("Successfully connected to MQTT broker")
        except Exception as e:
            self.logger.error(f"Error connecting to MQTT: {str(e)}")
            raise

    def init_event_hub(self):
        """Initialize Event Hub connections"""
        try:
            self.orders_producer = EventHubProducerClient.from_connection_string(
                conn_str=self.EVENTHUB_CONNECTION_STRING,
                eventhub_name=self.ORDERS_EVENTHUB_NAME
            )
            self.inventory_producer = EventHubProducerClient.from_connection_string(
                conn_str=self.EVENTHUB_CONNECTION_STRING,
                eventhub_name=self.INVENTORY_EVENTHUB_NAME
            )
            self.logger.info("Successfully connected to Event Hub")
        except Exception as e:
            self.logger.error(f"Error connecting to Event Hub: {str(e)}")
            raise

    def add_order(self, order_data):
        """Add order to recent orders list"""
        self.recent_orders.append(order_data)
        # keep only the recent orders
        if len(self.recent_orders) > self.max_orders_history:
            self.recent_orders.pop(0)


    def init_database(self):
        """Print configuration values grouped by category"""
        print("\n=== EventHub Configuration ===")
        print(f"Connection String: {self.EVENTHUB_CONNECTION_STRING}")
        print(f"Orders EventHub: {self.ORDERS_EVENTHUB_NAME}")
        print(f"Inventory EventHub: {self.INVENTORY_EVENTHUB_NAME}")
        
        print("\n=== Data Configuration ===")
        print(f"Historical Data Days: {self.HISTORICAL_DATA_DAYS}")
        print(f"Order Frequency: {self.ORDER_FREQUENCY}")
        print(f"Products File: {self.PRODUCTS_FILE}")
        
        print("\n=== SQL Configuration ===")
        print(f"Server: {self.SQL_SERVER}")
        print(f"Database: {self.SQL_DATABASE}")
        print(f"Username: {self.SQL_USERNAME}")
        print(f"Password: {self.SQL_PASSWORD}")
        
        print("\n=== Feature Flags ===")
        print(f"SQL Enabled: {self.ENABLE_SQL}")
        print(f"Historical Enabled: {self.ENABLE_HISTORICAL}")
        
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
        
        if self.mqtt_client is None:
            self.logger.error("MQTT client is None, attempting reconnection")
            try:
                self.init_mqtt()
            except:
                return
        try:
            staging_event = json.dumps({
            "source": "simulator",
            "subject": topic,
            "event_data": json.loads(simulation_data)
            })

            # mqtt_topic = "topic/commercial"
            result = self.mqtt_client.publish(topic, staging_event)
            if result.rc != 0:
                self.logger.error(f"Failed to publish to MQTT: {result.rc}")
                return

            if os.getenv("VERBOSE", "False").lower() == "true":
                self.logger.info(f"Data published to MQTT topic {topic}: {staging_event}")

            # Save to SQL Server
            if self.ENABLE_SQL and self.sql_conn:
                try:
                    event_data = json.loads(simulation_data)
                    if topic == "topic/inventory":
                        self.save_to_sql("inventory", event_data)
                    elif topic == "topic/sales":
                        self.save_to_sql("sales", event_data)
                except Exception as e:
                    self.logger.error(f"Error saving to SQL: {str(e)}")
                

            if os.getenv("VERBOSE", "False").lower() == "true":
                self.logger.info(f"Data for {topic} published to MQTT: {staging_event}")

        except Exception as e:
            self.logger.error(f"Error publishing to MQTT: {str(e)}")
            # Try to reconnect
            try:
                self.init_mqtt()
            except:
                pass

    def cleanup(self):
        """Cleanup resources"""
        if self.sql_conn:
            try:
                self.sql_conn.close()
                self.logger.info("SQL Server connection closed")
            except Exception as e:
                self.logger.error(f"Error closing SQL connection: {str(e)}")

        if self.mqtt_client:
            try:
                self.mqtt_client.disconnect()
                self.logger.info("MQTT connection closed")
            except Exception as e:
                self.logger.error(f"Error closing MQTT connection: {str(e)}")

        if self.ENABLE_HISTORICAL:
            try:
                if self.orders_producer:
                    self.orders_producer.close()
                if self.inventory_producer:
                    self.inventory_producer.close()
                self.logger.info("Event Hub connections closed")
            except Exception as e:
                self.logger.error(f"Error closing Event Hub connections: {str(e)}")

    

    def generate_inventory_data(self, current_time, destination="MQTT"):
        """Generate initial inventory data for all stores and products"""
        #self.logger.info(f" ******* Product list {self.products_list}")
        try:
            for store in self.store_details:
                for product in self.products_list:
                    try:
                        product_price = round(random.uniform(product.price_range.min, product.price_range.max), 2)
                        self.logger.info(f"******** Product name for product_id {product.product_id}: {product.name}")
                        
                        product_inventory = ProductInventory(
                            date_time=current_time,
                            store_id=store["store_id"],
                            product_id=str(product.product_id), 
                            retail_price=product_price,
                            in_stock=product.stock,
                            reorder_threshold=int(product.stock * 0.2),
                            last_restocked=current_time - timedelta(days=random.randint(1, 30)),
                            product_name=product.name
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

    def generate_order(self, current_time, store, products):
        """
        Generate a single order with multiple items
        
        Args:
            current_time: DateTime for the order
            store: Store dictionary containing store details
            products: List of available products
            
        Returns:
            list: List of order items or None if error occurs
        """
        try:
            current_time_str = str(current_time)
            order_id = current_time.strftime('%Y%m%d%H%M%S-') + '{:03d}'.format(random.randint(1, 999))
            order_items = []
            
            # Generate random profit margins for this order
            profit_choices = random.sample(range(-20, 30), 5)
            
            # Select random products for this order (1-5 products)
            selected_products = random.sample(products, random.randint(1, min(5, len(products))))

            for product in selected_products:
                # Generate random quantity for this product
                quantity_sold = random.randint(1, 10)
                inventory_key = (store["store_id"], str(product.product_id))

                # Create or get inventory for this product
                if inventory_key not in self.current_inventory:
                    product_price = round(random.uniform(product.price_range.min, product.price_range.max), 2)
                    self.current_inventory[inventory_key] = ProductInventory(
                        date_time=current_time,
                        store_id=store["store_id"],
                        product_id=str(product.product_id),
                        product_name=product.name,
                        retail_price=product_price,
                        in_stock=product.stock,
                        reorder_threshold=int(product.stock * 0.2),
                        last_restocked=current_time
                    )

                product_inventory = self.current_inventory[inventory_key]

                # Update inventory levels
                if product_inventory.in_stock > quantity_sold:
                    product_inventory.in_stock -= quantity_sold
                else:
                    # Restock if not enough inventory
                    product_inventory.in_stock = product.stock - quantity_sold
                    product_inventory.last_restocked = current_time

                product_inventory.date_time = current_time
                self.current_inventory[inventory_key] = product_inventory

                # Calculate order item details
                discount = random.choice(self.product_discount) / 100
                line_item_total_price = round(product_inventory.retail_price * quantity_sold * (1 - discount), 2)
                profit = round(line_item_total_price * random.choice(profit_choices) / 100, 2)

                # Create order item
                order_item = {
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
                order_items.append(order_item)

            return order_items
        except Exception as e:
            self.logger.error(f"Error generating order: {str(e)}")
            return None

    def simulate_order_data(self, current_time, destination="MQTT", save_to_sql=False):
        """
        Simulate order data for the given time
        
        Args:
            current_time: DateTime to generate orders for
            destination: Where to send the data ("MQTT" or "EventHub")
            save_to_sql: Whether to save the data to SQL (default: False)
        """
        try:
            # Calculate number of orders based on day and time
            day_name = current_time.strftime('%A')
            randomOrders = self.calculate_random_orders(current_time, day_name)
            
            # Generate all orders
            all_orders = []
            for _ in range(randomOrders):
                store = random.choice(self.store_details)
                order_items = self.generate_order(current_time, store, self.products_list)
                if order_items:
                    all_orders.extend(order_items)

            # Store in SQL if enabled and requested
            if save_to_sql and self.ENABLE_SQL and all_orders:
                sql_orders = random.sample(all_orders, min(5, len(all_orders)))
                for order in sql_orders:
                    self.save_to_sql("sales", order)
                self.logger.info(f"Saved {len(sql_orders)} orders to SQL")

            # Send all orders to MQTT/EventHub
            for order in all_orders:
                # Add to recent orders memory
                self.add_order({
                    "timestamp": order['sale_date'],
                    "order_data": order
                })

                # Send to appropriate destination
                simulation_data = json.dumps(order)
                if destination == "EventHub":
                    self.send_orders_to_event_hub(simulation_data)
                else:
                    self.logger.info(f"Publishing order to MQTT topic/sales: {order['sale_id']}")
                    self.publish_data_to_mqtt(simulation_data, "topic/sales")

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
        if not self.ENABLE_HISTORICAL or self.inventory_producer is None:
            return
        
        try:
            staging_event = {
                "source": "simulator",
                "subject": "topic/inventory",
                "event_data": json.loads(simulation_data)
            }

            event_data = EventData(json.dumps(staging_event))
            self.inventory_producer.send_batch([event_data])
        except Exception as e:
            self.logger.error(f"Error sending to Event Hub: {str(e)}")
            # Try to reconnect
            try:
                self.init_event_hub()
            except:
                self.ENABLE_HISTORICAL = False

    def send_orders_to_event_hub(self, simulation_data):
        if not self.ENABLE_HISTORICAL or self.orders_producer is None:
            return
        
        try:
            staging_event = {
                "source": "simulator",
                "subject": "topic/sales",
                "event_data": json.loads(simulation_data)
            }

            event_data = EventData(json.dumps(staging_event))
            self.orders_producer.send_batch([event_data])
        except Exception as e:
            self.logger.error(f"Error sending to Event Hub: {str(e)}")
            # Try to reconnect
            try:
                self.init_event_hub()
            except:
                self.ENABLE_HISTORICAL = False

    def run_historical_data(self, start_datetime):
        """Process historical data in parallel"""
        try:
            current_datetime = start_datetime
            while current_datetime <= datetime.now():
                self.logger.info(f'Generating historical data for: {current_datetime}')
                self.simulate_order_data(current_datetime, destination="EventHub")
                current_datetime += timedelta(minutes=self.ORDER_FREQUENCY)
        except Exception as e:
            self.logger.error(f"Error processing historical data: {str(e)}")

    def run(self):
        try:
            self.logger.info("Starting store simulator...")
            self.load_products()
            self.logger.info(f"Loaded {len(self.products_list)} products")

            # Calculate start time for historical data
            historical_start = datetime.now() + timedelta(days=self.HISTORICAL_DATA_DAYS)

            # Start historical processing in a separate thread if enabled
            historical_thread = None
            if self.ENABLE_HISTORICAL:
                self.logger.info("Starting historical data processing...")
                historical_thread = Thread(
                    target=self.run_historical_data,
                    args=(historical_start,),
                    daemon=True
                )
                historical_thread.start()

            last_sql_save = datetime.now()
            
            # Generate live data
            self.logger.info("Starting live data generation...")
            while True:
                current_time = datetime.now()
                
                try:
                    # Generate and send data to MQTT continuously
                    self.simulate_order_data(current_time, destination="MQTT", save_to_sql=False)
                    
                    # Every minute, save to SQL
                    if (current_time - last_sql_save).seconds >= 60:
                        self.logger.info(f'Saving batch to SQL at: {current_time}')
                        self.simulate_order_data(current_time, destination="MQTT", save_to_sql=True)
                        last_sql_save = current_time
                    
                    # Small sleep to prevent overwhelming the system
                    time.sleep(random.uniform(8, 12))
                    
                except Exception as e:
                    self.logger.error(f"Error generating live data: {str(e)}")
                    time.sleep(5)  # Wait a bit on error

        except KeyboardInterrupt:
            self.logger.info("Received keyboard interrupt, shutting down...")
        except Exception as e:
            self.logger.error(f"Error in store simulator: {str(e)}")
        finally:
            if historical_thread and historical_thread.is_alive():
                self.logger.info("Waiting for historical processing to complete...")
                historical_thread.join(timeout=5)
            self.cleanup()
        
    #End class


def run_store_simulator():
    """Function to run the store simulator that can be called from other scripts"""
    simulator = StoreSimulator()
    simulator.run()

if __name__ == "__main__":
    run_store_simulator()

