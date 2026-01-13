import json

def safe_json_parse(text_data):
    if isinstance(text_data, str):
        text_data = text_data.strip('`')

        if text_data.startswith("json"):
            text_data = text_data[4:]

    
    try:
        return json.loads(text_data)
    except Exception as err:
        print("json parse error =========== ", err)
        print("data given =========== ", text_data)

