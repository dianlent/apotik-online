'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Clock, ArrowRight } from 'lucide-react'

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const [orderInfo, setOrderInfo] = useState({
        orderId: '',
        orderNumber: '',
        amount: 0
    })

    useEffect(() => {
        // Get order info from URL params or localStorage
        const orderId = searchParams.get('orderId') || localStorage.getItem('lastOrderId') || ''
        const orderNumber = searchParams.get('orderNumber') || localStorage.getItem('lastOrderNumber') || ''
        const amount = searchParams.get('amount') || localStorage.getItem('lastOrderAmount') || '0'

        setOrderInfo({
            orderId,
            orderNumber,
            amount: parseInt(amount)
        })

        // Clear localStorage after reading
        if (orderId) {
            localStorage.removeItem('lastOrderId')
            localStorage.removeItem('lastOrderNumber')
            localStorage.removeItem('lastOrderAmount')
        }
    }, [searchParams])

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-responsive max-w-3xl">
                {/* Success Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 text-center">
                        <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                            <CheckCircle className="h-16 w-16" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Pembayaran Berhasil!</h1>
                        <p className="text-green-100">
                            Terima kasih atas pembelian Anda
                        </p>
                    </div>

                    {/* Order Info */}
                    <div className="p-8">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Nomor Pesanan</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {orderInfo.orderNumber || orderInfo.orderId || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                                    <p className="text-lg font-bold text-green-600">
                                        Rp {orderInfo.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Steps */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Status Pesanan</h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">Pembayaran Dikonfirmasi</p>
                                        <p className="text-sm text-gray-600">Pembayaran Anda telah berhasil diproses</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                            <Package className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">Pesanan Diproses</p>
                                        <p className="text-sm text-gray-600">Tim kami sedang memproses pesanan Anda</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                                            <Clock className="h-6 w-6 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-600">Menunggu Pengiriman</p>
                                        <p className="text-sm text-gray-500">Pesanan akan segera dikirim</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">📧 Konfirmasi Email</h3>
                            <p className="text-sm text-blue-800">
                                Kami telah mengirimkan konfirmasi pesanan ke email Anda. 
                                Silakan cek inbox atau folder spam Anda.
                            </p>
                        </div>

                        {/* What's Next */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Langkah Selanjutnya:</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>Anda akan menerima email konfirmasi dengan detail pesanan</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>Pesanan akan diproses dalam 1-2 jam kerja</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>Nomor resi akan dikirim via email dan SMS</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>Estimasi pengiriman 2-3 hari kerja</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/"
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                            >
                                Kembali ke Beranda
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="/products"
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
                            >
                                Belanja Lagi
                            </Link>
                        </div>

                        {/* Support */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Butuh bantuan?{' '}
                                <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Hubungi Customer Service
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                        Pesanan Anda telah tercatat dalam sistem kami dan sedang diproses.
                    </p>
                </div>
            </div>
        </div>
    )
}
