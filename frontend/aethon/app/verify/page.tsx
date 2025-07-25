"use client"

import type React from "react"

import Link from "next/link"
import { getApiUrl } from "../config";
import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Webcam from "react-webcam"
import { Camera, Upload, LinkIcon, FileText, MessageSquare, CheckCircle, RotateCcw, BadgeCheck, Check, Stethoscope, Heart, Activity } from "lucide-react"


const videoConstraints = {
  width: 1080,
  height: 720,
  facingMode: "user",
}

export default function Verify() {
  const [current, set] = useState<"default" | "prescription" | "review" | "photo" | "upload" | "url">("default")
  const [file, setFile] = useState<File>()
  const webcamRef = useRef<Webcam>(null)
  const [image, setImage] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  

  const capture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot()
    if (screenshot) {
      setImage(screenshot)
    }
  }, [webcamRef])

  const compressImage = (base64: string, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080; 
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = base64;
    });
  };

  const Submit = async () => {
    setIsSubmitting(true);
    try {
      let payload = [];

      if (current == "photo") {
        // Compress image before sending (same dimensions, lower quality)
        const compressedImage = await compressImage(image!);
        payload = ["image", compressedImage];
      }
      else if (current == "review") {
        payload = ["url", inputValue];
      }
      else {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file!);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        // Also compress uploaded images
        const compressedImage = await compressImage(base64);
        payload = ["image", compressedImage];
      }

      const res = await fetch(getApiUrl("ANALYSE"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: payload }),
      });

      const data = await res.json();
      console.log(data)
      
      const minimalData = {
        fraud_detected: data.fraud_detected,
        reasoning: data.reasoning,
        confidence: data.confidence
      };
      
      localStorage.setItem('analysisData', JSON.stringify(minimalData));
      router.push(`/verify/analyse?source=local`);
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
};

  const MedicalLoadingSpinner = () => {
    return (
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 border-r-pink-500 rounded-full animate-spin"></div>
        <div className="absolute inset-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <div className="relative">
            <Stethoscope className="w-8 h-8 text-purple-600 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute -top-1 -right-1">
              <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-500 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1"></div>
          <div className="absolute left-0 top-1/2 w-2 h-2 bg-orange-500 rounded-full transform -translate-y-1/2 -translate-x-1"></div>
          <div className="absolute right-0 top-1/2 w-2 h-2 bg-teal-500 rounded-full transform -translate-y-1/2 translate-x-1"></div>
        </div>

        {/* Pulse wave animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60">
            <div className="relative w-full h-full">
              <Activity className="absolute left-0 w-4 h-4 text-emerald-500 animate-pulse transform -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading screen when submitting
  if (isSubmitting) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="text-center space-y-8">
          <MedicalLoadingSpinner />

          <div className="space-y-4">
            <h1 className="text-4xl py-2 font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Analysing
            </h1>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 py-8">
      <section className="flex flex-col items-center px-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl py-2 font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Prescription Verification System
            </h1>
            <p className="text-gray-600 text-lg">Choose your verification method below</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              {/* Left Panel - Options */}
              <section className="lg:w-1/2 p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-r border-purple-200">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <Check className="w-6 h-6 text-purple-600" />
                    Verification Options
                  </h2>

                  {/* Main Options */}
                  <div className="space-y-3">
                    <button
                      onClick={() => set("prescription")}
                   className={`w-full cursor-pointer p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-3 ${
                      current === "prescription" || current === "photo" || current === "upload"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-purple-100 border border-purple-200 hover:border-purple-300"
                    }`}
                    >
                      <FileText className="w-5 h-5" />
                      <span className="font-semibold text-lg">Prescription Verification</span>
                    </button>

                    <button
                      onClick={() => set("review")}
                      className={`w-full cursor-pointer p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-3 ${
                        current === "review"
                          ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-blue-100 border border-blue-200"
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-semibold text-lg">Online Review Analysis</span>
                    </button>
                  </div>

                  {/* Sub-options for Prescription */}
                  {current === "prescription" && (
                    <div className="ml-8 space-y-3 mt-4">
                      <div className="h-px bg-gradient-to-r from-purple-300 to-pink-300 my-4"></div>
                      <button
                        onClick={() => set("photo")}
                        className={`w-full cursor-pointer p-3 rounded-lg text-left transition-all duration-300 flex items-center gap-3 ${
                          current === "photo"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-emerald-50 border border-emerald-200"
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span className="font-medium">Take Photo</span>
                      </button>

                      <button
                        onClick={() => set("upload")}
                        className={`w-full cursor-pointer p-3 rounded-lg text-left transition-all duration-300 flex items-center gap-3 ${
                          current === "upload"
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-orange-50 border border-orange-200"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span className="font-medium">Upload Photo</span>
                      </button>
                    </div>
                  )}

                  {current === "review" && (
                    <div className="ml-8 mt-4">
                      <div className="h-px bg-gradient-to-r from-blue-300 to-teal-300 my-4"></div>
                      <p className="text-gray-600 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Please enter the URL to the online review on the right
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Right Panel - Content */}
              <section className="lg:w-1/2 p-8">
                <div className="h-full flex flex-col">
                  {/* Photo Capture */}
                  {current === "photo" && (
                    <div className="flex flex-col items-center space-y-6 h-full justify-center">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-emerald-600" />
                        Camera Capture
                      </h3>

                      {!image ? (
                        <div className="space-y-4 flex flex-col items-center">
                          <div className="rounded-2xl overflow-hidden border-4 border-emerald-200 shadow-lg">
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={videoConstraints}
                              className="max-w-full h-auto"
                            />
                          </div>
                          <button
                            onClick={capture}
                            className="px-8 py-3 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 font-semibold"
                          >
                            <Camera className="w-5 h-5" />
                            Capture Photo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 flex flex-col items-center">
                          <div className="rounded-2xl overflow-hidden border-4 border-emerald-200 shadow-lg">
                            <img
                              src={image || "/placeholder.svg"}
                              alt="Captured prescription"
                              className="max-w-full h-auto"
                            />
                          </div>
                          <button
                            onClick={() => setImage(null)}
                            className="px-8 py-3 cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 font-semibold"
                          >
                            <RotateCcw className="w-5 h-5" />
                            Retake Photo
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* URL Input */}
                  {current === "review" && (
                    <div className="flex flex-col space-y-6 h-full justify-center">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-blue-600" />
                        Online Review URL
                      </h3>

                      <form className="space-y-4">
                        <div className="relative">
                          <input
                            type="url"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="https://example.com/review"
                            className="w-full p-4 border-2 border-blue-200 rounded-xl text-gray-700 bg-blue-50 focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-lg"
                          />
                          <LinkIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        </div>
                      </form>
                    </div>
                  )}

                  {/* File Upload */}
                  {current === "upload" && (
                    <div className="flex flex-col space-y-6 h-full justify-center">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-orange-600" />
                        Upload Prescription
                      </h3>
                      <div className="space-y-6">
                        <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 bg-orange-50 hover:bg-orange-100 transition-colors duration-300">
                          <div className="text-center space-y-4">
                            <Upload className="w-12 h-12 text-orange-500 mx-auto" />
                            <div>
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <span className="text-lg font-medium text-gray-700">Click to upload</span>
                                <span className="text-gray-500"> or drag and drop</span>
                              </label>
                              <input
                                id="file-upload"
                                type="file"
                                name="file"
                                onChange={(e) => setFile(e.target.files?.[0])}
                                className="hidden"
                                accept="image/*"
                              />
                            </div>
                            <p className="text-sm text-gray-500">PNG or JPG</p>
                          </div>
                        </div>

                        {file && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-700 font-medium">{file.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Default State */}
                  {current === "default" && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                      <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                        <FileText className="w-16 h-16 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Select Verification Method</h3>
                        <p className="text-gray-600">Choose an option from the left panel to begin verification</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Submit Button - No need to show submitting state here anymore */}
            {(current === "photo" && image) ||
            (current === "review" && inputValue) ||
            (current === "upload" && file) ? (
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200">
                <div className="flex justify-center">
                    <button 
                      onClick={() => Submit()} 
                      className="px-12 py-4 cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                    >
                      <span className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        Analyse & Submit
                      </span>
                    </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}
