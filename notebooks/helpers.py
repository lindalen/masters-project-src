import time
import json
import os
import re

def with_retry(func):
    """A decorator that adds retry logic to function calls."""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"An error occurred: {e}. Retrying in 10 seconds...")
            time.sleep(5)  # Wait for 10 seconds before retrying
            try:
                return func(*args, **kwargs)  # Retry the function call
            except Exception as retry_exception:
                print(f"Retry failed: {retry_exception}.")
                return None
    return wrapper

def parse_gpt_json_response(json_response):
    try:
        json_response = json_response.strip('` \n')
        if json_response.startswith('json'):
            json_response = json_response[4:]
        parsed_json = json.loads(json_response)
        
        return parsed_json
    except json.JSONDecodeError:
        print(f"Invalid JSON received for document: {json_response[:5]}")
    except TypeError:
        print(f"Invalid input: {json_response}")
    return None

def load_json(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            loaded_file = json.load(file)
        print(f"File {file_path} loaded successfully!")
        return loaded_file
    else:
        print(f"The file {file_path} does not exist in the current directory.")

def clean_text(text):
    # Basic cleanup to remove non-ASCII characters and multiple spaces
    return re.sub(' +', ' ', text.encode('ascii', errors='ignore').decode().strip())