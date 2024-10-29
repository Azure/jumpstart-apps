import pyodbc
import json
from dotenv import load_dotenv
import os

class SqlDBHandler:
    def __init__(self):
        load_dotenv()  # Load environment variables from .env file
        self.server = os.getenv('SQL_SERVER')
        self.database = os.getenv('SQL_DATABASE')
        self.username = os.getenv('SQL_USERNAME')
        self.password = os.getenv('SQL_PASSWORD')
        self.driver = os.getenv('SQL_DRIVER', '{ODBC Driver 17 for SQL Server}')
        self.conn = None


    def connect(self):
        """Establish a connection to the SQL database"""
        try:
            connection_string = f'DRIVER={self.driver};SERVER={self.server};DATABASE={self.database};UID={self.username};PWD={self.password}'
            self.conn = pyodbc.connect(connection_string)
            print("Connected to SQL database successfully")
        except Exception as e:
            print(f"Error connecting to SQL database: {str(e)}")
            raise

    def disconnect(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()
            print("Disconnected from SQL database")

    def test_data(self, query):
        """Simulate a database connection and return test data"""
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
            }
        ]
        return json.dumps(result)

    def execute_query(self, query):
        """Execute a SQL query and return the results as JSON"""
        if not self.conn:
            self.connect()

        try:
            cursor = self.conn.cursor()
            cursor.execute(query)
            
            # Fetch column names
            columns = [column[0] for column in cursor.description]
            
            # Fetch all rows
            rows = cursor.fetchall()
            
            # Convert rows to list of dictionaries
            results = []
            for row in rows:
                results.append(dict(zip(columns, row)))
            
            # Convert to JSON
            json_results = json.dumps(results, default=str)
            
            return json_results
        except Exception as e:
            print(f"Error executing query: {str(e)}")
            raise
        finally:
            cursor.close()

    def __del__(self):
        """Destructor to ensure the database connection is closed"""
        self.disconnect()
