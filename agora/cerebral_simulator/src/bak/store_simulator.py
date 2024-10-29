
import json
import random
from datetime import timedelta, datetime
import time
import os
from azure.eventhub import EventHubProducerClient, EventData
from dotenv import load_dotenv
import logging
from typing import List, Dict, Any

class Product:
    def __init__(self, product_id: str, product_name: str, category: str, 
                 description: str, price: float, supplier_id: str, date_added: datetime):
        self.product_id = product_id
        self.product_name = product_name
        self.category = category
        self.description = description
        self.price = price
        self.supplier_id = supplier_id
        self.date_added = date_added

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Product':
        return Product(
            product_id=data['ProductID'],
            product_name=data['ProductName'],
            category=data['Category'],
            description=data['Description'],
            price=float(data['Price']),
            supplier_id=data['SupplierID'],
            date_added=datetime.fromisoformat(data['DateAdded'])
        )

class StoreInventory:
    def __init__(self, product_id: str, store_id: str, stock_level: int, 
                 reorder_threshold: int, last_restocked: datetime):
        self.product_id = product_id
        self.store_id = store_id
        self.stock_level = stock_level
        self.reorder_threshold = reorder_threshold
        self.last_restocked = last_restocked

    def to_event_hub_message(self) -> dict:
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "INVENTORY_UPDATE",
            "store_id": self.store_id,
            "product_id": self.product_id,
            "stock_level": self.stock_level,
            "reorder_threshold": self.reorder_threshold,
            "last_restocked": self.last_restocked.isoformat()
        }

class Sale:
    def __init__(self, sale_id: str, product_id: str, store_id: str, 
                 quantity_sold: int, sale_date: datetime, sale_price: float, 
                 payment_method: str, customer_id: str, register_id: str):
        self.sale_id = sale_id
        self.product_id = product_id
        self.store_id = store_id
        self.quantity_sold = quantity_sold
        self.sale_date = sale_date
        self.sale_price = sale_price
        self.payment_method = payment_method
        self.customer_id = customer_id
        self.register_id = register_id

    def to_event_hub_message(self) -> dict:
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "SALE",
            "sale_id": self.sale_id,
            "store_id": self.store_id,
            "product_id": self.product_id,
            "quantity": self.quantity_sold,
            "sale_price": self.sale_price,
            "payment_method": self.payment_method,
            "customer_id": self.customer_id,
            "register_id": self.register_id
        }

class Order:
    def __init__(self, order_id: str, product_id: str, store_id: str, 
                 quantity: int, order_generated: datetime, delivery_date: datetime):
        self.order_id = order_id
        self.product_id = product_id
        self.store_id = store_id
        self.quantity = quantity
        self.order_generated = order_generated
        self.delivery_date = delivery_date

    def to_event_hub_message(self) -> dict:
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "ORDER",
            "order_id": self.order_id,
            "store_id": self.store_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "order_generated": self.order_generated.isoformat(),
            "delivery_date": self.delivery_date.isoformat()
        }

