import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI

class LLM:
    def __init__(self):
        # Load environment variables from .env file
        #load_dotenv()
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
        self.CHATGPT_MODEL = os.getenv("CHATGPT_MODEL")
        self.AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION")
        self.INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
        self.SQL_DATABASE = os.getenv("SQL_DATABASE", "RetailDB")
        self.REDIS_URL = os.getenv("REDIS_URL")

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
        try:
            industry_prompts = self.prompts['industries'].get(industry, self.prompts['industries']['default'])
            role_prompts = industry_prompts['roles'].get(role, industry_prompts['roles']['default'])
            prompt = role_prompts.get(prompt_key, self.prompts['industries']['default']['roles']['default'][prompt_key])
            return prompt
        except Exception as e:
            print(f"Error in get_prompt: {str(e)}")
            return f"Default prompt: Please provide a response for {prompt_key} considering the {industry} industry and {role} role."

    def classify_question(self, question, industry, role):
        categories = ["data", "relational", "documentation"]
        prompt_text = self.get_prompt('classify_question', industry, role).format(
            categories=', '.join(categories),
            question=question
        )

        print(prompt_text)
        
        try:
            response = self.client.completions.create(
                model="gpt-35-turbo",
                prompt=prompt_text,
                temperature=0,
                max_tokens=1,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0,
                stop=["\n"]
            )
            return response.choices[0].text.strip()
        except Exception as e:
            print(f"Error in classify_question: {str(e)}")
            return "unknown"

    def convert_question_query_influx(self, question, industry, role):
        print("chat_with_openai_for_influx_data")

        system_content = self.get_prompt('convert_question_query_influx', industry, role).format(
            INFLUXDB_BUCKET=self.INFLUXDB_BUCKET
        )

        conversation = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": question}
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
            return self.clean_string(response.choices[0].message.content)
        except Exception as e:
            print(f"Error in convert_question_query_influx: {str(e)}")
            return "Error generating InfluxDB query."

    def convert_question_query_sql(self, question, industry, role):
        print("chat_with_openai_for_sql_data")

        system_content = self.get_prompt('convert_question_query_sql', industry, role).format(
            DATABASE_NAME=self.SQL_DATABASE
        )
        
        print("system_content {0}\n",system_content)

        conversation = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": question}
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
            return self.clean_string(response.choices[0].message.content)
        except Exception as e:
            print(f"Error in convert_question_query_sql: {str(e)}")
            return "Error generating SQL query."

    def generate_recommendations(self, question, query, result, industry, role):
        system_content = self.get_prompt('generate_recommendations', industry, role)
        
        conversation = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": f"Question: {question}\nQuery: {query}\nResult: {result}"}
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error in generate_recommendations: {str(e)}")
            return "Error generating recommendations."

    def chat_llm(self, question, industry, role):
        system_content = self.get_prompt('documentation_query', industry, role)
        formatted_prompt = system_content.format(industry=industry, role=role, question=question)

        print(formatted_prompt)
        
        conversation = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": question}
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error in chat_llm: {str(e)}")
            return "Error generating response."

    def clean_string(self, text):
        if not isinstance(text, str):
            return str(text)
        clean_string = text.replace("```sql", "").replace("```", "").strip()
        clean_string = clean_string.replace("Output:", "").replace("Query:", "").strip()
        return clean_string