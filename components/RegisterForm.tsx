'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/context/ToastContext'
import { useSettings } from '@/context/SettingsContext'
import { Mail, Lock, Eye, EyeOff, User, Gift, ShieldCheck, Truck, Heart, CheckCircle, Loader2 } from 'lucide-react'

export default function RegisterForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [agreeTerms, setAgreeTerms] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()
    const { generalSettings } = useSettings()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validation
        if (password !== confirmPassword) {
            setError('Password tidak cocok!')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter!')
            setLoading(false)
            return
        }

        if (!agreeTerms) {
            setError('Anda harus menyetujui syarat dan ketentuan!')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    role: 'customer'
                }
            }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            showToast('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi akun.', 'success')
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        }
    }

    const benefits = [
        { icon: Gift, text: 'Diskon khusus member', color: 'text-pink-500' },
        { icon: Truck, text: 'Gratis ongkir min. Rp 100rb', color: 'text-blue-500' },
        { icon: Heart, text: 'Poin rewards setiap belanja', color: 'text-red-500' },
        { icon: ShieldCheck, text: 'Garansi produk asli 100%', color: 'text-green-500' },
    ]

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 relative z-10">
                {/* Left Side - Benefits */}
                <div className="hidden md:flex flex-col justify-center space-y-8 p-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            {generalSettings?.storeLogo ? (
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-2xl transform hover:scale-110 transition-transform p-2">
                                    <img 
                                        src={generalSettings.storeLogo} 
                                        alt={generalSettings.storeName || 'Logo'} 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                                    <span className="text-white font-bold text-3xl">
                                        {(generalSettings?.storeName || 'A').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {generalSettings?.storeName || 'Apotik POS'}
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    {generalSettings?.storeTagline || 'Solusi Kesehatan Terpercaya'}
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Bergabunglah dengan ribuan pelanggan yang sudah mempercayakan kebutuhan kesehatan mereka kepada kami.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">Keuntungan Menjadi Member:</h3>
                        {benefits.map((benefit, index) => (
                            <div 
                                key={index}
                                className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <div className={`p-3 bg-white rounded-xl shadow-md ${benefit.color}`}>
                                    <benefit.icon className="h-6 w-6" />
                                </div>
                                <span className="text-gray-700 font-medium">{benefit.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                        <div className="flex items-center space-x-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                </svg>
                            ))}
                        </div>
                        <p className="text-gray-600 italic">"Pelayanan sangat cepat dan produk selalu asli. Sangat puas berbelanja di sini!"</p>
                        <p className="text-gray-800 font-semibold mt-2">- Ibu Sari, Jakarta</p>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 border border-white/20">
                            {/* Mobile Logo */}
                            <div className="md:hidden flex justify-center mb-6">
                                {generalSettings?.storeLogo ? (
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-xl p-2">
                                        <img 
                                            src={generalSettings.storeLogo} 
                                            alt={generalSettings.storeName || 'Logo'} 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                                        <span className="text-white font-bold text-3xl">
                                            {(generalSettings?.storeName || 'A').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Daftar Sekarang
                                </h2>
                                <p className="text-gray-600">
                                    Buat akun untuk mulai berbelanja
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleRegister}>
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2" role="alert">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                        </svg>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Full Name */}
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor Telepon
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm font-medium">+62</span>
                                        </div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="812-3456-7890"
                                            className="block w-full pl-14 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat Email
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
                                            className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Konfirmasi Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi password"
                                            className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {password && confirmPassword && password === confirmPassword && (
                                        <div className="flex items-center mt-2 text-green-600 text-sm">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Password cocok
                                        </div>
                                    )}
                                </div>

                                {/* Terms */}
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="text-gray-600">
                                            Saya menyetujui{' '}
                                            <Link href="/terms" className="text-green-600 hover:text-green-500 font-medium">
                                                Syarat & Ketentuan
                                            </Link>
                                            {' '}dan{' '}
                                            <Link href="/privacy" className="text-green-600 hover:text-green-500 font-medium">
                                                Kebijakan Privasi
                                            </Link>
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                            Mendaftarkan...
                                        </>
                                    ) : (
                                        'Daftar Sekarang'
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500">Sudah punya akun?</span>
                                    </div>
                                </div>

                                {/* Login Link */}
                                <Link
                                    href="/login" 
                                    className="w-full flex justify-center py-3.5 px-4 border-2 border-green-600 rounded-xl text-base font-semibold text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-[1.02] transition-all"
                                >
                                    Masuk ke Akun
                                </Link>
                            </form>
                        </div>

                        {/* Footer */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            © {new Date().getFullYear()} {generalSettings?.storeName || 'Apotik POS'}. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
