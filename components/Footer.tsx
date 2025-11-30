'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Heart, Pill, ShieldCheck, Truck, Clock } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-gray-300">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            Apotik POS
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Platform terpercaya untuk kebutuhan kesehatan Anda. Kami menyediakan obat-obatan berkualitas dengan layanan terbaik.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            <a href="#" className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                                <Facebook className="h-5 w-5 text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-pink-600 hover:bg-pink-500 rounded-full flex items-center justify-center transition-colors">
                                <Instagram className="h-5 w-5 text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-sky-500 hover:bg-sky-400 rounded-full flex items-center justify-center transition-colors">
                                <Twitter className="h-5 w-5 text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors">
                                <Youtube className="h-5 w-5 text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-4 flex items-center">
                            <Pill className="h-5 w-5 mr-2 text-blue-400" />
                            Produk
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/products" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    Semua Produk
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=obat" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    Obat-obatan
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=vitamin" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    Vitamin & Suplemen
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=alkes" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    Alat Kesehatan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-4">Layanan</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    Hubungi Kami
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    Kebijakan Privasi
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-blue-400 transition-colors flex items-center group">
                                    <span className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-4">Hubungi Kami</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-3 text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">
                                    Jl. Kesehatan No. 123<br />
                                    Jakarta Pusat, 10110
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-3 text-blue-400 flex-shrink-0" />
                                <a href="tel:+6281234567890" className="text-sm hover:text-blue-400 transition-colors">
                                    +62 812-3456-7890
                                </a>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-3 text-blue-400 flex-shrink-0" />
                                <a href="mailto:info@apotikpos.com" className="text-sm hover:text-blue-400 transition-colors">
                                    info@apotikpos.com
                                </a>
                            </li>
                        </ul>

                        {/* Operating Hours */}
                        <div className="mt-4 p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center mb-2">
                                <Clock className="h-4 w-4 mr-2 text-blue-400" />
                                <span className="text-sm font-semibold text-white">Jam Operasional</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                Senin - Jumat: 08:00 - 22:00<br />
                                Sabtu - Minggu: 09:00 - 21:00
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Bar */}
                <div className="border-t border-gray-700 pt-8 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center justify-center md:justify-start space-x-3 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                            <div className="flex-shrink-0">
                                <ShieldCheck className="h-10 w-10 text-green-400" />
                            </div>
                            <div>
                                <h5 className="text-white font-semibold text-sm">100% Original</h5>
                                <p className="text-xs text-gray-400">Produk dijamin asli</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center md:justify-start space-x-3 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                            <div className="flex-shrink-0">
                                <Truck className="h-10 w-10 text-blue-400" />
                            </div>
                            <div>
                                <h5 className="text-white font-semibold text-sm">Pengiriman Cepat</h5>
                                <p className="text-xs text-gray-400">Same day delivery</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center md:justify-start space-x-3 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                            <div className="flex-shrink-0">
                                <Heart className="h-10 w-10 text-pink-400" />
                            </div>
                            <div>
                                <h5 className="text-white font-semibold text-sm">Layanan 24/7</h5>
                                <p className="text-xs text-gray-400">Konsultasi gratis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-sm text-gray-400 text-center md:text-left">
                            © {currentYear} <span className="text-blue-400 font-semibold">Apotik POS</span>. All rights reserved.
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                            <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                                Privacy Policy
                            </Link>
                            <span className="text-gray-600">•</span>
                            <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                                Terms of Service
                            </Link>
                            <span className="text-gray-600">•</span>
                            <Link href="/sitemap" className="text-gray-400 hover:text-blue-400 transition-colors">
                                Sitemap
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Made with <Heart className="h-3 w-3 inline text-red-500 animate-pulse" /> by Apotik POS Team
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
