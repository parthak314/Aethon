from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from typing import Dict, Any

from utils.web_scraper import WebScraper
from utils.image_processing import ImageProcessor
from sonar_client import SonarClient

app = Flask(__name__)
CORS(app)

sonar = SonarClient()
web_scraper = WebScraper()
image_processor = ImageProcessor()

@app.route('/analyse', methods=['GET', 'POST'])  
def analyse() -> Dict[str, Any]: 
    try:
        data = request.get_json() 
        print("Received data:", data)  
        if not data:
            print("Missing required fields in request data.")
            return jsonify({"error": "Missing Fields"}), 400

        input_type = data['input'][0]
        content = data['input'][1]

        # if content.startswith('http'):
        #     model_type = data.get('model_type', 'review')
        # else:

        processed_text = ""
        if input_type == "image":
            try:
                # processed_img, text = image_processor.process_image(content)
                # processed_text = text

                processed_text = content
                model_type = 'prescription'

            except Exception as e:
                print(f"Image processing error: {str(e)}")
                return jsonify({"error": f"Image processing failed: {str(e)}"}), 400

        elif input_type == 'url':
            try:
                _, content = web_scraper.fetch_page(content)
                processed_text = content if content else ""
                model_type = 'reviews'
            except Exception as e:
                print(f"Web scraping error: {str(e)}")
                return jsonify({"error": f"Web scraping failed: {str(e)}"}), 400

        elif input_type == 'text':
            processed_text = content
        
        else:
            print("Invalid input type provided.")
            return jsonify({"error": "Invalid input type"}), 400
        
        # Validate processed text
        if not processed_text.strip():
            print("No processable content found.")
            return jsonify({"error": "No processable content found"}), 400
        
        # Validate model type
        if model_type not in ['prescription', 'reviews']:
            print("Invalid model type provided.")
            return jsonify({"error": "Invalid model type"}), 400

        print(f"Processing text: {processed_text[:1000]}...")

        try:
            analysis = sonar.analyse( text=processed_text if input_type != 'image' else None,
                                      image_base64=processed_text if input_type == 'image' else None,
                                      model_type=model_type)
        except Exception as e:
            print(f"Sonar error: {str(e)}")
            return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

        print("Analysis result:", analysis)  
        return jsonify({
            "fraud_detected": analysis.get('is_fraud', False),
            "reasoning": analysis.get('reasoning', ''),
            "confidence": analysis.get('confidence', 0.5),
            "processed_text": processed_text
        })

    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/status', methods=['GET'])
def status_check() -> Dict[str, Any]:
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
