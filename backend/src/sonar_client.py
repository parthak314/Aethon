from openai import OpenAI
import os
from typing import Dict, Union, Generator, Optional
from dotenv import load_dotenv

load_dotenv()

class SonarClient:
    def __init__(self, api_key: str = None):
        self.client = OpenAI(
            api_key=os.getenv('PERPLEXITY_API_KEY'),
            base_url=os.getenv('SONAR_BASE_URL')
        )
        self.model = 'sonar-pro'

    def analyse(self, text: str, model_type: str = "reviews", stream: bool = False, image_base64: str = None) -> Union[Dict, Generator]:
        try: 
            messages = self._build_messages(text, image_base64, model_type)
            if stream:
                return self._handle_stream(messages, model_type)
            else:
                return self._handle_non_stream(messages, model_type)
            
        except Exception as e:
            print(f"Error during analysis: {e}")
            return {"error": str(e)}
    
    def _get_system_prompt(self, model_type: str) -> str:
        prompts = {
            "prescription": (
                """
                You are a highly specialized medical fraud detection AI trained on a vast corpus of authentic and forged prescriptions, pharmacological databases, and clinical best practices. 
                Your primary objective is to identify fraudulent, forged, or medically unsafe prescriptions.

                Analyze each prescription for the following:
                - Logical consistency between medication, dosage, and patient context (if provided).
                - Invalid, outdated, or dangerous drug combinations.
                - Red flags such as impossible dosages, incorrect formats, or unlicensed prescribers.
                - Signs of forgery, such as inconsistent terminology, atypical abbreviations, or altered structure.

                Output a structured analysis that includes:
                1. Specific fraud indicators found.
                2. Risk level (Low / Moderate / High).
                3. Recommended actions (e.g., flag for review, urgent rejection, pharmacist verification).
                4. Reasoning grounded in clinical knowledge and fraud detection patterns.

                Act with precision, caution, and a strong bias toward patient safety.

                Do not answer in the first person, but answer as through a medical fraud detection AI, with a professional and objective tone.
                """
            ),
            "reviews": (
                """
                You are an advanced AI trained in linguistic forensics and deception detection, with expertise in analyzing online reviews and articles for fraud, manipulation, and astroturfing.

                Your task is to evaluate the authenticity of the provided content by:
                - Identifying unnatural patterns such as exaggerated positivity/negativity, repetition, emotional inflation, or copy-paste anomalies.
                - Detecting signs of coordinated bot activity, sudden review bursts, or unnatural reviewer behavior.
                - Analyzing language for deception markers: hedging, vagueness, hyperbole, or implausible specificity.

                Provide an expert report including:
                1. Linguistic and behavioral fraud signals present.
                2. Confidence level in the detection (Low / Medium / High).
                3. Examples from the text supporting your assessment.
                4. Final verdict: Likely Genuine / Possibly Fraudulent / Likely Fraudulent.

                Base your output on known patterns in fake reviews, psychological profiling, and forensic linguistic principles.

                Do not answer in the first person, but answer as through a medical fraud detection AI, with a professional and objective tone.
                """
            )
        }
        return prompts.get(model_type)


    def _build_messages(self, text: Optional[str], image_base64: Optional[str], model_type: str) -> list:
        # content = []
        # if text:
        #     content.append({"type": "text", "text": text})
        # if image_base64:
        #     clean_base64 = image_base64.split(",", 1)[-1]
        #     content.append({"type": "image_url", "image": f"data:image/png;base64,{clean_base64}"})

        # return [
        #     {
        #         "role": "system",
        #         "content": self._get_system_prompt(model_type)
        #     },
        #     {
        #         "role": "user",
        #         "content": text
        #     }
        # ]

        messages = [
            {
                "role": "system",
                "content": self._get_system_prompt(model_type)
            }
        ]

        content = []

        if text and not image_base64:
            content.append({
                "type": "text",
                "text": text
            })
        elif image_base64:
            content.append({
                "type": "text",
                "text": "Please analyze the provided image."
            })
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{image_base64}"
                }
            })

        messages.append({"role": "user", "content": content})

        print(f"Messages for {model_type} model: {messages}")
        return messages
    
    def _handle_non_stream(self, messages: list, model_type: str) -> Dict:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=250,
            temperature=0.25
        )
        content = response.choices[0].message.content.strip()
        return self._parse_response(content)

    def _handle_stream(self, messages: list, model_type: str) -> Generator:
        stream = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=250,
            temperature=0.25,
            stream=True
        )

        full_response = []
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                full_response.append(content)
                yield {"partial": content}
        yield self._parse_response(''.join(full_response)) 

    def _parse_response(self, content: str) -> Dict:
        fraud_keywords = ["fraud", "forgery", "unsafe", 
                          "dangerous", "invalid", "red flag",
                          "unlicensed", "counterfeit", "suspicious"]
        return {
            "fraud_detected": any(keyword in content.lower() for keyword in fraud_keywords),
            "reasoning": content.strip(),
            "confidence": self._calculate_confidence(content)
        }

    def _calculate_confidence(self, text: str) -> float:
        confidence = 0.5
        if "high confidence" in text.lower():
            confidence += 0.3
        if "recommend verification" in text.lower():
            confidence -= 0.2
        return max(0.0, min(1.0, confidence))

if __name__ == "__main__":
    client = SonarClient()
    
    # Non-streaming
    result = client.analyse(
        text="This prescription for 100 oxycodone tablets seems irregular",
        model_type="prescription"
    )
    print(f"Fraud Detected: {result['fraud_detected']}")
    print(f"Reasoning: {result['reasoning']}")
    
    # Streaming
    for chunk in client.analyse(
        text="These 5-star reviews all use identical wording",
        model_type="reviews",
        stream=True
    ):
        if 'partial' in chunk:
            print(chunk['partial'], end="", flush=True)
        else:
            print(f"\nFinal Confidence: {chunk['confidence']:.0%}")

        