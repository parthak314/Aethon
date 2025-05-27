import os
import requests

SYSTEM_PROMPT = """
You are an expert fraud detection analyst. Your task is to analyze the provided text for potential fraud indicators. 
Look for inconsistencies, verify claims, and provide detailed reasoning on whether the content is likely fraudulent or not. 
Use your expertise to identify key phrases and patterns that suggest fraud.
""" 

class SonarClient:
    def __init__(self):
        self.api_key = os.environ.get('PERPLEXITY_API_KEY')
        self.base_url = "https://api.perplexity.ai/sonar/"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    # Change model type based on type of content to parse
    def analyse(self, text, model_type):
        """Analyse text using specified Sonar model"""
        endpoint_map = {
            "prescription": ("deep-research", "medical"),
            "reviews": ("reasoning-pro", "ecommerce")
        }
        
        if model_type not in endpoint_map:
            raise ValueError("Invalid model type. Use 'prescription' or 'reviews'")
        
        endpoint, focus = endpoint_map[model_type]
        
        payload = {
            "query": f"{SYSTEM_PROMPT}\n\nContent: {text[:3000]}",
            "focus": focus,
            "max_results": 3
        }
        
        response = requests.post(
            f"{self.base_url}{endpoint}",
            headers=self.headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"Sonar API Error: {response.text}")
        
        return self._parse_response(response.json())
    
    def _parse_response(self, data):
        fraud_keywords = {
            "prescription": ["forged", "counterfeit", "unlicensed", "overdose"],
            "reviews": ["fake", "bot", "deceptive"]
        }
        
        answer = data.get("answer", "").lower()
        model_type = "prescription" if "medical" in data.get("focus", "") else "reviews"
        
        return {
            "is_fraud": any(keyword in answer for keyword in fraud_keywords[model_type]),
            "reasoning": data.get("answer", "No analysis available"),
            # "sources": data.get("sources", [])[:3] # required?
        }
    