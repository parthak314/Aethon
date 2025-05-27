"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, XCircle, FileText, } from "lucide-react"
import Link from "next/link"


export default function Analyse() {
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [riskScore] = useState(80) // Mock risk score - in real app this would come from analysis

  // Simulate loading and progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsLoading(false)
          clearInterval(timer)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(timer)
  }, [])

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: "Low Risk", color: "emerald", icon: CheckCircle }
    if (score <= 70) return { level: "Medium Risk", color: "orange", icon: AlertTriangle }
    return { level: "High Risk", color: "red", icon: XCircle }
  }

  const risk = getRiskLevel(riskScore)
  const RiskIcon = risk.icon

  // Circular progress component
  const CircularProgress = ({ percentage, size = 200 }: { percentage: number; size?: number }) => {
    const radius = (size - 20) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    // Get explicit color classes based on risk level
    const getProgressColor = () => {
      if (risk.color === "emerald") return "text-emerald-500"
      if (risk.color === "orange") return "text-orange-500"
      return "text-red-500"
    }

    const getTextColor = () => {
      if (risk.color === "emerald") return "text-emerald-600"
      if (risk.color === "orange") return "text-orange-600"
      return "text-red-600"
    }

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${getProgressColor()} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getTextColor()}`}>{percentage}%</span>
          <span className="text-sm text-gray-600 mt-1">Risk Score</span>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">{progress}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl py-2 font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Analysing Content
            </h1>
            <p className="text-gray-600 text-lg">Processing prescription data and checking for fraud indicators...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl py-2 font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Analysis Complete
          </h1>
          <p className="text-gray-600 text-lg">Prescription fraud detection results</p>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden">
          {/* Risk Score Section */}
          <div className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Circular Progress */}
              <div className="flex flex-col items-center">
                <CircularProgress percentage={riskScore} />
                <div className="mt-4 text-center">
                  <div className={`flex items-center gap-2 justify-center mb-2`}>
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
            </div>
          </div>

          {/* Detailed Results */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-600" />
              Analysis Results
            </h2>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
              <p className="text-blue-700 leading-relaxed">
                Based on our analysis, this prescription shows a <strong>low risk</strong> of being fraudulent. The
                prescription meets most standard verification criteria with only minor concerns that are within
                acceptable parameters. We recommend proceeding with standard verification protocols.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold">
                <Link href="\verify"> Analyse another </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
