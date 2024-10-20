import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DATABASE_HOST', 'localhost'),
        dbname=os.getenv('DATABASE_NAME', 'contoso'),
        user=os.getenv('DATABASE_USER', 'postgres'),
        password=os.getenv('DATABASE_PASSWORD', 'password')
    )
    return conn