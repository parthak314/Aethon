"""
Take in user input from frontend.

Input is a user selection of either image upload, image capture via webcam, or text (url).
User also selects a model to use for fraud detection. (prescription vs review/article)

Analyse the image and send to Sonar for fraud detection.
acquire the result from Sonar.

Return to frontend with an array of ["fraud?", "reasoning"]
"""

from utils.sonar import SonarClient
from flask import Flask, request, jsonify
from flask_cors import CORS
from sonar_client import SonarClient
import base64
import requests
from bs4 import BeautifulSoup
from io import BytesIO
from PIL import Image
import pytesseract
import os

app = Flask(__name__)
CORS(app)
sonar = SonarClient()

def process_image(image_data):
    try:
        image = Image.open(BytesIO(base64.b64decode(image_data)))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        return None

def process_url(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Prioritize common content containers
        selectors = ['article', 'div.main-content', 'div.content', 'div.post']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(separator='\n', strip=True)
        
        return soup.get_text(separator='\n', strip=True)
    except Exception as e:
        print(f"URL Processing Error: {str(e)}")
        return None

@app.route('/detect-fraud', methods=['POST'])
def detect_fraud():
    try:
        data = request.json
        
        # Validate input
        if not data or 'input_type' not in data or 'content' not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Process input
        text = None
        input_type = data['input_type']
        content = data['content']
        
        if input_type in ['image', 'webcam']:
            text = process_image(content)
        elif input_type == 'url':
            text = process_url(content)
        elif input_type == 'text':
            text = content
        else:
            return jsonify({"error": "Invalid input type"}), 400
        
        if not text:
            return jsonify({"error": "Failed to process input"}), 400
        
        # Get model type
        model_type = data.get('model_type', 'prescription')
        
        # Analyze with Sonar
        analysis = sonar.analyze(text, model_type)
        
        return jsonify({
            "fraud_detected": analysis["is_fraud"],
            "reasoning": analysis["reasoning"]
        })
        
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
