import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Check for Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

def get_genai_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if HAS_GENAI and api_key and api_key != "MY_GEMINI_API_KEY":
        try:
            return genai.Client(api_key=api_key)
        except Exception as e:
            sys.stderr.write(f"Google GenAI client init warning: {e}\n")
    return None
