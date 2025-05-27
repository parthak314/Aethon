from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter
from urllib.robotparser import RobotFileParser
from typing import Optional, Tuple
import requests
from bs4 import BeautifulSoup

TIMEOUT = 10
MAX_RETRIES = 3

class WebScraper:
    def __init__(self, timeout: int = TIMEOUT, max_retries: int = MAX_RETRIES):
        self.session = requests.Session()
        self.timeout = timeout
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Accept-Language': 'en-US,en;q=0.5' # q value such that it accepts any english content
        }

        # When retrying, we will wait 0.2 seconds before the first retry and double the wait time for each subsequent retry.
        retry = Retry(
            total=MAX_RETRIES,
            backoff_factor=0.2,
            status_forcelist=[500, 502, 503, 504]
        )

        # Retry logic is applied to both HTTP and HTTPS requests.
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount('http://', adapter)
        self.session.mount('https://', adapter)

    # Use robots.txt to check if the URL can be fetched
    def _can_fetch(self, url: str) -> bool:
        try:
            rp = RobotFileParser()
            rp.set_url(f'{url.rstrip("/")}/robots.txt')
            rp.read()
            return rp.can_fetch(self.headers['User-Agent'], url) # Check page permissions
        except Exception as e:
            print(f"Error checking robots.txt: {e}")
            return True # Default to True if robots.txt cannot be read

    def fetch_page(self, url: str) -> Tuple[Optional[str], Optional[str]]:
        if not self._can_fetch(url):
            raise Exception(f"Fetching {url} is disallowed by robots.txt")
            return None, None

        try:
            response = self.session.get(
                url,
                headers=self.headers,
                timeout=self.timeout
            )
            response.raise_for_status() 
            return response.text, response.url
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None, None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None, None

    def _parse_content(self, content: str) -> str:
        try:
            soup = BeautifulSoup(content, 'html.parser')

            # Remove unwanted elements
            for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
                element.decompose()
            
            selectors = [
                'article',
                'main',
                'div.content',
                'div.main-content',
                'div.post-content',
            ]
            for selector in selectors:
                element = soup.select_one(selector)
                if element:
                    return element.get_text(separators='\n', strip=True)

        except Exception as e:
            print(f"Error parsing content: {e}")
            return ''
        
if __name__ == '__main__':
    scraper = WebScraper()
    raw_html, content = scraper.fetch_page("https://www.nandos.co.uk/")
    print(f"Content length: {len(content)} characters")
    print(f"Raw HTML length: {len(raw_html)} characters")
