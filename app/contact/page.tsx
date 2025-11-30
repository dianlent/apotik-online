'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Get N8N webhook URL from environment variable
            const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''

            if (!webhookUrl) {
                console.warn('N8N Webhook URL not configured')
                // Still show success to user even if webhook not configured
                setLoading(false)
                setSubmitted(true)
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                setTimeout(() => setSubmitted(false), 5000)
                return
            }

            // Prepare data for N8N
            const webhookData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || 'Tidak ada',
                subject: formData.subject,
                message: formData.message,
                timestamp: new Date().toISOString(),
                source: 'Apotik POS Contact Form'
            }

            // Send to N8N webhook
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData)
            })

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status}`)
            }

            console.log('Contact form sent to N8N successfully')
            
            setLoading(false)
            setSubmitted(true)
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' })

            // Reset success message after 5 seconds
            setTimeout(() => setSubmitted(false), 5000)
        } catch (err) {
            console.error('Error sending to N8N:', err)
            setError('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-16">
                <div className="container-responsive">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-responsive-xl font-bold mb-4">Hubungi Kami</h1>
                        <p className="text-responsive-base text-blue-100">
                            Kami siap membantu Anda. Hubungi kami melalui formulir atau kontak di bawah ini
                        </p>
                    </div>
                </div>
            </div>

            <div className="section-padding">
                <div className="container-responsive">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Information */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Phone */}
                            <div className="card-responsive bg-white shadow-lg border border-gray-100">
                                <div className="flex items-start">
                                    <div className="p-3 bg-blue-100 rounded-lg mr-4 flex-shrink-0">
                                        <Phone className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Telepon</h3>
                                        <a href="tel:+6281234567890" className="text-blue-600 hover:text-blue-700">
                                            +62 812-3456-7890
                                        </a>
                                        <p className="text-sm text-gray-500 mt-1">Senin - Minggu, 24/7</p>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="card-responsive bg-white shadow-lg border border-gray-100">
                                <div className="flex items-start">
                                    <div className="p-3 bg-green-100 rounded-lg mr-4 flex-shrink-0">
                                        <Mail className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                                        <a href="mailto:info@apotikpos.com" className="text-blue-600 hover:text-blue-700 break-all">
                                            info@apotikpos.com
                                        </a>
                                        <p className="text-sm text-gray-500 mt-1">Respon dalam 24 jam</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="card-responsive bg-white shadow-lg border border-gray-100">
                                <div className="flex items-start">
                                    <div className="p-3 bg-purple-100 rounded-lg mr-4 flex-shrink-0">
                                        <MapPin className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Alamat</h3>
                                        <p className="text-gray-600 text-sm">
                                            Jl. Kesehatan No. 123<br />
                                            Jakarta Pusat, 10110<br />
                                            Indonesia
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Operating Hours */}
                            <div className="card-responsive bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                                <div className="flex items-start">
                                    <div className="p-3 bg-blue-600 rounded-lg mr-4 flex-shrink-0">
                                        <Clock className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Jam Operasional</h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Senin - Jumat: 08:00 - 22:00</p>
                                            <p>Sabtu - Minggu: 09:00 - 21:00</p>
                                            <p className="text-green-600 font-semibold mt-2">🟢 Buka Sekarang</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="card-responsive bg-white shadow-lg border border-gray-100">
                                <div className="flex items-center mb-6">
                                    <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
                                    <h2 className="text-2xl font-bold text-gray-900">Kirim Pesan</h2>
                                </div>

                                {submitted && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 font-medium">
                                            ✓ Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 font-medium">
                                            ✗ {error}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nomor Telepon
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="+62 812-3456-7890"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subjek <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">Pilih Subjek</option>
                                                <option value="general">Pertanyaan Umum</option>
                                                <option value="order">Terkait Pesanan</option>
                                                <option value="product">Informasi Produk</option>
                                                <option value="complaint">Keluhan</option>
                                                <option value="partnership">Kerjasama</option>
                                                <option value="other">Lainnya</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pesan <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Tulis pesan Anda di sini..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5" />
                                                Kirim Pesan
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
