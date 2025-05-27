from typing import Tuple, Optional
import base64
from PIL import Image, ImageEnhance
from io import BytesIO
import pytesseract
import numpy as np
import cv2

class ImageProcessor:
    def __init__(self, ocr_config:str = '--oem 3 --psm 6'):
        # Tesseract OCR configuration (default ocr engine with page segmentation mode 6)
        self.ocr_config = ocr_config
        self.supported_formats = ['jpg', 'jpeg', 'png', 'bmp', 'gif']
    
    def process_image(self, image_data: str) -> Tuple[Optional[str], Optional[str]]:
        # Typical string input: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
        if not image_data:
            print("No image data provided.")
            return None, None

        try:
            if isinstance(image_data, str):
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',', 1)[1]  # Extract base64 part
                img_bytes = base64.b64decode(image_data)
            else:
                img_bytes = image_data

            image = Image.open(BytesIO(img_bytes))

            if image.format.lower() not in self.supported_formats:
                print(f"Unsupported image format: {image.format}")
                return None, None
        
            processed_img = self._preprocess_image(image)
            temp_path = '/tmp/processed_image.png'
            processed_img.save(temp_path, format='PNG')
            text = pytesseract.image_to_string(processed_img, config=self.ocr_config)
            return temp_path, text.strip()

        except Exception as e:
            print(f"Error processing image data: {e}")
            return None, None
        
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        # Improve image quality for OCR
        try:
            cv_img = np.array(image)
            if cv_img.ndim == 3 and cv_img.shape[2] == 4:
                cv_img = cv2.cvtColor(cv_img, cv2.COLOR_BGRA2BGR)  # Remove transparency factor
            elif cv_img.ndim == 3:
                cv_img = cv2.cvtColor(cv_img, cv2.COLOR_RGB2BGR)  # Convert RGB to BGR
            else:
                cv_img = cv2.cvtColor(cv_img, cv2.COLOR_GRAY2BGR)

            cv_img = cv2.fastNlMeansDenoisingColored(cv_img, None, 10, 10, 7, 21)  # Denoise image
            cv_img = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
            cv_img = cv2.threshold(cv_img, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]  # Binarize image

            return Image.fromarray(cv_img)

        except Exception as e:
            print(f"Error converting image to array: {e}")
            return image
        
    @staticmethod
    def validate_webcam():
        capture = cv2.VideoCapture(0)
        if not capture.isOpened():
            print("Webcam not detected or not accessible.")
            return False
        capture.release()
        return True
    
if __name__ == "__main__":
    processor = ImageProcessor()
    with open('test-image.png', 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')
    
    path, text = processor.process_image(image_data)
    print(f'Extracted Text: {text} at {path}' if path else 'No text extracted.')
