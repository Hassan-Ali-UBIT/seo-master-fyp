import html
import re
import requests
import timeit


BASE_URL = 'http://20.151.57.161'

MODEL_URL = BASE_URL + ':11434/api/generate'

EMBEDDING_URL = BASE_URL + ':11434/api/embeddings'

def call_qwen(prompt, model="qwen3:32b", system_prompts=[]):

    system_prompt_text = ". ".join(system_prompts)

    response = requests.post(
        MODEL_URL,
        json={
            'model': model,
            'prompt': prompt,
            "system": system_prompt_text + "Only return the final answer. \
                    Do not include any internal thoughts, reasoning steps, \
                    or special tags like <think> or </think>.",
            'stream': False
        }
    )

    raw_output = response.json().get("response", "")
    decoded_output = html.unescape(raw_output)

    # Remove <think>...</think> blocks if still present
    cleaned_output = re.sub(r"<think>.*?</think>", "", decoded_output, flags=re.DOTALL).strip()

    print(cleaned_output)
    return cleaned_output

def call_qwen_with_timing(prompt, model="qwen3:32b"):
    start_time = timeit.default_timer()
    call_qwen(prompt, model)
    elapsed_time = timeit.default_timer() - start_time
    print(f"Time taken: {elapsed_time:.2f} seconds")




def get_embedding_with_qwen(prompt, model="dengcao/qwen3-embedding-8b:Q5_K_M"):
    response = requests.post(
        EMBEDDING_URL,
        json={
            'model': model,
            'prompt': prompt
        }
    )

    if response.status_code == 200:
        embedding = response.json().get("embedding", [])
        print(f"Embedding Created")
        return embedding
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return []

# create_embedding_with_qwen("This is a test prompt for embedding generation.")