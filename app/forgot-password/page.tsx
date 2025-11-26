'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const { showToast } = useToast()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setSent(true)
            showToast('Email reset password telah dikirim!', 'success')
        } catch (error: any) {
            setError(error.message || 'Gagal mengirim email reset password')
            showToast('Gagal mengirim email', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Mail className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Lupa Password?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Masukkan email Anda dan kami akan mengirimkan link untuk reset password
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
                    {!sent ? (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama@email.com"
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="h-5 w-5 mr-2" />
                                            Kirim Link Reset Password
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link 
                                    href="/login" 
                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Kembali ke Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Email Terkirim!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Kami telah mengirimkan link reset password ke <strong>{email}</strong>
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Catatan:</strong> Link reset password akan kedaluwarsa dalam 1 jam. 
                                    Jika tidak menerima email, periksa folder spam Anda.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setSent(false)
                                        setEmail('')
                                    }}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Kirim Ulang
                                </button>
                                <Link
                                    href="/login"
                                    className="block w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-center"
                                >
                                    Kembali ke Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
