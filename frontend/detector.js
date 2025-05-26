import React, { useState, useRef } from 'react';
import axios from 'axios';

const FraudDetector = () => {
    const [inputType, setInputType] = useState('text');
    const [modelType, setModelType] = useState('prescription');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleSubmit = async (content) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/detect-fraud', {
                input_type: inputType,
                content: content,
                model_type: modelType
            });

            setResult({
                isFraud: response.data.fraud_detected,
                reasoning: response.data.reasoning
            });
        } catch (error) {
            console.error('Error:', error);
            setResult({ error: 'Analysis failed' });
        }
        setLoading(false);
    };

    // Webcam handling
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        } catch (err) {
            console.error('Error accessing webcam:', err);
        }
    };

    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
        handleSubmit(imageData);
    };

    return (
        <div className="container">
            <h1>Fraud Detection System</h1>

            {/* Model Selection */}
            <div className="model-select">
                <label>
                    <input
                        type="radio"
                        value="prescription"
                        checked={modelType === 'prescription'}
                        onChange={(e) => setModelType(e.target.value)}
                    />
                    Prescription Analysis
                </label>
                <label>
                    <input
                        type="radio"
                        value="reviews"
                        checked={modelType === 'reviews'}
                        onChange={(e) => setModelType(e.target.value)}
                    />
                    Review/Article Analysis
                </label>
            </div>

            {/* Input Type Selection */}
            <div className="input-select">
                <select onChange={(e) => setInputType(e.target.value)}>
                    <option value="text">URL/Text</option>
                    <option value="image">Image Upload</option>
                    <option value="webcam">Webcam Capture</option>
                </select>
            </div>

            {/* Input Handling */}
            {inputType === 'text' && (
                <div className="text-input">
                    <input
                        type="text"
                        placeholder="Enter URL or text"
                        onBlur={(e) => handleSubmit(e.target.value)}
                    />
                </div>
            )}

            {inputType === 'image' && (
                <div className="image-upload">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const reader = new FileReader();
                            reader.onload = (evt) => handleSubmit(evt.target.result.split(',')[1]);
                            reader.readAsDataURL(e.target.files[0]);
                        }}
                    />
                </div>
            )}

            {inputType === 'webcam' && (
                <div className="webcam-capture">
                    <button onClick={startWebcam}>Start Webcam</button>
                    <video ref={videoRef} autoPlay playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <button onClick={captureImage}>Capture & Analyze</button>
                </div>
            )}

            {/* Results Display */}
            {loading && <div className="loading">Analyzing...</div>}

            {result && !result.error && (
                <div className={`result ${result.isFraud ? 'fraud' : 'legitimate'}`}>
                    <h3>{result.isFraud ? '⚠ Potential Fraud Detected' : '✅ Likely Legitimate'}</h3>
                    <p>{result.reasoning}</p>
                </div>
            )}

            {result?.error && <div className="error">{result.error}</div>}
        </div>
    );
};

export default FraudDetector;
