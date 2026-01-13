from openai import OpenAI
from decouple import config

client = OpenAI(api_key=config('OPENAI_API_KEY'))

def call_gpt(prompt, model="gpt-4-1106-preview", system_role=[], temperature=0.7):
    messages = [
        {"role": "system", "content": system_role[0]},
        {"role": "system", "content": system_role[1]},
        {"role": "user", "content": prompt},
    ]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        top_p=1,
    )
    return response.choices[0].message.content, response.usage.total_tokens
