import Link from "next/link"
import { Zap, Stethoscope, FileText, AlertTriangle, MonitorCog} from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Hero Section */}
      <section className="flex flex-col items-center py-16 px-4">
        <div className="w-full max-w-4xl flex flex-col gap-8 bg-white p-8 rounded-3xl shadow-2xl border border-purple-200 items-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-3xl"></div>

          {/* Medical Icon Header */}
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex flex-col items-center text-center z-10">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Prescription Fraud Detection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Advanced verification system to identify and prevent fraudulent prescriptions or online reviews
            </p>
          </div>

          <div className="flex py-4 z-10">
            <button className="group px-8 py-4 cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3">
              <Link href="/verify" className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Start Verification</span>
              </Link>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="flex flex-col py-12 px-10 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <MonitorCog className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-4xl px-2 py-4 font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              About Our System
            </h2>
          </div>

          <div className="text-gray-700 text-lg leading-relaxed space-y-4">
            <p>
              Our advanced verification system utilises Sonar API to detect and prevent
              fraudulent prescriptions or online reviews, protecting both healthcare providers and patients.
            </p>
            <p>
              The system analyses prescription patterns, validates prescriber credentials, reviewer behaviour, information authenticity and identifies suspicious activities in real-time, providing a comprehensive report of its findings.
            </p>
            <p>
              Thanks to Sonar API, we provide healthcare professionals and patients with
              the tools they need to make informed decisions and maintain the integrity of prescription and online review
              distribution.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg w-fit mb-3">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-purple-800 mb-2">Fast Verification</h3>
              <p className="text-gray-600 text-sm">Quick response times resulting in a smooth verification process.</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg w-fit mb-3">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-emerald-800 mb-2">Medical Compliance</h3>
              <p className="text-gray-600 text-sm">Ensures patient data protection</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg w-fit mb-3">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Real-time Detection</h3>
              <p className="text-gray-600 text-sm">Instant fraud detection with comprehensive reporting</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
