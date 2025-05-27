from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from typing import Dict, Any

from .sonar_client import SonarClient
from utils.web_scraper import WebScraper
from utils.image_processor import ImageProcessor

app = Flask(__name__)
CORS(app)

sonar = SonarClient()
web_scraper = WebScraper()
image_processor = ImageProcessor()

@app.route('/analyse', methods=['POST'])
def analyse() -> Dict[str, Any]:
    try:
        if not data or 'input_type' not in data or 'content' not in data:
            return jsonify({"error": "Missing Fields"}), 400

        input_type = data['input_type']
        content = data['content']
        model_type = data.get('model_type', 'prescription')

        processed_text = ""
        if input_type == 'image':
            if ',' in content:
                content = content.split(',')[1]
            
            try:
                processed_img, text = image_processor.process_image(content)
                processed_text = text if text else ""
            except Exception as e:
                return jsonify({"error": f"Image processing failed: {str(e)}"}), 400

        elif input_type == 'url':
            try:
                raw_html, content = web_scraper.getch_page(content)
                processed_text = content if content else ""
            except Exception as e:
                return jsonify({"error": f"Web scraping failed: {str(e)}"}), 400

        elif input_type == 'text':
            processed_text = content
        
        else:
            return jsonify({"error": "Invalid input type"}), 400
        
        if model_type not in ['prescription', 'review']:
            return jsonify({"error": "Invalid model type"}), 400

        try:
            analysis = sonar.analyse(processed_text, model_type=model_type)
        except Exception as e:
            return jsonify({"error": f"Sonar analysis failed: {str(e)}"}), 500

        return jsonify({
            "fraud_detected": analysis['is_fraud'],
            "reasoning": analysis['reasoning'],
            "confidence": analysis['confidence'],
            "processed_text": processed_text
        })

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check() -> Dict[str, Any]:
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
