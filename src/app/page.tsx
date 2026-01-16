import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          T5T - Top 5 Things
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Track, analyze, and gain insights from your team&apos;s weekly updates.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Easy Submission</h3>
            <p className="text-sm text-gray-600">
              Team members simply CC an email address on their Friday T5T emails.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-sm text-gray-600">
              Automatic theme extraction, sentiment analysis, and trend detection.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Team Insights</h3>
            <p className="text-sm text-gray-600">
              Track AI adoption, automation progress, and identify blockers.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
