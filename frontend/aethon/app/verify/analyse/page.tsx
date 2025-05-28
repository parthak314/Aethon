"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  LineChartIcon as ChartLine,
  Stethoscope,
  Heart,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { getApiUrl } from "../../config"
import { useSearchParams } from "next/navigation"
import ReactMarkdown from "react-markdown"


interface ServerResponse {
  fraud_detected: boolean
  reasoning: string
  confidence: number
  processed_text: string
}

export default function Analyse() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ServerResponse | null>(null)
  const searchParams = useSearchParams()

  const riskScore = Math.round((1 - (data?.confidence ?? 0)) * 100)

  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      if (data) {
        setIsLoading(false)
      }
    }, 2000)

    return () => clearTimeout(minLoadingTime)
  }, [data])

  useEffect(() => {
    // Get data from URL query parameters or localStorage
    const source = searchParams.get("source");
    const queryData = searchParams.get("data");

    if (source === "local") {
      try {
        const localData = localStorage.getItem('analysisData');
        if (localData) {
          setData(JSON.parse(localData));
          // Clean up after use
          localStorage.removeItem('analysisData');
        } else {
          throw new Error("No data found in localStorage");
        }
      } catch (e) {
        console.error("Error retrieving local data:", e);
        // Handle error
      }
    } else if (queryData) {
      try {
        setData(JSON.parse(queryData));
      } catch (e) {
        console.error("Error parsing data:", e);
        // Handle error
      }
    } else {
      // Handle missing data case
      console.error("No analysis data received");
      setData({
        fraud_detected: false,
        reasoning: "No analysis data available. Please submit content first.",
        confidence: 0,
        processed_text: ""
      });
    }
    setIsLoading(false);
  }, [searchParams])

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: "Low Risk", color: "emerald", icon: CheckCircle }
    if (score <= 70) return { level: "Medium Risk", color: "orange", icon: AlertTriangle }
    return { level: "High Risk", color: "red", icon: XCircle }
  }

  const risk = getRiskLevel(riskScore)
  const RiskIcon = risk.icon

  const CircularProgress = ({ percentage, size = 200 }: { percentage: number; size?: number }) => {
    const radius = (size - 20) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    const ringColor =
      risk.color === "emerald" ? "text-emerald-500" : risk.color === "orange" ? "text-orange-500" : "text-red-500"

    const textColor = ringColor.replace("500", "600")

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-200"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${ringColor} transition-all duration-1000 ease-out`}
            fill="transparent"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${textColor}`}>{percentage}%</span>
          <span className="text-sm text-gray-600 mt-1">Risk Score</span>
        </div>
      </div>
    )
  }

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

  if (isLoading || !data) {
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
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl py-2 font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Analysis Complete
          </h1>
          <p className="text-gray-600 text-lg">Fraud detection results</p>
        </header>

        <div className="bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden">
          <section className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <CircularProgress percentage={riskScore} />
              <div className="mt-4 text-center">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <RiskIcon
                    className={`w-6 h-6 ${
                      risk.color === "emerald"
                        ? "text-emerald-600"
                        : risk.color === "orange"
                          ? "text-orange-600"
                          : "text-red-600"
                    }`}
                  />
                  <span
                    className={`text-xl font-bold ${
                      risk.color === "emerald"
                        ? "text-emerald-600"
                        : risk.color === "orange"
                          ? "text-orange-600"
                          : "text-red-600"
                    }`}
                  >
                    {risk.level}
                  </span>
                </div>
                <p className="text-gray-600">Fraud Risk Assessment</p>
              </div>
            </div>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <ChartLine className="w-6 h-6 text-purple-600" />
              Analysis Results
            </h2>
             <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-blue-700 leading-relaxed">{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-blue-700 text-3xl font-bold my-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-blue-700 text-2xl font-semibold my-3">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-blue-700 text-xl font-medium my-2">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-blue-700">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside text-blue-700">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="ml-4 text-blue-700">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-400 pl-4 italic text-blue-600 my-4">
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-blue-700">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-blue-700">{children}</em>
                    ),
                  }}
                >
                  {data.reasoning}
              </ReactMarkdown>
            </div>

            <div className="flex justify-center mt-8">
              <Link
                href="/verify"
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full
                           hover:from-emerald-600 hover:to-teal-600 transition duration-300 shadow-lg hover:shadow-xl
                           transform hover:-translate-y-1 font-semibold"
              >
                Analyse Another
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
