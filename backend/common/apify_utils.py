# from django.conf import settings

import json
from decouple import config
from apify_client import ApifyClient
# Initialize the ApifyClient with your API token
client = ApifyClient(config("APIFY_API_KEY"))


# Open the file in read mode
def scrape_linkedin_profile(profile_url: str) -> dict:
    COOKIES = []
    with open('credentials/linkedin_session.json', 'r') as file:
        data = json.load(file)
        COOKIES = data.get('cookies', [])

    # Prepare the Actor input
    run_input = {
        "cookie": COOKIES,
        "urls": [
            profile_url
        ],
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
        "scrapeCompany": False,
        "minDelay": 15,
        "maxDelay": 60,
        "proxy": {
            "useApifyProxy": True,
            "apifyProxyCountry": "US",
        },
        "findContacts": False,
        "findContacts.contactCompassToken": "",
    }

    # Run the Actor and wait for it to finish
    run = client.actor(config("APIFY_ACTOR_ID")).call(run_input=run_input)

    # Fetch and print Actor results from the run's dataset (if there are any)
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():

        experience_text = ""

        for exp in item.get("positions", []):

            time_period = exp.get('timePeriod', {}) or {}

            start_date = time_period.get('startDate', {}) or {}

            end_date = time_period.get('endDate', {}) or {}


            experience_text += f"{exp.get('title', '')} at {(exp.get('company', {}) or {}).get('name', '')}\n"

            experience_text += f"Location: {exp.get('locationName', '')}\n"

            experience_text += f"Time Period: {start_date.get('month', '')}/{start_date.get('year', '')}" \
                                + f" - {end_date.get('month', '')}/{end_date.get('year', '')}\n"

            experience_text += f"Description: {exp.get('description', '')}\n"

            experience_text += f"Insights: {exp.get('insights', '')}\n\n"



        skills = ', '.join([skill.get('name', '') for skill in item.get('skills', [])])



        results = {
            'profile': {},
            'full_name': item.get('firstName', '') + ' ' + item.get('lastName', ''),
            'email': '',
            'linkedin_id': '',
            'picture': '',
            'headline': item.get('headline', ''),
            'about': item.get('summary', ''),
            'experience': experience_text.strip(),
            'skills': skills,
            'profile_url': f"https://www.linkedin.com/in/{item.get('publicIdentifier', '')}/",
        }

        print(f"Scraped profile data: {results}")  # Debug log

        return results

if __name__ == "__main__":
    scrape_linkedin_profile("https://www.linkedin.com/in/obaidmughal14/")
