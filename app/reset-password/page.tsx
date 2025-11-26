'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        // Check if user has valid session from reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                showToast('Link reset password tidak valid atau sudah kedaluwarsa', 'error')
                router.push('/forgot-password')
            }
        }
        checkSession()
    }, [])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validation
        if (password.length < 6) {
            setError('Password minimal 6 karakter')
            return
        }

        if (password !== confirmPassword) {
            setError('Password tidak cocok')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            showToast('Password berhasil diubah!', 'success')
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (error: any) {
            setError(error.message || 'Gagal mengubah password')
            showToast('Gagal mengubah password', 'error')
        } finally {
            setLoading(false)
        }
    }

    const getPasswordStrength = (pass: string) => {
        if (pass.length === 0) return { strength: 0, label: '', color: '' }
        if (pass.length < 6) return { strength: 1, label: 'Lemah', color: 'bg-red-500' }
        if (pass.length < 10) return { strength: 2, label: 'Sedang', color: 'bg-yellow-500' }
        return { strength: 3, label: 'Kuat', color: 'bg-green-500' }
    }

    const passwordStrength = getPasswordStrength(password)

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Lock className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Masukkan password baru untuk akun Anda
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
                    {!success ? (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password Baru
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="appearance-none block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {password.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-600">Kekuatan Password:</span>
                                            <span className={`text-xs font-medium ${
                                                passwordStrength.strength === 1 ? 'text-red-600' :
                                                passwordStrength.strength === 2 ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                                                style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Konfirmasi Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Ketik ulang password"
                                        className="appearance-none block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && (
                                    <p className={`mt-1 text-xs ${
                                        password === confirmPassword ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {password === confirmPassword ? '✓ Password cocok' : '✗ Password tidak cocok'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading || password !== confirmPassword || password.length < 6}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Mengubah Password...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Password Berhasil Diubah!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login...
                            </p>
                            <div className="animate-pulse">
                                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
                                </div>
                            </div>
                            <Link
                                href="/login"
                                className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                Atau klik di sini untuk login sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
