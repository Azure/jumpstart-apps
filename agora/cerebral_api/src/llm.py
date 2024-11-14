import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI
import uuid
import time
import logging

#DEV_MODE
#from dotenv import load_dotenv
#load_dotenv()

# Global configuration variables
VERBOSE = os.getenv("VERBOSE", "false").lower() == "true"
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

def configure_logging() -> None:
    """Configure logging based on VERBOSE setting."""
    # Configure basic logging
        
    logging.basicConfig(
        level=logging.DEBUG if VERBOSE else logging.INFO,
        format=LOG_FORMAT
    )
        
    # Create logger for this module
    logger = logging.getLogger(__name__)
        
    # Log initial configuration
    if VERBOSE:
        logger.debug("Verbose logging enabled")
        
    return logger

# Initialize logger
logger = configure_logging()

class LLM:
    def __init__(self):
        
        self.AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
        self.CHATGPT_MODEL = os.getenv("CHATGPT_MODEL")
        self.AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION")
        self.INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
        self.SQL_DATABASE = os.getenv("SQL_DATABASE", "RetailDB")

        # Initialize the AzureOpenAI client
        self.client = AzureOpenAI(
            azure_endpoint=self.AZURE_OPENAI_ENDPOINT, 
            api_key=self.AZURE_OPENAI_API_KEY,  
            api_version=self.OPENAI_API_VERSION
        )

        # Load prompts from JSON configuration file
        self.prompts = self.load_prompts('prompts.json')

        # Add conversation history storage
        self.conversations = {}  # Dictionary to store conversations by session ID
        self.max_history = 10   # Maximum number of messages to keep in history

    def _get_or_create_conversation(self, session_id: str) -> list:
        """
        Get or create a conversation history for a session.
        
        Args:
            session_id (str): The unique session identifier
            
        Returns:
            list: The conversation history for this session
        """
        if session_id not in self.conversations:
            self.conversations[session_id] = []
        return self.conversations[session_id]
        
    def add_to_conversation(self, session_id: str, role: str, content: str):
        """
        Add a message to the conversation history.
        
        Args:
            session_id (str): The unique session identifier
            role (str): The role of the message sender ("user" or "assistant")
            content (str): The message content
        """
        history = self._get_or_create_conversation(session_id)
        history.append({"role": role, "content": content})
        
        # Keep only the last max_history messages
        if len(history) > self.max_history:
            history.pop(0)

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

    def classify_question(self, question: str, industry: str, role: str) -> str:
        """
        Classify the question into predefined categories.
        
        Args:
            question: The question to classify
            industry: The industry context
            role: The role context
            
        Returns:
            str: The classified category
        """
        request_id = str(uuid.uuid4())
        logger.info(f"[{request_id}] Starting question classification")
        
        try:
            # Log input parameters
            if VERBOSE:
                logger.debug(f"[{request_id}] Parameters:")
                logger.debug(f"[{request_id}] - Question: {question}")
                logger.debug(f"[{request_id}] - Industry: {industry}")
                logger.debug(f"[{request_id}] - Role: {role}")

            # Define categories
            categories = ["data", "relational", "documentation", "greetings"]
            logger.debug(f"[{request_id}] Available categories: {categories}")

            # Get and format prompt
            start_time = time.time()
            prompt_text = self.get_prompt('classify_question', industry, role).format(
                categories=', '.join(categories),
                question=question
            )
            #prompt_time = time.time() - start_time
            
            if VERBOSE:
                logger.debug(f"[{request_id}] Generated prompt:")
                logger.debug(f"[{request_id}] {prompt_text}")
                #logger.debug(f"[{request_id}] Prompt generation took: {prompt_time:.2f}s")

            # Make API request
            logger.debug(f"[{request_id}] Sending request to OpenAI API")
            start_time = time.time()

            conversation = [
                {"role": "system", "content": prompt_text},
                {"role": "user", "content": question}
            ]
            
            # Make API call using configured model
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation,
                temperature=0,  # Keep temperature low for consistent classification
                max_tokens=10,  # Short response needed
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0,
                stop=["\n"]
            )
            
            #api_time = time.time() - start_time
            #logger.debug(f"[{request_id}] API request completed in {api_time:.2f}s")

            # Process response
            raw_response = response.choices[0].message.content
            cleaned_response = raw_response.replace('<|im_end|>', '').strip().lower()
            
            if VERBOSE:
                logger.debug(f"[{request_id}] Raw response: {raw_response}")
                logger.debug(f"[{request_id}] Cleaned response: {cleaned_response}")

            # Validate response
            if cleaned_response not in categories:
                logger.warning(f"[{request_id}] Unexpected category: {cleaned_response}")
                logger.warning(f"[{request_id}] Defaulting to 'unknown'")
                return "unknown"
            
            logger.info(f"[{request_id}] Question classified as: {cleaned_response}")
            #logger.info(f"[{request_id}] Total classification time: {time.time() - start_time:.2f}s")
            
            return cleaned_response

        except Exception as e:
            logger.error(f"[{request_id}] Error in classify_question: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(f"[{request_id}] Full error traceback:")
                logger.debug(traceback.format_exc())
            return "unknown"
        
    def chat_hello(self, industry: str, role: str, question: str = None, session_id: str = None) -> str:
        """
        Generate a response based on industry, role context, user's question and conversation history.
        
        Args:
            industry (str): The industry context
            role (str): The user's role within the industry
            question (str): The user's greeting or help request
            session_id (str): The session identifier for conversation history
            
        Returns:
            str: A contextualized response to the user's greeting or help request
        """
        try:
            # Get the greeting prompt from prompts.json
            system_content = self.get_prompt('chat_hello', industry, role)
            
            # Format the prompt with industry and role
            formatted_prompt = system_content.format(
                industry=industry,
                role=role
            )
            
            if VERBOSE:
                logger.debug(f"Formatted greeting prompt: {formatted_prompt}")
                logger.debug(f"User question: {question}")
            
            # Create conversation messages including history if available
            conversation = [{"role": "system", "content": formatted_prompt}]
            
            if session_id:
                # Add conversation history
                history = self._get_or_create_conversation(session_id)
                conversation.extend(history)
            
            # Add current question
            if question:
                conversation.append({"role": "user", "content": question})
            
            # Generate response using the ChatGPT model
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
            
            # Store the interaction in conversation history
            if session_id and question:
                self.add_to_conversation(session_id, "user", question)
                self.add_to_conversation(session_id, "assistant", response.choices[0].message.content)
            
            return self.clean_html_output(response.choices[0].message.content) 
            
        except Exception as e:
            logger.error(f"Error in chat_hello: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(f"Full error traceback:")
                logger.debug(traceback.format_exc())
            return f"I apologize, but I'm having trouble processing your message: '{question}'. How can I assist you today?"

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
    

    def convert_question_query_sql(self, question: str, industry: str, role: str) -> str:
        """
        Convert a natural language question to SQL query based on industry and role context.
        
        Args:
            question (str): The natural language question to convert
            industry (str): The industry context
            role (str): The user's role
            
        Returns:
            str: Generated SQL query or error message
        """
        request_id = str(uuid.uuid4())
        logger.info(f"[{request_id}] Starting SQL query conversion")
        
        try:
            logger.debug(f"[{request_id}] Input parameters:")
            logger.debug(f"[{request_id}] Question: {question}")
            logger.debug(f"[{request_id}] Industry: {industry}")
            logger.debug(f"[{request_id}] Role: {role}")
            logger.debug(f"[{request_id}] Database: {self.SQL_DATABASE}")

            # Get and format prompt
            start_time = time.time()
            system_content = self.get_prompt('convert_question_query_sql', industry, role).format(
                DATABASE_NAME=self.SQL_DATABASE
            )
            prompt_time = time.time() - start_time
            
            if VERBOSE:
                logger.debug(f"[{request_id}] Generated system content:")
                logger.debug(f"[{request_id}] {system_content}")
                logger.debug(f"[{request_id}] Prompt generation took: {prompt_time:.2f}s")

            # Prepare conversation
            conversation = [
                {"role": "system", "content": system_content},
                {"role": "user", "content": question}
            ]

            # Make API request
            logger.debug(f"[{request_id}] Sending request to OpenAI API")
            start_time = time.time()
            
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
            
            api_time = time.time() - start_time
            logger.debug(f"[{request_id}] API request completed in {api_time:.2f}s")

            # Process response
            raw_response = response.choices[0].message.content
            cleaned_response = self.clean_string(raw_response)
            
            if VERBOSE:
                logger.debug(f"[{request_id}] Raw response: {raw_response}")
                logger.debug(f"[{request_id}] Cleaned response: {cleaned_response}")

            # Validate SQL query
            if not cleaned_response.strip().lower().startswith(('select', 'with')):
                logger.warning(f"[{request_id}] Generated query doesn't start with SELECT or WITH")
                return "Error: Generated query appears invalid"

            logger.info(f"[{request_id}] Successfully generated SQL query")
            logger.info(f"[{request_id}] Total conversion time: {time.time() - start_time:.2f}s")
            
            return cleaned_response

        except Exception as e:
            logger.error(f"[{request_id}] Error in convert_question_query_sql: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(f"[{request_id}] Full error traceback:")
                logger.debug(traceback.format_exc())
            return "Error generating SQL query. Please try again or rephrase your question."

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
            
            return self.clean_html_output(response.choices[0].message.content) 
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
            return self.clean_html_output(response.choices[0].message.content)
        except Exception as e:
            print(f"Error in chat_llm: {str(e)}")
            return "Error generating response."

    def clean_string(self, text):
        if not isinstance(text, str):
            return str(text)
        clean_string = text.replace("```sql", "").replace("```", "").strip()
        clean_string = clean_string.replace("Output:", "").replace("Query:", "").strip()
        return clean_string
        

    def format_results_to_html(self, results, query_type: str, industry: str, role: str) -> str:
        """
        Use OpenAI to format query results into an HTML table with analysis.
        
        Args:
            results: Query results from SQL or InfluxDB
            query_type (str): Type of query ('sql' or 'influx')
            industry (str): The industry context
            role (str): The user's role
        
        Returns:
            str: HTML formatted table with results
        """
        request_id = str(uuid.uuid4())
        logger.info(f"[{request_id}] Starting results formatting")
        
        try:
            # Convert results to string representation for the prompt
            results_str = json.dumps(results, default=str, indent=2)
            
            if VERBOSE:
                logger.debug(f"[{request_id}] Results to format: {results_str[:200]}...")
                logger.debug(f"[{request_id}] Query type: {query_type}")
                logger.debug(f"[{request_id}] Industry: {industry}")
                logger.debug(f"[{request_id}] Role: {role}")
                
            # Get and format the prompt
            #system_content = self.get_prompt('format_results', industry, role).format(
            #    query_type=query_type,
            #    data_type="time series" if query_type == "influx" else "relational"
            #)

            system_content = f"You are a data presentation expert specializing in {query_type} data for the {industry} industry. Your task is to format query results into a clean, professional HTML table no styling.\n\nGuidelines:\n1. Create a responsive HTML table with clear headers\n2. Use appropriate styling (included in <style> tag)\n3. Format dates, numbers, and values appropriately\n4. Use color coding for status or threshold values if relevant\n5. Include a summary if the data shows trends or patterns\n6. Keep the formatting professional and consistent\n\nProvide only the HTML code without CSS styling.\n\nExample structure:<div class='results-container'> <style> </style> <table class='data-table'>    <!-- Your table content here -->  </table></div>"
            
            # Prepare conversation
            conversation = [
                {"role": "system", "content": system_content},
                {"role": "user", "content": f"Format these {query_type} query results: {results_str}"}
            ]
            
            # Request formatting from OpenAI
            logger.debug(f"[{request_id}] Sending format request to OpenAI")
            
            
            response = self.client.chat.completions.create(
                model=self.CHATGPT_MODEL,
                messages=conversation
            )
            
            formatted_result = response.choices[0].message.content
            formatted_result = self.clean_string_html(formatted_result)
            formatted_result = self.clean_html_output(formatted_result)
            
            if VERBOSE:
                logger.debug(f"[{request_id}] Formatted result preview: {formatted_result[:200]}...")
            
            return formatted_result
            
        except Exception as e:
            logger.error(f"[{request_id}] Error formatting results: {str(e)}")
            if VERBOSE:
                import traceback
                logger.debug(f"[{request_id}] Full error traceback:")
                logger.debug(traceback.format_exc())
            return f"<p>Error formatting results: {str(e)}</p>"


    def clean_string_html(self, text: str) -> str:
        """
        Clean a string by removing code markers and normalizing line breaks.
        
        Args:
            text (str): The input string to clean
            
        Returns:
            str: Cleaned string with code markers and extra line breaks removed
        """
        try:
            if not isinstance(text, str):
                return str(text)
                
            # Remove language specific code markers
            for lang in ['html', 'sql', 'python', 'json']:
                text = text.replace(f"```{lang}", "")
            
            # Remove generic code markers
            text = text.replace("```", "")
            
            # Remove extra newlines while preserving intended breaks in HTML
            text = text.replace("\n\n", "\n")  # Reduce multiple newlines to single
            text = text.strip()  # Remove leading/trailing whitespace
            
            return text
            
        except Exception as e:
            logger.error(f"Error cleaning string: {str(e)}")
            return str(text)

    def clean_html_output(self, text: str) -> str:
        """
        Clean HTML output from LLM response.
        
        Args:
            text (str): The HTML string to clean
            
        Returns:
            str: Cleaned HTML string
        """
        try:
            if not isinstance(text, str):
                return str(text)
                
            # Remove code markers
            text = self.clean_string(text)
            
            # Remove newlines between HTML tags while preserving content
            lines = []
            for line in text.split('\n'):
                line = line.strip()
                if line:  # Skip empty lines
                    lines.append(line)
                    
            # Join lines, ensuring proper spacing around content
            text = ' '.join(lines)
            
            # Cleanup extra spaces
            text = ' '.join(text.split())
            
            return text
            
        except Exception as e:
            logger.error(f"Error cleaning HTML output: {str(e)}")
            return str(text)