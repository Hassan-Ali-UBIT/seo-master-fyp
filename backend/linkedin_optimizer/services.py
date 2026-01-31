"""
LinkedIn Optimizer Services
Business logic for competitor discovery, keyword extraction, profile analysis, and optimization.
"""
from users.models import User
import re
import json
import requests
from typing import List, Dict, Optional
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
import traceback
import json
import asyncio
from asgiref.sync import async_to_sync
from playwright.async_api import async_playwright
from linkedin_scraper import PersonScraper, login_with_credentials
from linkedin_scraper import ConsoleCallback, BrowserManager
from tavily import TavilyClient

from common.qwen_utils import call_qwen
from common.exception_utils import CustomAPIException
from .models import (
    UserProfileSnapshot,
    CompetitorProfile,
    KeywordCluster,
    OptimizationContext,
    OptimizationResult,
    ActionableChecklist
)


class LinkedInOAuthService:
    """Handle LinkedIn OAuth flow and profile fetching"""

    OAUTH_BASE_URL = "https://www.linkedin.com/oauth/v2"
    API_BASE_URL = "https://api.linkedin.com/v2"

    @staticmethod
    def get_authorization_url(state: str) -> str:
        """Generate LinkedIn authorization URL"""
        params = {
            'response_type': 'code',
            'client_id': settings.LINKEDIN_CLIENT_ID,
            'redirect_uri': settings.LINKEDIN_REDIRECT_URI,
            'state': state,
            'scope': 'openid profile email'
        }
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{LinkedInOAuthService.OAUTH_BASE_URL}/authorization?{query_string}"

    @staticmethod
    def exchange_code_for_token(code: str) -> Dict:
        """Exchange authorization code for access token"""
        url = f"{LinkedInOAuthService.OAUTH_BASE_URL}/accessToken"
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': settings.LINKEDIN_REDIRECT_URI,
            'client_id': settings.LINKEDIN_CLIENT_ID,
            'client_secret': settings.LINKEDIN_CLIENT_SECRET,
        }

        try:
            response = requests.post(url, data=data, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise CustomAPIException(
                message=f"Failed to exchange code for token: {str(e)}",
                status_code=400
            )

    @staticmethod
    def _scrape_profile_async(profile_url: str):
        """Internal async method to run linkedin-scraper"""
        if not settings.LINKEDIN_BOT_USERNAME or not settings.LINKEDIN_BOT_PASSWORD:
             raise CustomAPIException(
                message="LinkedIn Bot credentials not configured",
                status_code=500
            )

        print(f"Using linkedin-scraper (Playwright) to fetch: {profile_url}")

        async def run():
            async with async_playwright() as p:
                # Launch browser
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()

                try:
                    # Login
                    await login_with_credentials(
                        page,
                        email=settings.LINKEDIN_BOT_USERNAME,
                        password=settings.LINKEDIN_BOT_PASSWORD
                    )

                    # Scrape
                    scraper = PersonScraper(page)
                    person = await scraper.scrape(profile_url)

                    return person
                finally:
                    await browser.close()

        return asyncio.run(run())

    @staticmethod
    def _scrape_profile_async_with_session(profile_url: str):
        """Internal async method to run linkedin-scraper"""

        async def scrape_with_progress():
            callback = ConsoleCallback()  # Prints progress to console

            async with BrowserManager(headless=True) as browser:
                await browser.load_session("credentials/linkedin_session.json")

                scraper = PersonScraper(browser.page, callback=callback)
                return await scraper.scrape(profile_url)

        return asyncio.run(scrape_with_progress())

    @staticmethod
    def fetch_profile_from_url(user, profile_url: str) -> Dict:
        """
        Fetch profile data directly from a LinkedIn URL using linkedin-scraper package
        """
        print(f"Fetching profile from URL: {profile_url}")

        try:
            # Run the scraper (it handles browser login and scraping)
            # The _scrape_profile_async method uses asyncio.run internally
            person = LinkedInOAuthService._scrape_profile_async_with_session(profile_url)

            if not person:
                 raise CustomAPIException(
                    message="Failed to scrape profile",
                    status_code=500
                )

            print("person", person)

            # Map linkedin-scraper Person object to our format

            # 1. Full Name
            full_name = getattr(person, 'name', '') or ''

            # 2. Headline (Construct since field is missing in v3 model)
            # Use most recent job title and company
            job_title = getattr(person, 'job_title', '') or ''
            company = getattr(person, 'company', '') or ''
            if job_title and company:
                headline = f"{job_title} at {company}"
            elif job_title:
                headline = job_title
            else:
                headline = getattr(person, 'headline', '') # Try attribute just in case

            # 3. About
            about = getattr(person, 'about', '') or ''

            # 4. Experience & Skills Extraction
            experience_text = ""
            extracted_skills = set()

            experiences = getattr(person, 'experiences', [])
            for exp in experiences:
                t = getattr(exp, 'position_title', '') or ''
                c = getattr(exp, 'institution_name', '') or ''
                d = getattr(exp, 'description', '') or ''

                # Format: "Software Engineer at Google"
                # Description...
                entry_header = f"{t} at {c}" if c else t
                experience_text += f"{entry_header}\n{d}\n\n"

                # Try to extract skills from description "Skills: HTML, CSS"
                if d and "Skills:" in d:
                    # Simple extraction logic: look for lines starting with "Skills:"
                    for line in d.split('\n'):
                        if "Skills:" in line:
                            skills_str = line.replace("Skills:", "").strip()
                            # Split by comma or bullet
                            for s in skills_str.split(','): # Assuming comma separated
                                if s.strip():
                                    extracted_skills.add(s.strip())

            # 5. Skills
            # Combine extracted skills with any direct skills (if library adds them back)
            direct_skills = getattr(person, 'skills', []) or []
            if direct_skills:
                extracted_skills.update(direct_skills)

            skills_text = ", ".join(list(extracted_skills))

            return {
                'profile': {},
                'full_name': full_name,
                'email': getattr(person, 'email', '') or '',
                'linkedin_id': '',
                'picture': getattr(person, 'image_url', '') or '', # image_url might be valid
                'headline': headline,
                'about': about,
                'experience': experience_text.strip(),
                'skills': skills_text,
                'profile_url': profile_url,
            }

        except Exception as e:
            print(f"Scraper error: {str(e)}")
            traceback.print_exc()
            raise CustomAPIException(
                message=f"Failed to fetch profile data: {str(e)}",
                status_code=500
            )

    @staticmethod
    def fetch_profile_data(access_token: str) -> Dict:
        """
        Fetch user's LinkedIn profile data using OpenID Connect userinfo endpoint.
        This endpoint is available in test mode with 'openid profile email' scopes.
        Reference: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        full_name = ''
        email = ''
        profile_data = {}

        try:
            # Use OpenID Connect userinfo endpoint (works in test mode)
            userinfo_url = f"{LinkedInOAuthService.API_BASE_URL}/userinfo"

            userinfo_response = requests.get(userinfo_url, headers=headers, timeout=30)
            userinfo_response.raise_for_status()
            profile_data = userinfo_response.json()
            print("LinkedIn userinfo response:", profile_data)

            # Extract data from userinfo response
            # Available fields: sub, name, given_name, family_name, picture, locale, email, email_verified
            full_name = profile_data.get('name', '')
            if not full_name:
                given_name = profile_data.get('given_name', '')
                family_name = profile_data.get('family_name', '')
                full_name = f"{given_name} {family_name}".strip()

            email = profile_data.get('email', '')

            # The 'sub' field contains LinkedIn member ID
            linkedin_id = profile_data.get('sub', '')

            # Use Tavily to search for complete LinkedIn profile details
            # This provides headline, about, experience, skills
            print("Fetching complete profile via Tavily...")
            print("LinkedIn ID (sub):", linkedin_id)
            print("Full Name:", full_name)
            print("Email:", email)
            complete_profile = LinkedInOAuthService._fetch_profile_with_tavily(
                full_name=full_name,
                email=email,
                linkedin_id=linkedin_id
            )

            return {
                'profile': profile_data,
                'full_name': full_name,
                'email': email,
                'linkedin_id': linkedin_id,
                'picture': profile_data.get('picture', ''),
                'headline': complete_profile.get('headline', ''),
                'about': complete_profile.get('about', ''),
                'experience': complete_profile.get('experience', ''),
                'skills': complete_profile.get('skills', ''),
                'profile_url': complete_profile.get('profile_url', ''),
            }
        except requests.exceptions.RequestException as e:
            raise CustomAPIException(
                message=f"Failed to fetch LinkedIn profile: {str(e)}",
                status_code=400
            )

    @staticmethod
    def _fetch_profile_with_tavily(full_name: str, email: str = '', linkedin_id: str = '', profile_url: str = 'https://www.linkedin.com/in/hassan-ali-078864392/') -> Dict:
        """
        Use Tavily to search for and extract complete LinkedIn profile details
        Use LinkedIn ID (sub) and email for precise matching, or a direct profile URL
        """
        if not settings.TAVILY_API_KEY:
            return {}

        try:
            tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)

            # Build search query - use most specific identifiers available
            if profile_url:
                # Direct URL search - most accurate
                query = profile_url
                print(f"Using direct URL for Tavily search: {query}")
            # LinkedIn ID (sub field) is most unique, then email + name combination
            elif email and linkedin_id:
                # Combine email and name for best accuracy
                query = f'site:linkedin.com/in "{email}" "{linkedin_id}"'
            elif email:
                # Email only
                query = f'site:linkedin.com/in "{email}"'
            else:
                # Fall back to name search if no email
                query = f'site:linkedin.com/in "{full_name}"'

            print(f"Tavily search query: {query}")

            # Search for the user's LinkedIn profile
            response = tavily_client.search(
                query=query,
                max_results=5,
                search_depth="advanced",
                include_raw_content=True
            )

            selected = {}

            print("Response: ", response)

            # Process first relevant result
            for result in response.get('results', []):
                url = result.get('url', '')

                # Verify this is a LinkedIn profile URL
                if 'linkedin.com/in/' not in url:
                    continue

                raw_content = result.get('raw_content', '')
                content = result.get('content', '')

                # Extract profile details from the content
                profile_details = LinkedInOAuthService._extract_profile_from_content(
                    raw_content or content,
                    url
                )

                print("Profile Details: ", profile_details)

                if profile_details.get('headline'):  # Valid profile found
                    selected = profile_details

            return {}

        except Exception as e:
            print(f"Tavily profile search error: {str(e)}")
            return {}

    @staticmethod
    def _extract_profile_from_content(content: str, profile_url: str) -> Dict:
        """
        Extract LinkedIn profile sections from scraped content
        """
        if not content:
            return {}

        # Use Qwen AI to intelligently extract profile sections
        prompt = f"""
Extract LinkedIn profile information from the following content. Return a JSON object with these fields:
- headline: The professional headline (1 line)
- about: The about/summary section
- experience: Work experience section with bullet points
- headline: The professional headline (1 line)
- full_name: The user's full name (if available)
- about: The about/summary section
- experience: Work experience section with bullet points
- skills: Comma-separated list of skills

Content:
{content[:8000]}

Return only valid JSON without any markdown formatting or code blocks.
"""

        try:
            response = call_qwen(prompt)

            # Parse JSON response
            # Remove markdown code blocks if present
            response = response.strip()
            if response.startswith('```'):
                response = re.sub(r'^```(?:json)?\n?', '', response)
                response = re.sub(r'\n?```$', '', response)

            profile_data = json.loads(response)
            profile_data['profile_url'] = profile_url

            return profile_data

        except (json.JSONDecodeError, Exception) as e:
            print(f"Profile extraction error: {str(e)}")

            # Fallback: Basic text extraction
            return {
                'headline': '',
                'full_name': '',
                'about': '',
                'experience': '',
                'skills': '',
                'profile_url': profile_url
            }


class TavilyService:
    """Handle competitor discovery using Tavily API"""

    def __init__(self):
        if not settings.TAVILY_API_KEY:
            raise CustomAPIException(
                message="Tavily API key not configured",
                status_code=500
            )
        self.client = TavilyClient(api_key=settings.TAVILY_API_KEY)

    def search_competitors(
        self,
        target_role: str,
        target_location: str,
        max_results: int = 25
    ) -> List[CompetitorProfile]:
        """
        Search for competitor LinkedIn profiles
        Returns cached results if available and not expired
        """
        search_query = f"{target_role} {target_location}"

        # Check cache first
        cached_competitors = CompetitorProfile.objects.filter(
            search_query=search_query
        ).order_by('-extracted_at')

        # If cache is fresh (within 7 days), return cached results
        if cached_competitors.exists():
            first_competitor = cached_competitors.first()
            if not first_competitor.is_expired:
                return list(cached_competitors)

        # Cache expired or doesn't exist - fetch new data
        try:
            # Build Tavily search query
            tavily_query = f'site:linkedin.com/in {target_role} {target_location}'

            response = self.client.search(
                query=tavily_query,
                max_results=max_results,
                search_depth="advanced",
                include_raw_content=True
            )

            competitors = []
            for result in response.get('results', []):
                url = result.get('url', '')

                # Only process LinkedIn profile URLs
                if 'linkedin.com/in/' not in url:
                    continue

                # Avoid duplicates
                if CompetitorProfile.objects.filter(profile_url=url).exists():
                    competitor = CompetitorProfile.objects.get(profile_url=url)
                    competitor.search_query = search_query
                    competitor.extracted_at = timezone.now()
                    competitor.save()
                    competitors.append(competitor)
                    continue

                # Extract text content
                content = result.get('raw_content', '') or result.get('content', '')

                competitor = CompetitorProfile.objects.create(
                    search_query=search_query,
                    profile_url=url,
                    headline_text=self._extract_headline(content),
                    about_text=self._extract_about(content),
                    experience_text=self._extract_experience(content),
                    skills_text=self._extract_skills(content),
                    raw_data=result
                )
                competitors.append(competitor)

            return competitors

        except Exception as e:
            raise CustomAPIException(
                message=f"Tavily search failed: {str(e)}",
                status_code=500
            )

    def _extract_headline(self, content: str) -> str:
        """Extract headline from raw content (simplified)"""
        # This is a simplified extraction - in production, use more sophisticated parsing
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if len(line) > 20 and len(line) < 200 and i < 10:
                return line.strip()
        return ""

    def _extract_about(self, content: str) -> str:
        """Extract about section from raw content"""
        # Simplified extraction
        about_match = re.search(r'About\s*\n+(.*?)(?:\n\n|Experience|$)', content, re.DOTALL | re.IGNORECASE)
        if about_match:
            return about_match.group(1).strip()
        return ""

    def _extract_experience(self, content: str) -> str:
        """Extract experience section from raw content"""
        exp_match = re.search(r'Experience\s*\n+(.*?)(?:\n\nEducation|Skills|$)', content, re.DOTALL | re.IGNORECASE)
        if exp_match:
            return exp_match.group(1).strip()
        return ""

    def _extract_skills(self, content: str) -> str:
        """Extract skills section from raw content"""
        skills_match = re.search(r'Skills\s*\n+(.*?)(?:\n\n|$)', content, re.DOTALL | re.IGNORECASE)
        if skills_match:
            return skills_match.group(1).strip()
        return ""


class KeywordExtractionService:
    """Extract and analyze keywords from competitor profiles using LLM"""

    @staticmethod
    def extract_keywords_from_competitors(
        competitors: List[CompetitorProfile],
        optimization_context: OptimizationContext
    ) -> List[KeywordCluster]:
        """
        Use LLM to extract keywords from competitor profiles
        """
        # Aggregate all competitor text
        all_headlines = [c.headline_text for c in competitors if c.headline_text]
        all_about = [c.about_text for c in competitors if c.about_text]
        all_experience = [c.experience_text for c in competitors if c.experience_text]
        all_skills = [c.skills_text for c in competitors if c.skills_text]

        # Build LLM prompt
        prompt = f"""Analyze the following LinkedIn profiles for {optimization_context.target_role} in {optimization_context.target_location}.

Extract keywords and categorize them into:
1. Role keywords (job titles, role-specific terms)
2. Skill keywords (technical skills, tools, technologies)
3. Industry keywords (industry-specific terminology)
4. Soft skills (communication, leadership, etc.)
5. Action verbs (achieved, led, managed, etc.)

Headlines:
{' | '.join(all_headlines[:10])}

About Sections:
{' | '.join(all_about[:5])}

Skills:
{' | '.join(all_skills[:10])}

Return ONLY a valid JSON object with this exact structure:
{{
  "role_keywords": ["keyword1", "keyword2"],
  "skill_keywords": ["skill1", "skill2"],
  "industry_keywords": ["term1", "term2"],
  "soft_skills": ["skill1", "skill2"],
  "action_verbs": ["verb1", "verb2"]
}}

Do not include any other text, explanations, or markdown formatting."""

        try:
            # Call LLM
            response = call_qwen(prompt, model="qwen3:32b")

            # Parse JSON response
            # Clean response if it has markdown formatting
            cleaned_response = response.strip()
            if cleaned_response.startswith('```'):
                cleaned_response = re.sub(r'^```json?\s*|\s*```$', '', cleaned_response, flags=re.MULTILINE)

            keywords_data = json.loads(cleaned_response)

            # Create KeywordCluster objects
            keyword_clusters = []

            # Role keywords
            for kw in keywords_data.get('role_keywords', []):
                cluster = KeywordExtractionService._create_keyword_cluster(
                    optimization_context, kw, 'role', competitors
                )
                if cluster:
                    keyword_clusters.append(cluster)

            # Skill keywords
            for kw in keywords_data.get('skill_keywords', []):
                cluster = KeywordExtractionService._create_keyword_cluster(
                    optimization_context, kw, 'skill', competitors
                )
                if cluster:
                    keyword_clusters.append(cluster)

            # Industry keywords
            for kw in keywords_data.get('industry_keywords', []):
                cluster = KeywordExtractionService._create_keyword_cluster(
                    optimization_context, kw, 'industry', competitors
                )
                if cluster:
                    keyword_clusters.append(cluster)

            # Soft skills
            for kw in keywords_data.get('soft_skills', []):
                cluster = KeywordExtractionService._create_keyword_cluster(
                    optimization_context, kw, 'soft_skill', competitors
                )
                if cluster:
                    keyword_clusters.append(cluster)

            # Action verbs
            for kw in keywords_data.get('action_verbs', []):
                cluster = KeywordExtractionService._create_keyword_cluster(
                    optimization_context, kw, 'action_verb', competitors
                )
                if cluster:
                    keyword_clusters.append(cluster)

            return keyword_clusters

        except json.JSONDecodeError as e:
            raise CustomAPIException(
                message=f"Failed to parse LLM response: {str(e)}",
                status_code=500
            )
        except Exception as e:
            raise CustomAPIException(
                message=f"Keyword extraction failed: {str(e)}",
                status_code=500
            )

    @staticmethod
    def _create_keyword_cluster(
        optimization_context: OptimizationContext,
        keyword: str,
        category: str,
        competitors: List[CompetitorProfile]
    ) -> Optional[KeywordCluster]:
        """Create or update keyword cluster with frequency and importance score"""
        keyword = keyword.strip().lower()

        if not keyword:
            return None

        # Calculate frequency across competitors
        frequency = 0
        for competitor in competitors:
            combined_text = ' '.join([
                competitor.headline_text or '',
                competitor.about_text or '',
                competitor.experience_text or '',
                competitor.skills_text or ''
            ]).lower()

            frequency += combined_text.count(keyword)

        # Calculate importance score (frequency-based with position weighting)
        total_competitors = len(competitors)
        importance_score = (frequency / max(total_competitors, 1)) * 10  # Scale to 0-10

        # Create or update keyword cluster
        cluster, created = KeywordCluster.objects.update_or_create(
            optimization_context=optimization_context,
            keyword=keyword,
            category=category,
            defaults={
                'frequency': frequency,
                'importance_score': min(importance_score, 10.0)  # Cap at 10
            }
        )

        return cluster


class ProfileAnalysisService:
    """Analyze user profile against competitor benchmarks"""

    @staticmethod
    def analyze_profile(
        profile_snapshot: UserProfileSnapshot,
        keywords: List[KeywordCluster]
    ) -> Dict:
        """
        Analyze user profile for keyword matches, gaps, and completeness
        """
        user_text = ' '.join([
            profile_snapshot.headline_text or '',
            profile_snapshot.about_text or '',
            profile_snapshot.experience_text or '',
            profile_snapshot.skills_text or ''
        ]).lower()

        # Keyword analysis
        matched_keywords = []
        missing_keywords = []

        for kw_cluster in keywords:
            if kw_cluster.keyword in user_text:
                matched_keywords.append({
                    'keyword': kw_cluster.keyword,
                    'category': kw_cluster.category,
                    'importance': kw_cluster.importance_score
                })
            else:
                if kw_cluster.importance_score >= 5.0:  # Only flag important missing keywords
                    missing_keywords.append({
                        'keyword': kw_cluster.keyword,
                        'category': kw_cluster.category,
                        'importance': kw_cluster.importance_score
                    })

        # Profile completeness
        completeness = {
            'headline_present': bool(profile_snapshot.headline_text and len(profile_snapshot.headline_text) > 10),
            'about_present': bool(profile_snapshot.about_text and len(profile_snapshot.about_text) > 50),
            'experience_present': bool(profile_snapshot.experience_text and len(profile_snapshot.experience_text) > 30),
            'skills_present': bool(profile_snapshot.skills_text and len(profile_snapshot.skills_text) > 10),
        }

        # Calculate match percentage
        total_important_keywords = len([k for k in keywords if k.importance_score >= 5.0])
        keyword_match_percentage = (
            len([k for k in matched_keywords if k['importance'] >= 5.0]) /
            max(total_important_keywords, 1)
        ) * 100

        return {
            'matched_keywords': matched_keywords,
            'missing_keywords': missing_keywords,
            'keyword_match_percentage': round(keyword_match_percentage, 2),
            'completeness': completeness,
            'gaps': {
                'keywords': [k['keyword'] for k in missing_keywords],
                'sections': [k for k, v in completeness.items() if not v],
            }
        }


class OptimizationGenerationService:
    """Generate optimized content using LLM"""

    @staticmethod
    def generate_headline(
        profile_snapshot: UserProfileSnapshot,
        optimization_context: OptimizationContext,
        keywords: List[KeywordCluster]
    ) -> str:
        """Generate optimized LinkedIn headline"""
        top_keywords = [k.keyword for k in keywords if k.category in ['role', 'skill'] and k.importance_score >= 7.0][:10]

        prompt = f"""Generate an optimized LinkedIn headline for a {optimization_context.target_role} in {optimization_context.target_location}.

Current headline: {profile_snapshot.headline_text or 'None'}

Key requirements:
- Include role: {optimization_context.target_role}
- SEO keywords: {', '.join(top_keywords)}
- Maximum 220 characters
- Format: Role | Key Skills | Value Proposition
- Professional and impactful

Return ONLY the optimized headline text, nothing else."""

        result = call_qwen(prompt, model="qwen3:32b").strip()
        return result

    @staticmethod
    def generate_about(
        profile_snapshot: UserProfileSnapshot,
        optimization_context: OptimizationContext,
        keywords: List[KeywordCluster]
    ) -> str:
        """Generate optimized About section"""
        top_keywords = [k.keyword for k in keywords if k.importance_score >= 6.0][:20]

        prompt = f"""Generate an optimized LinkedIn About section for a {optimization_context.target_role} in {optimization_context.target_location}.

Current about: {profile_snapshot.about_text or 'None'}

Key requirements:
- Include keywords naturally: {', '.join(top_keywords)}
- Story-driven and engaging
- Maximum 2600 characters
- Use short paragraphs (2-3 sentences each)
- Include a call-to-action at the end
- Professional tone

Return ONLY the optimized about section text, nothing else."""

        result = call_qwen(prompt, model="qwen3:32b").strip()
        return result

    @staticmethod
    def generate_experience_recommendations(
        profile_snapshot: UserProfileSnapshot,
        optimization_context: OptimizationContext,
        keywords: List[KeywordCluster],
        user: User
    ) -> List[Dict]:
        """Generate experience bullet recommendations"""
        action_verbs = [k.keyword for k in keywords if k.category == 'action_verb'][:10]
        skill_keywords = [k.keyword for k in keywords if k.category == 'skill'][:15]

        prompt = f"""Generate 5 optimized experience bullet points for a {optimization_context.target_role}.

Current experience: {profile_snapshot.experience_text or 'None'}

Requirements:
- Start with action verbs: {', '.join(action_verbs)}
- Include skills: {', '.join(skill_keywords)}
- Use metrics/numbers where possible (e.g., "increased by 30%")
- ATS-friendly language
- Each bullet 1-2 sentences

Return ONLY a valid JSON array of strings:
["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"]

Do not include any other text or formatting."""

        try:
            response = call_qwen(prompt, model="qwen3:32b")
            cleaned_response = response.strip()
            if cleaned_response.startswith('```'):
                cleaned_response = re.sub(r'^```json?\s*|\s*```$', '', cleaned_response, flags=re.MULTILINE)

            bullets = json.loads(cleaned_response)

            # Consume AI words
            if user and hasattr(user, 'userresources'):
                 # Count words in all bullets
                 word_count = sum(len(str(b).split()) for b in bullets)
                 user.userresources.consume_ai_words(word_count)

            return [{'bullet': b, 'type': 'recommendation'} for b in bullets]
        except json.JSONDecodeError:
            # Fallback: return generic recommendations
            return [
                {'bullet': 'Led cross-functional teams to deliver high-impact projects', 'type': 'recommendation'},
                {'bullet': 'Improved system performance by implementing optimization strategies', 'type': 'recommendation'},
                {'bullet': 'Collaborated with stakeholders to define technical requirements', 'type': 'recommendation'},
            ]

    @staticmethod
    def generate_skill_recommendations(
        profile_snapshot: UserProfileSnapshot,
        keywords: List[KeywordCluster]
    ) -> List[Dict]:
        """Generate skill recommendations"""
        skill_keywords = [
            {'skill': k.keyword, 'importance': k.importance_score}
            for k in keywords if k.category == 'skill'
        ]

        # Sort by importance
        skill_keywords.sort(key=lambda x: x['importance'], reverse=True)

        # Check which skills user already has
        user_skills = (profile_snapshot.skills_text or '').lower()

        skills_to_add = []
        skills_to_prioritize = []

        for skill in skill_keywords[:30]:
            if skill['skill'] not in user_skills:
                skills_to_add.append({
                    'skill': skill['skill'],
                    'priority': 'high' if skill['importance'] >= 8 else 'medium',
                    'action': 'add'
                })
            else:
                skills_to_prioritize.append({
                    'skill': skill['skill'],
                    'priority': 'high',
                    'action': 'prioritize'
                })

        return skills_to_add[:15] + skills_to_prioritize[:10]


class SEOScoringService:
    """Calculate LinkedIn SEO scores"""

    # Score weights (must sum to 1.0)
    WEIGHTS = {
        'keyword_relevance': 0.35,
        'profile_completeness': 0.25,
        'skill_match': 0.25,
        'structural_quality': 0.15,
    }

    @staticmethod
    def calculate_scores(
        profile_snapshot: UserProfileSnapshot,
        analysis_data: Dict,
        keywords: List[KeywordCluster]
    ) -> Dict[str, float]:
        """
        Calculate all SEO scores
        Returns: {
            'keyword_relevance_score': float,
            'profile_completeness_score': float,
            'skill_match_score': float,
            'structural_quality_score': float,
            'seo_score': float (weighted total)
        }
        """
        # 1. Keyword Relevance Score (0-100)
        keyword_relevance = min(analysis_data.get('keyword_match_percentage', 0), 100)

        # 2. Profile Completeness Score (0-100)
        completeness = analysis_data.get('completeness', {})
        completeness_count = sum([1 for v in completeness.values() if v])
        profile_completeness = min((completeness_count / max(len(completeness), 1)) * 100, 100)

        # 3. Skill Match Score (0-100)
        # Fix: Only count important matched skills to match the denominator
        matched_skills = len([
            k for k in analysis_data.get('matched_keywords', [])
            if k['category'] == 'skill' and k.get('importance', 0) >= 5.0
        ])
        total_important_skills = len([
            k for k in keywords
            if k.category == 'skill' and k.importance_score >= 5.0
        ])

        if total_important_skills > 0:
            skill_match = (matched_skills / total_important_skills) * 100
        else:
            # If no important skills found in competitors, fallback or give full score if some skills present
            skill_match = 100 if matched_skills > 0 else 0

        skill_match = min(skill_match, 100)

        # 4. Structural Quality Score (0-100)
        structural_quality = min(SEOScoringService._calculate_structural_quality(profile_snapshot), 100)

        # Calculate weighted SEO score
        seo_score = (
            keyword_relevance * SEOScoringService.WEIGHTS['keyword_relevance'] +
            profile_completeness * SEOScoringService.WEIGHTS['profile_completeness'] +
            skill_match * SEOScoringService.WEIGHTS['skill_match'] +
            structural_quality * SEOScoringService.WEIGHTS['structural_quality']
        )

        # Final cap to ensure it never exceeds 100
        seo_score = min(seo_score, 100.0)

        print(f"DEBUG: Keyword Relevance: {keyword_relevance}")
        print(f"DEBUG: Profile Completeness: {profile_completeness}")
        print(f"DEBUG: Skill Match: {skill_match}")
        print(f"DEBUG: Structural Quality: {structural_quality}")
        print(f"DEBUG: Total SEO Score: {seo_score}")

        return {
            'keyword_relevance_score': round(keyword_relevance, 2),
            'profile_completeness_score': round(profile_completeness, 2),
            'skill_match_score': round(skill_match, 2),
            'structural_quality_score': round(structural_quality, 2),
            'seo_score': round(seo_score, 2),
        }

    @staticmethod
    def _calculate_structural_quality(profile_snapshot: UserProfileSnapshot) -> float:
        """Calculate structural quality score based on formatting, length, etc."""
        score = 0.0

        # Headline quality (20 points)
        if profile_snapshot.headline_text:
            headline_len = len(profile_snapshot.headline_text)
            if 40 <= headline_len <= 220:
                score += 20
            elif headline_len > 0:
                score += 10

        # About section quality (30 points)
        if profile_snapshot.about_text:
            about_len = len(profile_snapshot.about_text)
            if 300 <= about_len <= 2600:
                score += 30
            elif about_len > 100:
                score += 15

        # Experience quality (30 points)
        if profile_snapshot.experience_text:
            exp_len = len(profile_snapshot.experience_text)
            # Check for bullet points or structured format
            has_bullets = '•' in profile_snapshot.experience_text or '-' in profile_snapshot.experience_text
            if exp_len > 200 and has_bullets:
                score += 30
            elif exp_len > 100:
                score += 15

        # Skills quality (20 points)
        if profile_snapshot.skills_text:
            # Estimate skill count (rough heuristic)
            skill_count = len(profile_snapshot.skills_text.split(','))
            if skill_count >= 10:
                score += 20
            elif skill_count >= 5:
                score += 10

        return score
