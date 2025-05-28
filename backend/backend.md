# Backend Architecture Documentation
## System Overview
The backend system comprises multiple integrated components orchestrated through app.py:

1. `sonar_client.py` - API integration for analysis
2. `utils/image_processing.py` - Image preprocessing module
3. `utils/web_scraper.py` - Web content extraction module

## Core Server Implementation (app.py)
The application leverages Flask to implement a RESTful API service that processes client requests. The primary endpoint /analyse accepts both GET and POST requests at port 5000.

## Request Processing
The server validates incoming request data with the following structure:
```json
{
    "input": [
            "image|url|text",
            "base64_encoded_image_data|url_string|text_content"
    ]
}
```

Where:

- `input_type`: Specifies the data format ("image", "url")
- `payload`: Contains either base64-encoded image data or a URL string

Request Handling Flow
1. Data validation and extraction
2. Type-specific processing
3. Analysis via the SONAR client
4. Response generation and delivery

## Image Processing Module (image_processing.py)
This module handles image optimisation and preparation for fraud detection:

- Image refinement using OpenCV library to ensure quality preservation during transmission
- Proper formatting of base64-encoded image data by appending the required MIME type prefix: `data:image/png;base64,`
- Preparation of image metadata for SONAR API compatibility

## Web Content Extraction (web_scraper.py)
The web scraping module implements an ethical and robust approach to content extraction:

- Compliance Verification: Checks robots.txt for scraping permissions
- Resilient Retrieval: Implements request retry logic (maximum 3 attempts) with exponential backoff to handle transient server errors
- Content Sanitisation: Utilises BeautifulSoup4 to extract relevant content by targeting semantic HTML elements:
  - `<article>` - Primary content containers
  - `<main>` - Main page content
  - Various content divisions (`<div class="content">`, `<div class="main-content">`, etc.)

## Analysis Engine (sonar_client.py)
This module interfaces with the SONAR API for content analysis:

Key Features
1. Dual Processing Modes:
    - Synchronous Mode: Processes the entire request and returns complete results
    - Streaming Mode: Provides incremental results for real-time feedback
2. Message Construction: Dynamically builds API payloads based on content type and analysis parameters
3. Response Processing: Parses API responses to extract fraud detection indicators, confidence metrics, and supporting rationale

## Planned Enhancements
1. Infrastructure Upgrades:
    - Migration to Django framework for enhanced security and scalability
    - CI/CD pipeline integration via GitHub/GitLab workflows
2. Performance Optimisation:
   - Adaptive streaming/non-streaming selection based on performance metrics
   - Response caching and request batching
3. Analysis Refinement:
   - Advanced system prompts for improved detection accuracy
   - Custom model training for domain-specific fraud patterns
