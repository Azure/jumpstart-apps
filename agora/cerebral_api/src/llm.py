import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI

class LLM:
    def __init__(self):
        # Load environment variables from .env file
        load_dotenv()
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
        self.CHATGPT_MODEL = os.getenv("CHATGPT_MODEL")
        self.AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION")
        self.INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
        self.REDIS_URL = os.getenv("REDIS_URL")
        self.SQL_DATABASENAME = os.getenv("SQL_DATABASENAME")

        # Initialize the AzureOpenAI client
        self.client = AzureOpenAI(
            azure_endpoint=self.AZURE_OPENAI_ENDPOINT, 
            api_key=self.AZURE_OPENAI_API_KEY,  
            api_version=self.OPENAI_API_VERSION
        )

        # Load prompts from JSON configuration file
        self.prompts = self.load_prompts('prompts.json')

    def load_prompts(self, file_path):
        with open(file_path, 'r') as file:
            return json.load(file)

    def get_prompt(self, prompt_key, industry, role):
        industry_prompts = self.prompts['industries'].get(industry, self.prompts['industries']['default'])
        
        #print(industry_prompts + "\n")
        role_prompts = industry_prompts['roles'].get(role, industry_prompts['roles']['default'])
        #print(role_prompts + "\n")
        return role_prompts.get(prompt_key, self.prompts['industries']['default']['roles']['default'][prompt_key])

    def generate_recommendations(self, question, response, result, industry, role):
        system_content = self.get_prompt('generate_recommendations', industry, role)
        
        conversation = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": f"question: {question} and data received: {result} and row data {response}"}
        ]

        response = self.client.chat.completions.create(
            model=self.CHATGPT_MODEL,
            messages=conversation
        )
        
        print(response.choices[0].message.content)
        return response.choices[0].message.content

    def classify_question(self, question, industry, role):
        categories = ["data", "documentation", "general"]
        prompt_text = self.get_prompt('classify_question', industry, role).format(
            categories=', '.join(categories),
            question=question
        )

        print(prompt_text)

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
        
        print(response.choices[0].text.strip())
        return response.choices[0].text.strip()
    
    def convert_question_query_influx(self, question, industry, role):
        print("convert_question_query_influx")

        system_content = self.get_prompt('convert_question_query_influx', industry, role).format(
            INFLUXDB_BUCKET=self.INFLUXDB_BUCKET
        )
        print("STEP 1 \n")
        print(system_content)

        conversation = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": question}
        ]
        print("STEP 2 \n")
        print(conversation)

        conversation.append({"role": "user", "content": question})

        response = self.client.chat.completions.create(
            model=self.CHATGPT_MODEL,
            messages=conversation
        )

        conversation.append({"role": "system", "content": response.choices[0].message.content})
        
        print("STEP 3 \n")
        print(response.choices[0].message.content)
        clean_response = self.clean_string(response.choices[0].message.content)
        return clean_response


    def convert_question_query_sql(self, question, industry, role):
        print("LLM convert_question_query_sql")
        try:
            system_content = self.get_prompt('convert_question_query_sql', industry, role)
            if isinstance(system_content, str):
                system_content = system_content.format(DATABASE_NAME=self.SQL_DATABASENAME)
            else:
                print(f"Unexpected prompt type: {type(system_content)}")
                system_content = f"Generate a SQL query for the database {self.SQL_DATABASENAME} based on the following question."
        except Exception as e:
            print(f"Error formatting prompt: {str(e)}")
            system_content = f"Generate a SQL query for the database {self.SQL_DATABASENAME} based on the following question."

        print("STEP 1 \n")
        print(system_content)

        conversation = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": question}
        ]

        print("STEP 2 \n")
        print(conversation)

        try:
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )

            print("STEP 3 \n")
            print(response.choices[0].message.content)
            clean_response = self.clean_string(response.choices[0].message.content)
            return clean_response
        except Exception as e:
            print(f"Error in OpenAI API call: {str(e)}")
            return "Error generating SQL query."

    def clean_string(self, text):
        clean_string = text.replace("```", "")
        clean_string = clean_string.replace("Output:", "")
        clean_string = clean_string.replace("Query:", "")
        return clean_string

    

    