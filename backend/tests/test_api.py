import pytest
from unittest.mock import patch, MagicMock
from backend.src.app import app
from backend.src.utils.web_scraper import WebScraper
import base64

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@patch('backend.src.app.sonar.analyze')
@patch('backend.src.app.process_url')
def test_url_analysis(mock_process_url, mock_sonar, client):
    """Test URL analysis endpoint with valid input"""
    # Mock dependencies
    mock_process_url.return_value = "Sample website text content"
    mock_sonar.return_value = {
        "is_fraud": True,
        "reasoning": "Fraud detected: fake reviews pattern matched",
        "sources": []
    }

    # Test request
    response = client.post('/detect-fraud', json={
        "input_type": "url",
        "content": "https://example.com",
        "model_type": "reviews"
    })

    assert response.status_code == 200
    data = response.get_json()
    assert data['fraud_detected'] is True
    assert "fake reviews" in data['reasoning'].lower()

@patch('backend.src.app.sonar.analyze')
@patch('backend.src.app.process_image')
def test_image_analysis(mock_process_image, mock_sonar, client):
    """Test image analysis endpoint with valid input"""
    # Mock dependencies
    mock_process_image.return_value = "Sample text from OCR"
    mock_sonar.return_value = {
        "is_fraud": False,
        "reasoning": "Legitimate prescription detected",
        "sources": []
    }

    # Create test image (1x1 pixel)
    test_image = base64.b64encode(b"fake_image_data").decode('utf-8')

    response = client.post('/detect-fraud', json={
        "input_type": "image",
        "content": test_image,
        "model_type": "prescription"
    })

    assert response.status_code == 200
    data = response.get_json()
    assert data['fraud_detected'] is False
    assert "legitimate" in data['reasoning'].lower()

def test_missing_parameters(client):
    """Test endpoint with missing required parameters"""
    response = client.post('/detect-fraud', json={
        "input_type": "url",
        # Missing 'content' field
    })
    assert response.status_code == 400
    assert "error" in response.get_json()

@patch('backend.src.app.process_url')
def test_failed_scraping(mock_process_url, client):
    """Test URL analysis with failed content extraction"""
    mock_process_url.return_value = None
    
    response = client.post('/detect-fraud', json={
        "input_type": "url",
        "content": "https://invalid.url",
        "model_type": "reviews"
    })
    
    assert response.status_code == 400
    assert "failed" in response.get_json()['error'].lower()

@patch('backend.src.app.sonar.analyze')
def test_sonar_failure(mock_sonar, client):
    """Test Sonar API failure scenario"""
    mock_sonar.side_effect = Exception("API timeout")
    
    response = client.post('/detect-fraud', json={
        "input_type": "text",
        "content": "sample text",
        "model_type": "prescription"
    })
    
    assert response.status_code == 500
    assert "error" in response.get_json()

def test_invalid_input_type(client):
    """Test with unsupported input type"""
    response = client.post('/detect-fraud', json={
        "input_type": "invalid_type",
        "content": "data",
        "model_type": "prescription"
    })
    
    assert response.status_code == 400
    assert "invalid" in response.get_json()['error'].lower()

@patch('backend.src.app.sonar.analyze')
def test_direct_text_analysis(mock_sonar, client):
    """Test direct text input analysis"""
    mock_sonar.return_value = {
        "is_fraud": True,
        "reasoning": "Fake review patterns detected",
        "sources": []
    }
    
    response = client.post('/detect-fraud', json={
        "input_type": "text",
        "content": "This product is amazing!",
        "model_type": "reviews"
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['fraud_detected'] is True
