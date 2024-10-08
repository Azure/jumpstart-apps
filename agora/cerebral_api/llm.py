import os
from dotenv import load_dotenv
import openai
from openai import AzureOpenAI

class LLM:
    def __init__(self):
        # Load environment variables from .env file
        load_dotenv()
        self.api_key = os.getenv('OPENAI_API_KEY')

        self.AZURE_OPENAI_API_KEY=os.getenv("AZURE_OPENAI_API_KEY")
        self.CHATGPT_MODEL=os.getenv("CHATGPT_MODEL")
        self.AZURE_OPENAI_ENDPOINT=os.getenv("AZURE_OPENAI_ENDPOINT")
        self.OPENAI_API_VERSION=os.getenv("OPENAI_API_VERSION")
        self.INFLUXDB_BUCKET=os.getenv("INFLUXDB_BUCKET")
        
        self.REDIS_URL=os.getenv("REDIS_URL")

        # Initialize the AzureOpenAI client
        self.client = AzureOpenAI(
            azure_endpoint=self.AZURE_OPENAI_ENDPOINT, 
            api_key=self.AZURE_OPENAI_API_KEY,  
            api_version=self.OPENAI_API_VERSION
        )

    def generate_recommendations(self, question, response, result):

        conversation=[
            {
                "role": "system",
                "content": """
                I am an agent specialized in technical support for automobile manufacturing, particularly skilled in the maintenance, support, and operation of automotive assembly lines. My role is to interpret user questions with expertise, analyze production data, and provide proactive recommendations to optimize assembly line operations. Give me the Interpretation and response, including data analysis and proactive recommendations separeted in different paragraphs. Instructions:
                1. Avoid technological terms and explanations that the solution was built with such as InfluxDb, bucket, etc, keep it like an automotive manufacturing plant manager.
                2. Format should be <h3>Interpretation:</h3>Generated text <h3>Data Analysis:</h3>Generated text <h3>Proactive Recommendations:</h3>Generated text<BR></BR>."""
                
            }
        ]

        conversation.append({"role": "user", "content": f"question: {question} and data received: {result} and row data {response}"})

        response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
        
        conversation.append({"role": "system", "content": response.choices[0].message.content})
        print(response.choices[0].message.content)

        return response.choices[0].message.content


    def classify_question(self, question):
        categories = ["data", "documentation", "general"]
        
        prompt_text = f"For the below text, provide one single label each from the following categories:\n- Category: {', '.join(categories)}\n\nThe system should analyze the question and identify if it is related to data that could exist and get in a time series database in InfluxDB (e.g., statistics, metrics, performance, quality, telemetry, current variable values, etc.). If so, the system should respond with 'data'. If the question is related to manuals, troubleshooting, or how to solve a problem based on documents, it should respond with 'documentation'. For all other questions, the system should respond with 'general'. Examples: Question: What are the current metrics for our main system? Category: data Question: How can I troubleshoot the connection issue? Category: documentation\n\nQuestion: {question}\nCategory:"

        response = self.client.completions.create(
            model="gpt-35-turbo",
            prompt=prompt_text,
            temperature=0,
            max_tokens=60,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            stop=["\n"]
        )

        return response.choices[0].text.strip()
    
    def convert_question_query_influx(self, question):
        print("chat_with_openai_for_data")

        conversation = [
            {
                "role": "system",
                "content": f"""
                User submits a query regarding the manufacturing process. Generate an InfluxDB query for data from the '{self.INFLUXDB_BUCKET}' bucket using the specified fields:
                - plant, country, assembly_line, car_id, model, color, engine_type, assembly_status, shift, Drive1_Voltage, Cooler_ON, Fan001_On, Heater_ON, Pump1_Temperature_Flow, Pump2_Temperature_Flow, Pump3_Temperature_Flow, Pumps_Total_Flow, Pressure_Filter_Inlet, Pressure_Filter_Outlet, RobotPosition_J0, RobotPosition_J1, RobotPosition_J2, RobotPosition_J3, RobotPosition_J4, RobotPosition_J5, Tank_Level, Drive1_Current, Drive1_Frequency, Drive1_Speed, Drive2_Current, Drive2_Frequency, Drive2_Speed, Drive2_Voltage, Current, Voltage, Temperature, Humidity, VacuumAlert, VacuumPressure, Oiltemperature, OiltemperatureTarget, Waste, WasteReason, LostTime, LostTimeReason, LostTimeTimeCount, ScheduledBatteries, CompletedBatteries, ScheduledBatteriesPerHour, ImpactTest, VibrationTest, CellTest, DownTime, Thruput, OverallEfficiency, Availability, Performance, Quality, PlannedProductionTime, ActualRuntime, UnplannedDowntime, PlannedDowntime, PlannedQuantity, ActualQuantity, RejectedQuantity, OEE_GoalbyPlant, OEE_Mexico, OEE_BatteryA, OEE_BatteryB, OEE_BatteryC

                Instructions:

                1. Determine if the query seeks the latest data point or spans a specific time period. Default to data from the last hour if unspecified.
                2. Construct an InfluxDB query specific to the '{self.INFLUXDB_BUCKET}' bucket that includes ["_measurement"] == "assemblyline" and identifies the relevant _field for the query.
                3. If the query relates to real-time production line telemetry, Advaris, ODEN, QAD, or Quality cost, create the query. Otherwise, indicate "No data available."
                4. Provide the complete InfluxDB query or a statement on data availability.
                5. Just give me the query.
                6. Remove additional text such as comments # or " or ''' or ''' or ```
                Example Outputs:

                Query: "What is the latest Drive1 Speed at the Monterrey plant?"
                Output: from(bucket: "{self.INFLUXDB_BUCKET}") |> range(start: -1m) |> filter(fn: (r) => r["_measurement"] == "assemblyline") |> filter(fn: (r) => r["_field"] == "Drive1_Speed") |> last()
                Query: "Assembly statuses over the past two days?"
                Output: from(bucket: "{self.INFLUXDB_BUCKET}") |> range(start: -48h) |> filter(fn: (r) => r["_measurement"] == "assemblyline") |> filter(fn: (r) => r["_field"] == "assembly_status")
                Query: "What is the staff's favorite lunch?"
                Output: "No data available."
                """
            }
        ]

        conversation.append({"role": "user", "content": question})

        response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
        
        conversation.append({"role": "system", "content": response.choices[0].message.content})
        print(response.choices[0].message.content)

        clean_response = self.clean_string(response.choices[0].message.content)

        #return response.choices[0].message.content
        return clean_response

    def clean_string(self, text):
        clean_string = text.replace("```", "")
        clean_string = clean_string.replace("Output:", "")
        clean_string = clean_string.replace("Query:", "")
        return clean_string

    

    