# Aethon Fraud Detection API Reference

Note: As of 28/5/2024, the API is in development and not yet publicly available.

## Authentication
<!-- `No authentication required for public endpoints` (Planned) -->
`Only accessible locally` (Development)

## Base URL
<!-- `https://api.aethon.ai/v1` (Production)   -->
`http://localhost:5000` (Development)

---

## Endpoints

### POST `/analyze`
Analyse content for potential fraud

**Request:**
```json
{
  "input": ["<type>", "<content>"],
  "model_type": "prescription|reviews"
}
```
or

```json
{
  "input": ["image", "<base64_image_data>"]
}
```

| Parameter  | Required | Values                              | Description                              |
| ---------- | -------- | ----------------------------------- | ---------------------------------------- |
| input[0]   | Yes      | `image`, `text`, `url`              | Input type                               |
| input[1]   | Yes      | String                              | Base64 image, text content, or valid URL |
| model_type | No       | `prescription` (default), `reviews` | Analysis model to use                    |


## Response (success):
```json
{
  "fraud_detected": true,
  "reasoning": "The prescription shows signs of forgery...",
  "confidence": 0.92,
  "processing_time": 1.45
}
```
## Response (error):
```json
{
  "error": "Invalid input format",
  "code": 400,
}
```

### GET `/status`
Check API status
**Response:**
```json
{
  "status": "ok"
}
```

<!-- ```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": "24h 30m"
}
``` -->