import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient
from influxdb_client.client.query_api import QueryOptions
from influxdb_client.rest import ApiException

class InfluxDBHandler:
    def __init__(self):
        # Configure logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Create console handler with formatting
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        
        # Load environment variables from .env file
        #load_dotenv()
        
        self.INFLUXDB_URL = os.getenv("INFLUXDB_URL")
        self.INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
        self.INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
        self.INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
        
        # Validate configuration
        if not all([self.INFLUXDB_URL, self.INFLUXDB_BUCKET, self.INFLUXDB_TOKEN, self.INFLUXDB_ORG]):
            self.logger.error("Missing required InfluxDB configuration variables")
            raise ValueError("Missing required InfluxDB configuration")

    def execute_query_and_return_data(self, query):
        """
        Execute an InfluxDB query and return serialized results.
        
        Args:
            query (str): The InfluxDB query to execute
            
        Returns:
            list/float/str: Query results with datetime objects properly serialized,
                           or error message if query fails
        """
        client = None
        try:
            # Extract only the Flux query if it contains explanatory text
            query_lines = query.split('\n')
            actual_query = ''
            for line in query_lines:
                if line.strip().startswith('from('):
                    actual_query = line.strip()
                    # Continue concatenating subsequent query lines
                    continue
                if actual_query and line.strip().startswith('|>'):
                    actual_query += ' ' + line.strip()

            if not actual_query:
                self.logger.error("No valid Flux query found in the input")
                return "Error: Invalid query format. Please provide a valid Flux query."

            self.logger.debug(f"Executing query: {actual_query}")
            
            client = InfluxDBClient(
                url=self.INFLUXDB_URL, 
                token=self.INFLUXDB_TOKEN, 
                org=self.INFLUXDB_ORG
            )
            
            query_api = client.query_api(
                query_options=QueryOptions(profilers=["query", "operator"])
            )
            
            result = query_api.query(query=actual_query)
            self.logger.info("Query executed successfully")
            
            # Handle the results
            points = [point for table in result for point in table.records]
            
            if not points:
                self.logger.info("Query returned no results")
                return "No data found for the specified query"
            
            if len(points) == 1:
                # Handle single value result
                value = points[0].get_value()
                if isinstance(value, datetime):
                    return value.isoformat()
                return value
            else:
                # Handle multiple results
                data = []
                for table in result:
                    for record in table.records:
                        serialized_record = self.serialize_influx_data(record)
                        if serialized_record:
                            data.append(serialized_record)
                
                return data if data else "No data could be processed from the query results"

        except ApiException as ae:
            error_message = f"InfluxDB API error: {str(ae)}"
            if "invalid" in str(ae).lower():
                error_message = "Invalid query syntax. Please check the query format."
            self.logger.error(error_message)
            return f"Error: {error_message}"
            
        except ConnectionError as ce:
            error_message = "Unable to connect to InfluxDB. Please try again later."
            self.logger.error(f"Connection error: {str(ce)}")
            return f"Error: {error_message}"
            
        except Exception as e:
            error_message = f"An unexpected error occurred: {str(e)}"
            self.logger.error(error_message)
            return f"Error: {error_message}"
            
        finally:
            if client:
                try:
                    client.close()
                except Exception as e:
                    self.logger.warning(f"Error closing client connection: {str(e)}")

    def serialize_influx_data(self, record):
        """
        Serialize an InfluxDB record, converting datetime objects to ISO format strings.
        
        Args:
            record: The InfluxDB record to serialize
            
        Returns:
            dict: Serialized record with datetime objects converted to strings
        """
        serialized = {}
        try:
            # Handle time field
            time_value = record.get_time()
            if isinstance(time_value, datetime):
                serialized['_time'] = time_value.isoformat()
            else:
                serialized['_time'] = str(time_value)

            # Handle other fields
            serialized['_field'] = record.get_field()
            value = record.get_value()
            
            # Convert datetime values to ISO format strings
            if isinstance(value, datetime):
                serialized['_value'] = value.isoformat()
            else:
                serialized['_value'] = value

            return serialized
        except Exception as e:
            self.logger.error(f"Error serializing record: {str(e)}")
            return None