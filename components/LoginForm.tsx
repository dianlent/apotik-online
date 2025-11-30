'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/context/ToastContext'
import { Mail, Lock, Eye, EyeOff, ShoppingBag, Shield, Zap } from 'lucide-react'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Check user role and redirect accordingly
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', (await supabase.auth.getUser()).data.user?.id)
                .single()

            showToast('Login successful! Welcome back.')
            
            // Redirect based on role
            if (profile?.role === 'admin') {
                router.push('/admin')
            } else if (profile?.role === 'kasir') {
                router.push('/kasir')
            } else {
                router.push('/')
            }
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 relative z-10">
                {/* Left Side - Branding */}
                <div className="hidden md:flex flex-col justify-center space-y-8 p-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                                <span className="text-white font-bold text-3xl">A</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Apotik POS
                                </h1>
                                <p className="text-gray-600 text-sm">Solusi Kesehatan Terpercaya</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Sistem Point of Sale modern untuk apotek dengan fitur lengkap dan mudah digunakan.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Manajemen Produk</h3>
                                <p className="text-sm text-gray-600">Kelola stok obat dengan mudah dan efisien</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Keamanan Terjamin</h3>
                                <p className="text-sm text-gray-600">Data terenkripsi dan aman</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Transaksi Cepat</h3>
                                <p className="text-sm text-gray-600">Proses pembayaran dalam hitungan detik</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 border border-white/20">
                            {/* Mobile Logo */}
                            <div className="md:hidden flex justify-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <span className="text-white font-bold text-3xl">A</span>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Selamat Datang! 👋
                                </h2>
                                <p className="text-gray-600">
                                    Masuk ke akun Anda untuk melanjutkan
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleLogin}>
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg relative animate-shake" role="alert">
                                        <span className="block sm:inline">{error}</span>
                                    </div>
                                )}

                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nama@email.com"
                                            className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                            Password
                                        </label>
                                        <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                            Lupa password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Memproses...
                                        </>
                                    ) : (
                                        'Masuk'
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500">Belum punya akun?</span>
                                    </div>
                                </div>

                                {/* Register Link */}
                                <Link 
                                    href="/register" 
                                    className="w-full flex justify-center py-3.5 px-4 border-2 border-green-600 rounded-xl text-base font-semibold text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-[1.02] transition-all"
                                >
                                    Daftar Sebagai Member
                                </Link>
                            </form>
                        </div>

                        {/* Footer */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            © 2024 Apotik POS. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
