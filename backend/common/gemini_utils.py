import google.generativeai as genai
from decouple import config

genai.configure(api_key=config("GEMINI_API_KEY"))

# Default model and config
DEFAULT_MODEL = "gemini-1.5-flash"
DEFAULT_GENERATION_CONFIG = {
    "response_mime_type": "application/json"
}


def call_gemini(prompt, system_messages=None, model=DEFAULT_MODEL, config_overrides=None):
    """
    :param prompt: str, main user prompt
    :param system_messages: list[str], optional pre-prompts like system instructions
    :param model: str, Gemini model
    :param config_overrides: dict, optional overrides for generation config
    :return: Tuple of (str: response_text, int: total_tokens)
    """
    if system_messages is None:
        system_messages = []

    generation_config = DEFAULT_GENERATION_CONFIG.copy()
    if config_overrides:
        generation_config.update(config_overrides)

    gemini_model = genai.GenerativeModel(model, generation_config=generation_config)

    # Concatenate system + prompt for input
    full_prompt = "\n".join(system_messages + [prompt])

    response = gemini_model.generate_content(full_prompt)

    total_tokens = 0
    if response and hasattr(response, "usage_metadata"):
        total_tokens = (
            getattr(response.usage_metadata, "prompt_token_count", 0) +
            getattr(response.usage_metadata, "candidates_token_count", 0)
        )

    return response.text if response else "", total_tokens