import os
import logging
from datetime import datetime
import pyodbc
import json
from dotenv import load_dotenv
from typing import Union, List, Dict, Any

class SqlDBHandler:
    def __init__(self):
        # Configure logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Create console handler with formatting
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        
        # Load environment variables
        #load_dotenv()
        
        # Database configuration
        self.server = os.getenv('SQL_SERVER')
        self.database = os.getenv('SQL_DATABASE', 'RetailDB')
        self.username = os.getenv('SQL_USERNAME')
        self.password = os.getenv('SQL_PASSWORD')
        self.conn = None
        
        # List of available ODBC drivers to try
        self.drivers = [
            '{ODBC Driver 18 for SQL Server}',
            '{ODBC Driver 17 for SQL Server}',
            'ODBC Driver 18 for SQL Server',
            'ODBC Driver 17 for SQL Server'
        ]
        
        # Validate configuration
        if not all([self.server, self.database, self.username, self.password]):
            self.logger.error("Missing required SQL database configuration variables")
            raise ValueError("Missing required SQL configuration")

    def connect(self) -> bool:
        """
        Establish a connection to the SQL database trying different drivers.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        if self.conn and self.test_connection():
            return True
            
        for driver in self.drivers:
            try:
                conn_str = (
                    f'DRIVER={driver};'
                    f'SERVER={self.server};'
                    f'DATABASE={self.database};'
                    f'UID={self.username};'
                    f'PWD={self.password};'
                    'TrustServerCertificate=yes'
                )
                
                self.conn = pyodbc.connect(conn_str)
                self.logger.info(f"Successfully connected using driver: {driver}")
                return True
                
            except pyodbc.Error as e:
                self.logger.warning(f"Failed to connect with driver {driver}: {str(e)}")
                continue
                
        self.logger.error("Could not connect with any available driver")
        return False

    def test_connection(self) -> bool:
        """
        Test if the current connection is valid.
        
        Returns:
            bool: True if connection is valid, False otherwise
        """
        if not self.conn:
            return False
            
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            return True
        except:
            return False

    def execute_query_and_return_data(self, query: str) -> Union[str, List[Dict[str, Any]]]:
        """
        Execute a SQL query and return serialized results.
        
        Args:
            query (str): The SQL query to execute
            
        Returns:
            Union[str, List[Dict[str, Any]]]: Query results or error message
        """
        request_id = datetime.now().strftime('%Y%m%d%H%M%S')
        
        try:
            self.logger.info(f"[{request_id}] Executing query: {query}")
            
            # Ensure connection is valid
            if not self.connect():
                return "Error: Could not establish database connection"
            
            cursor = self.conn.cursor()
            
            # Execute the query
            cursor.execute(query)
            
            # Get column names
            columns = [column[0] for column in cursor.description]
            
            # Fetch results
            rows = cursor.fetchall()
            
            if not rows:
                self.logger.info(f"[{request_id}] Query returned no results")
                return "No data found for the specified query"
            
            # Convert results to list of dictionaries
            results = []
            for row in rows:
                # Convert row values to Python types
                processed_row = {}
                for i, value in enumerate(row):
                    if isinstance(value, datetime):
                        processed_row[columns[i]] = value.isoformat()
                    elif isinstance(value, (int, float, str, bool)):
                        processed_row[columns[i]] = value
                    else:
                        processed_row[columns[i]] = str(value)
                results.append(processed_row)
            
            self.logger.info(f"[{request_id}] Successfully processed {len(results)} rows")
            return results
            
        except pyodbc.ProgrammingError as pe:
            error_message = f"SQL syntax error: {str(pe)}"
            self.logger.error(f"[{request_id}] {error_message}")
            return f"Error: {error_message}"
            
        except pyodbc.Error as e:
            error_message = f"Database error: {str(e)}"
            self.logger.error(f"[{request_id}] {error_message}")
            return f"Error: {error_message}"
            
        except Exception as e:
            error_message = f"An unexpected error occurred: {str(e)}"
            self.logger.error(f"[{request_id}] {error_message}")
            return f"Error: {error_message}"
            
        finally:
            if 'cursor' in locals():
                cursor.close()

    def test_data(self, query: str) -> Union[str, List[Dict[str, Any]]]:
        """
        Process query and return data, falling back to test data if needed.
        
        Args:
            query (str): The SQL query to execute
            
        Returns:
            Union[str, List[Dict[str, Any]]]: Query results or test data
        """
        try:
            # First try to execute the actual query
            result = self.execute_query_and_return_data(query)
            
            # If result is an error message or empty, return test data
            if isinstance(result, str) or not result:
                self.logger.warning("Falling back to test data")
                test_data = [
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
                return test_data
                
            return result
            
        except Exception as e:
            self.logger.error(f"Error in test_data: {str(e)}")
            return "Error processing query"

    def cleanup(self):
        """Clean up database connection"""
        if self.conn:
            try:
                self.conn.close()
                self.logger.info("Database connection closed")
            except Exception as e:
                self.logger.error(f"Error closing database connection: {str(e)}")

    def __del__(self):
        """Destructor to ensure connection cleanup"""
        self.cleanup()