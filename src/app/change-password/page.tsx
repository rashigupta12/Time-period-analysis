'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function ChangePasswordContent() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  useEffect(() => {
    if (!userId) {
      router.push('/login')
    }
  }, [userId, router])

  useEffect(() => {
    validatePasswordStrength(formData.newPassword)
  }, [formData.newPassword])

  const validatePasswordStrength = (password: string) => {
    const errors = []
    let strength = 0

    // Check for minimum length
    if (password.length < 8) {
      errors.push('At least 8 characters')
    } else {
      strength += 1
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter (A-Z)')
    } else {
      strength += 1
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter (a-z)')
    } else {
      strength += 1
    }

    // Check for numbers
    if (!/[0-9]/.test(password)) {
      errors.push('One number (0-9)')
    } else {
      strength += 1
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('One special character (!@#$%^&* etc.)')
    } else {
      strength += 1
    }

    setPasswordErrors(errors)
    setPasswordStrength(strength)
  }

  const validatePasswords = () => {
    if (passwordErrors.length > 0) {
      setError('Please meet all password requirements')
      return false
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 4) return 'Medium'
    return 'Strong'
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setError('')

    if (!validatePasswords()) return

    setLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 ">
      <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0">
        <div className=" py-4">
          <CardHeader className="">
            <CardTitle className="text-center text-2xl font-bold text-blue-700">
              Futuretek Institute of Astrological Sciences
            </CardTitle>
            <p className="text-center text-blue-500 mt-2">
              Create a strong password to secure your account
            </p>
          </CardHeader>
        </div>
        <CardContent className="">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <Input
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pr-10 rounded-lg"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {formData.newPassword && (
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Password Strength</span>
                    <span className="text-xs font-medium text-gray-800">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mt-2">
                    <p className="font-medium mb-1">Password must include:</p>
                    <ul className="space-y-1">
                      <li className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        One uppercase letter (A-Z)
                      </li>
                      <li className={`flex items-center ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        One lowercase letter (a-z)
                      </li>
                      <li className={`flex items-center ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        One number (0-9)
                      </li>
                      <li className={`flex items-center ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        One special character (!@#$%^&* etc.)
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                className="rounded-lg"
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium shadow-md"
              disabled={loading || !formData.newPassword || !formData.confirmPassword || passwordErrors.length > 0}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Changing Password...
                </div>
              ) : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Icon components
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">Loading...</div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  )
}