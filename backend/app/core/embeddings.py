from app.core.config import OPENAI_API_KEY, GEMINI_API_KEY
import openai
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, PermissionDenied, InvalidArgument, NotFound

from openai import OpenAIError
from openai._exceptions import (
    AuthenticationError,
    RateLimitError,
    APIError,
    APIConnectionError,
    BadRequestError,
)

# Set default API keys
openai.api_key = OPENAI_API_KEY
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# ---- Embedding Function ----
async def embed_text(text: str):
    try:
        response = openai.embeddings.create(
            input=[text], model="text-embedding-3-large"
        )
        return response.data[0].embedding
    except Exception as e:
        return f"Embedding Error: {str(e)}"


# ---- Main LLM Function ----
async def get_llm_response(query: str, context: str, llm_data: dict):
    prompt = llm_data.get("prompt", "")
    model = llm_data.get("model")
    api_key = llm_data.get("apiKey", "")
    temperature = llm_data.get("temperature", 0.7)

    full_prompt = prompt.replace("{context}", context).replace("{query}", query)

    # ---- OpenAI GPT Models ----
    if model and model.startswith("gpt"):
        model = model or "gpt-3.5-turbo"
        openai.api_key = api_key or OPENAI_API_KEY

        messages = [
            {"role": "system", "content": full_prompt},
            {"role": "user", "content": query},
        ]

        try:
            completion = openai.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
            )
            return completion.choices[0].message.content

        except AuthenticationError:
            return "OpenAI Error: Invalid API key."
        except RateLimitError:
            return "OpenAI Error: Rate limit exceeded."
        except BadRequestError as e:
            return f"OpenAI Error: Bad request – {str(e)}"
        except APIConnectionError:
            return "OpenAI Error: Connection failed."
        except APIError as e:
            return f"OpenAI Error: Server error – {str(e)}"
        except OpenAIError as e:
            return f"OpenAI Error: {str(e)}"
        except Exception as e:
            return f"Unexpected OpenAI Error: {str(e)}"

    # ---- Gemini Models ----
    elif model and model.startswith("gemini"):
        model = model or "gemini-1.5-flash"
        genai.configure(api_key=api_key or GEMINI_API_KEY)

        try:
            model_g = genai.GenerativeModel(model)
            response = model_g.generate_content(full_prompt)
            return response.text

        except ResourceExhausted:
            return "Gemini Error: Quota exceeded. Try again later."
        except PermissionDenied:
            return "Gemini Error: Invalid API key or billing disabled."
        except InvalidArgument:
            return "Gemini Error: Bad input or unsupported model."
        except NotFound:
            return "Gemini Error: Model not found. Check model name."
        except Exception as e:
            return f"Gemini Error: {str(e)}"

    return "Error: No valid LLM model selected."
