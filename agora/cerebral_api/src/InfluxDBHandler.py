import os
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient
from influxdb_client.client.query_api import QueryOptions

class InfluxDBHandler:
    def __init__(self):
        # Load environment variables from .env file
        load_dotenv()
        self.INFLUXDB_URL=os.getenv("INFLUXDB_URL")
        self.INFLUXDB_BUCKET=os.getenv("INFLUXDB_BUCKET")
        self.INFLUXDB_TOKEN=os.getenv("INFLUXDB_TOKEN")
        self.INFLUXDB_ORG=os.getenv("INFLUXDB_ORG")


    def execute_query_and_return_data(self, query):
        client = InfluxDBClient(url=self.INFLUXDB_URL, token=self.INFLUXDB_TOKEN, org=self.INFLUXDB_ORG)
        query_api = client.query_api(query_options=QueryOptions(profilers=["query", "operator"]))
        result = query_api.query(query=query)
        print("Query executed successfully")
    
        try:
            points = [point for table in result for point in table.records]
            if len(points) == 1:
                single_point = points
                print("Aggregation result:", single_point.get_value())
                return single_point.get_value()
            else:
                data = []
                for table in result:
                    try:
                        for record in table.records:
                            data.append({
                                '_time': record.get_time(),
                                '_field': record.get_field(),
                                '_value': record.get_value()
                            })
                    except Exception as e:
                        print(f"Error processing record: {e}")
                        continue  # Skip to the next record
        except Exception as e:
            print(f"Failed to execute query: {e}")
            print(result)
            data = result
        finally:
            client.close()

        return data