class StoreSimulator:
    def __init__(self):
        # Set up logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Load environment variables
        load_dotenv()
        self._load_config()
        
        # Initialize Event Hub clients
        self._initialize_event_hub()
        
        # Initialize data structures
        self.products: Dict[str, Product] = {}
        self.store_inventory: Dict[tuple, StoreInventory] = {}
        self.customers: List[str] = [f"CUST{i:04d}" for i in range(1000)]  # Sample customer IDs
        self.payment_methods = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_PAYMENT']
        self.stores = [
            {"StoreID": "CHI", "StoreName": "Chicago Store"},
            {"StoreID": "NYC", "StoreName": "New York Store"},
            {"StoreID": "LAX", "StoreName": "Los Angeles Store"},
            {"StoreID": "HOU", "StoreName": "Houston Store"}
        ]

    def _load_config(self):

        load_dotenv()

        self.EVENTHUB_CONNECTION_STRING = os.getenv('EVENTHUB_CONNECTION_STRING')
        self.ORDERS_EVENTHUB_NAME = os.getenv('ORDERS_EVENTHUB_NAME')
        self.INVENTORY_EVENTHUB_NAME = os.getenv('INVENTORY_EVENTHUB_NAME')
        self.SALES_EVENTHUB_NAME = os.getenv('SALES_EVENTHUB_NAME')
        self.HISTORICAL_DATA_DAYS = int(os.getenv('HISTORICAL_DATA_DAYS', '-1'))
        self.ORDER_FREQUENCY = int(os.getenv('ORDER_FREQUENCY', '5'))
        self.PRODUCTS_FILE = os.getenv('PRODUCTS_FILE', 'products.json')

    def _initialize_event_hub(self):
        self.orders_producer = EventHubProducerClient.from_connection_string(
            conn_str=self.EVENTHUB_CONNECTION_STRING, 
            eventhub_name=self.ORDERS_EVENTHUB_NAME
        )
        self.inventory_producer = EventHubProducerClient.from_connection_string(
            conn_str=self.EVENTHUB_CONNECTION_STRING, 
            eventhub_name=self.INVENTORY_EVENTHUB_NAME
        )
        self.sales_producer = EventHubProducerClient.from_connection_string(
            conn_str=self.EVENTHUB_CONNECTION_STRING, 
            eventhub_name=self.SALES_EVENTHUB_NAME
        )

    def load_products(self):
        if not os.path.exists(self.PRODUCTS_FILE):
            raise FileNotFoundError(f"Products file not found: {self.PRODUCTS_FILE}")

        with open(self.PRODUCTS_FILE, 'r') as file:
            products_data = json.load(file)
            self.products = {
                p['ProductID']: Product.from_dict(p) for p in products_data
            }

    def initialize_inventory(self, current_time: datetime):
        for store in self.stores:
            for product in self.products.values():
                store_inventory = StoreInventory(
                    product_id=product.product_id,
                    store_id=store['StoreID'],
                    stock_level=random.randint(50, 200),
                    reorder_threshold=random.randint(20, 40),
                    last_restocked=current_time
                )
                self.store_inventory[(product.product_id, store['StoreID'])] = store_inventory
                self._send_inventory_update(store_inventory)

    def _send_inventory_update(self, inventory: StoreInventory):
        event_data = EventData(json.dumps(inventory.to_event_hub_message()))
        self.inventory_producer.send_batch([event_data])

    def _send_sale_update(self, sale: Sale):
        event_data = EventData(json.dumps(sale.to_event_hub_message()))
        self.sales_producer.send_batch([event_data])

    def _send_order_update(self, order: Order):
        event_data = EventData(json.dumps(order.to_event_hub_message()))
        self.orders_producer.send_batch([event_data])

    def generate_sales(self, current_time: datetime):
        # Determine number of sales based on time of day and day of week
        day_name = current_time.strftime('%A')
        num_sales = self._calculate_sales_volume(current_time, day_name)
        
        for _ in range(num_sales):
            try:
                # Select random store and product
                store = random.choice(self.stores)
                product = random.choice(list(self.products.values()))
                inventory = self.store_inventory.get((product.product_id, store['StoreID']))
                
                if not inventory or inventory.stock_level <= 0:
                    continue

                # Generate sale details
                quantity_sold = random.randint(1, min(5, inventory.stock_level))
                sale_price = round(product.price * random.uniform(0.9, 1.1), 2)  # ±10% of product price
                
                sale = Sale(
                    sale_id=f"SALE-{current_time.strftime('%Y%m%d%H%M%S')}-{random.randint(1000,9999)}",
                    product_id=product.product_id,
                    store_id=store['StoreID'],
                    quantity_sold=quantity_sold,
                    sale_date=current_time,
                    sale_price=sale_price,
                    payment_method=random.choice(self.payment_methods),
                    customer_id=random.choice(self.customers),
                    register_id=f"REG-{random.randint(1,5):02d}"
                )

                # Update inventory
                inventory.stock_level -= quantity_sold
                
                # Send updates to Event Hub
                self._send_sale_update(sale)
                self._send_inventory_update(inventory)
                
                # Check if reorder is needed
                if inventory.stock_level <= inventory.reorder_threshold:
                    self._generate_order(inventory, current_time)
                
            except Exception as e:
                self.logger.error(f"Error generating sale: {str(e)}")

    def _calculate_sales_volume(self, current_time: datetime, day_name: str) -> int:
        """Calculate number of sales based on time and day"""
        hour = current_time.hour
        
        if day_name in ['Saturday', 'Sunday']:
            if 8 <= hour < 20:
                return random.randint(20, 50)
            elif 6 <= hour < 22:
                return random.randint(10, 20)
            else:
                return random.randint(1, 5)
        else:
            if 8 <= hour < 20:
                return random.randint(10, 30)
            elif 6 <= hour < 22:
                return random.randint(5, 10)
            else:
                return random.randint(1, 5)

    def _generate_order(self, inventory: StoreInventory, current_time: datetime):
        """Generate a restock order when inventory is low"""
        try:
            # Calculate order quantity (restock to 2x threshold)
            order_quantity = (inventory.reorder_threshold * 2) - inventory.stock_level
            
            # Generate delivery date (1-3 days from order)
            delivery_date = current_time + timedelta(days=random.randint(1, 3))
            
            order = Order(
                order_id=f"ORDER-{current_time.strftime('%Y%m%d%H%M%S')}-{random.randint(1000,9999)}",
                product_id=inventory.product_id,
                store_id=inventory.store_id,
                quantity=order_quantity,
                order_generated=current_time,
                delivery_date=delivery_date
            )
            
            self._send_order_update(order)
            
            # Schedule inventory update for delivery date
            inventory.last_restocked = delivery_date
            inventory.stock_level += order_quantity
            
        except Exception as e:
            self.logger.error(f"Error generating order: {str(e)}")

    def run(self):
        """Main simulation loop"""
        try:
            self.logger.info("Starting store simulator...")
            
            # Load initial data
            self.load_products()
            self.logger.info(f"Loaded {len(self.products)} products")
            
            # Calculate start time for historical data
            start_time = datetime.now() + timedelta(days=self.HISTORICAL_DATA_DAYS)
            
            # Initialize inventory
            self.initialize_inventory(start_time)
            self.logger.info("Initial inventory generated")
            
            # Generate historical data
            current_time = start_time
            while current_time < datetime.now():
                self.logger.info(f"Generating historical data for: {current_time}")
                self.generate_sales(current_time)
                current_time += timedelta(minutes=self.ORDER_FREQUENCY)
            
            # Generate real-time data
            self.logger.info("Starting real-time data generation")
            while True:
                current_time = datetime.now()
                self.logger.info(f"Generating real-time data for: {current_time}")
                self.generate_sales(current_time)
                time.sleep(self.ORDER_FREQUENCY * 60)
                
        except KeyboardInterrupt:
            self.logger.info("Received keyboard interrupt, shutting down...")
        except Exception as e:
            self.logger.error(f"Error in simulation: {str(e)}")
        finally:
            self.cleanup()

    def cleanup(self):
        """Cleanup resources"""
        self.logger.info("Closing Event Hub producers...")
        self.orders_producer.close()
        self.inventory_producer.close()
        self.sales_producer.close()
        self.logger.info("Store simulator terminated")

    def run_store_simulator():
        """Function to run the store simulator that can be called from other scripts"""
        simulator = StoreSimulator()
        simulator.run()

    if __name__ == "__main__":
        run_store_simulator()
