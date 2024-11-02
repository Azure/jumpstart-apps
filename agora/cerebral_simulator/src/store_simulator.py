import os
import json
import random
import time
import logging
from datetime import timedelta, datetime
from azure.eventhub import EventHubProducerClient, EventData
import paho.mqtt.client as mqtt

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

        # MQTT Settings
        MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
        MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

        self.mqtt_client = mqtt.Client()
        self.mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
        
        # Initialize Event Hub clients
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

            if os.getenv("VERBOSE", "False").lower() == "true":
                self.logger.info(f"Data for {mqtt_topic} published to MQTT: {staging_event}")

        except Exception as e:
            self.logger.error(f"Error publishing data to MQTT for {mqtt_topic}: {str(e)}")

    def generate_inventory_data(self, current_time, destination="EventHub"):
        for store in self.store_details:
            for product in self.products_list:
                product_price = round(random.uniform(product.price_range.min, product.price_range.max), 2)
                product_inventory = ProductInventory(
                    date_time=current_time,
                    store_id=store["store_id"],
                    product_id=product.product_id,
                    retail_price=product_price,
                    in_stock=product.stock,
                    reorder_threshold = int(product.stock - product.stock * 0.8),
                    last_restocked = current_time - timedelta(days=random.randint(1, 30))
                )

                self.current_inventory[(product_inventory.store_id, product_inventory.product_id)] = product_inventory

                # Send inventory data to event hub or MQTT
                simulation_data = json.dumps(product_inventory.to_dict())
                if (destination == "EventHub"):
                    self.send_inventory_to_event_hub(simulation_data)
                else:
                    self.publish_data_to_mqtt(simulation_data, "topic/inventory")

    def simulate_order_data(self, current_time, destination="EventHub"):
        # Convert time string
        day_name = current_time.strftime('%A')
        current_time_str = str(current_time)

        # Determine number of random orders based on day and time
        randomOrders = 0
        if day_name in ['Saturday', 'Sunday']:
            if current_time.hour > 8 and current_time.hour < 20:
                randomOrders = random.randint(20, 50)
            elif current_time.hour > 6 and current_time.hour < 22:
                randomOrders = random.randint(10, 20)
            else:
                randomOrders = random.randint(1, 5)
        else:
            if current_time.hour > 8 and current_time.hour < 20:
                randomOrders = random.randint(10, 30)
            elif current_time.hour > 6 and current_time.hour < 22:
                randomOrders = random.randint(5, 10)
            else:
                randomOrders = random.randint(1, 5)

        product_count = len(self.products_list)
        for orderIndex in range(1, randomOrders + 1):
            store_index = random.randint(0, len(self.store_details) - 1)
            order_id = current_time.strftime('%Y%m%d%H%M%S-') + '{:03d}'.format(orderIndex)

            line_item_count = random.randint(1, product_count)
            product_indexes = []
            while len(product_indexes) < line_item_count:
                product_index = random.randint(0, product_count - 1)
                if product_index not in product_indexes:
                    product_indexes.append(product_index)

            # Define different profit margins to apply for each product sale
            profit_choices = random.sample(range(-20, 30), 5)

            for product_index in product_indexes:
                product = self.products_list[product_index]
                quantity_sold = random.randint(1, 10)

                # Update inventory with sold quantity
                product_inventory = self.current_inventory[
                    self.store_details[store_index]['store_id'], 
                    product.product_id
                ]

                if product_inventory.in_stock > quantity_sold:
                    product_inventory.in_stock = product_inventory.in_stock - quantity_sold
                else:
                    product_inventory.in_stock = product_inventory.in_stock + product.stock - quantity_sold
                    product_inventory.last_restocked = current_time

                # Update inventory date
                product_inventory.date_time = current_time
                self.current_inventory[(product_inventory.store_id, product_inventory.product_id)] = product_inventory

                # Send updated inventory to event hub or MQTT
                simulation_data = json.dumps(product_inventory.to_dict())
                if (destination == "EventHub"):
                    self.send_inventory_to_event_hub(simulation_data)
                else:
                    self.publish_data_to_mqtt(simulation_data, "topic/inventory")

                discount = random.choice(self.product_discount) / 100
                line_item_total_price = round(product_inventory.retail_price * quantity_sold * (1 - discount), 2)
                profit = round(line_item_total_price * random.choice(profit_choices) / 100, 2)
                line_item = {
                    'sale_id': order_id,
                    'sale_date': current_time_str,
                    'store_id': self.store_details[store_index]['store_id'],
                    'store_city': self.store_details[store_index]['city'],
                    'product_id': product.product_id,
                    'product_category': product.category,
                    'product_name': product.name,
                    'price': product_inventory.retail_price,
                    'discount': discount,
                    'quantity': quantity_sold,
                    'item_total': line_item_total_price,
                    'profit': profit,
                    'payment_method': random.choice(self.payment_methods),
                    'customer_id': 'C-001',
                    'register_id': random.choice(self.store_registers),
                }

                # Send sales data to event hub
                if (destination == "EventHub"):
                    self.send_orders_to_event_hub(json.dumps(line_item))
                else:
                    self.publish_data_to_mqtt(json.dumps(line_item), "topic/sales")

    def send_inventory_to_event_hub(self, simulation_data):
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
        staging_event = {
        "source": "simulator",
        "subject": "topic/sales",
        "event_data": json.loads(simulation_data)
        }

        event_data = EventData(json.dumps(staging_event))
        self.orders_producer.send_batch([event_data])
        if os.getenv("VERBOSE", "False").lower() == "true":
            self.logger.info(f"Sent order data: {simulation_data}")

    def cleanup(self):
        self.logger.info("Closing Event Hub producers...")
        self.orders_producer.close()
        self.inventory_producer.close()

    def run(self):
        try:
            self.logger.info("Starting store simulator...")
            # Load products
            self.load_products()
            self.logger.info(f"Loaded {len(self.products_list)} products")

            # Generate batch and continue with live data
            production_datetime = datetime.now() + timedelta(days=self.HISTORICAL_DATA_DAYS)

            # Generate initial inventory
            self.logger.info("Generating initial inventory...")
            self.generate_inventory_data(production_datetime)

            # Process historical data
            self.logger.info("Processing historical data...")
            while production_datetime <= datetime.now():
                self.logger.info(f'Generating data for: {production_datetime}')
                self.simulate_order_data(production_datetime, destination="EventHub")
                production_datetime += timedelta(minutes=self.ORDER_FREQUENCY)  # Increment by ORDER_FREQUENCY minutes

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

