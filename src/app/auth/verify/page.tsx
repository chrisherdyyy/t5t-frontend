'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/api'

function VerifyContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setError('No token provided')
      return
    }

    const verify = async () => {
      try {
        const response = await auth.verifyMagicLink(token)
        localStorage.setItem('t5t_token', response.data.access_token)
        localStorage.setItem('t5t_user', JSON.stringify(response.data.worker))
        setStatus('success')

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } }
        setStatus('error')
        setError(error.response?.data?.detail || 'Failed to verify link')
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <div className="w-full max-w-md text-center">
      {status === 'verifying' && (
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your login...</p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="text-green-500 text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div className="text-red-500 text-5xl mb-4">&#10007;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </main>
  )
}
