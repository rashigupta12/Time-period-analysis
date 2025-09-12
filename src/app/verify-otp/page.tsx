'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Separate component that uses useSearchParams
function VerifyOTPContent() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  useEffect(() => {
    if (!userId) {
      router.push('/login')
    }
    // Start countdown for resend OTP
    setCountdown(30)
  }, [userId, router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp })
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to password change page
        router.push(`/change-password?userId=${userId}`)
      } else {
        setError(data.error || 'OTP verification failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!userId) return

    setResendLoading(true)
    setResendMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('New verification code sent to your email!')
        setCountdown(30) // Reset countdown
      } else {
        setError(data.error || 'Failed to resend OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-2xl font-bold text-white">
              Futuretek Institute of Astrological Sciences
            </CardTitle>
            <p className="text-center text-blue-100 mt-2">
              Email Verification Required
            </p>
          </CardHeader>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendMessage && (
              <Alert className="rounded-lg bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {resendMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-center text-gray-700 mb-4">
              <p>We &apos;ve sent a 6-digit verification code to your email address.</p>
              <p className="text-sm mt-1">Please check your inbox and enter the code below.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Verification Code</label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                disabled={loading}
                className="text-center text-xl tracking-widest font-semibold h-12 rounded-lg"
              />
              <p className="text-xs text-gray-500 text-center">
                Enter the code without spaces or dashes
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium shadow-md"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : 'Verify Code'}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Didn &apos;t receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendLoading || countdown > 0}
                className="text-sm"
              >
                {resendLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend Verification Code'
                )}
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500 mt-4">
              <p>If you &apos;re having trouble receiving the code, check your spam folder or contact support.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Main page component with Suspense boundary
export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-2xl font-bold text-white">
                Futuretek Institute of Astrological Sciences
              </CardTitle>
            </CardHeader>
          </div>
          <CardContent className="p-6">
            <div className="text-center py-8">Loading verification...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  )
}