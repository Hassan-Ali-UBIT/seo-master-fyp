import requests
from decouple import config

def generate_image_base_64(prompt):

    FREEPIK_API_KEY = config('FREEPIK_API_KEY')

    url = "https://api.freepik.com/v1/ai/text-to-image"

    headers = {
        "x-freepik-api-key": FREEPIK_API_KEY,
    }

    body = {
        "prompt": prompt
    }

    response = requests.post(url, headers=headers, json=body)

    if response.status_code == 200:
        return response.json()["data"][0]["base64"]
