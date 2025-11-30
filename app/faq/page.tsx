'use client'

import { useState } from 'react'
import { ChevronDown, Search, HelpCircle, ShoppingCart, Truck, CreditCard, Package } from 'lucide-react'

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [openFAQ, setOpenFAQ] = useState<number | null>(null)

    const categories = [
        { id: 'all', name: 'Semua', icon: HelpCircle },
        { id: 'order', name: 'Pemesanan', icon: ShoppingCart },
        { id: 'payment', name: 'Pembayaran', icon: CreditCard },
        { id: 'shipping', name: 'Pengiriman', icon: Truck },
        { id: 'product', name: 'Produk', icon: Package },
    ]

    const faqs = [
        {
            category: 'order',
            question: 'Bagaimana cara memesan produk di Apotik POS?',
            answer: 'Anda dapat memesan produk dengan cara: 1) Browse produk yang tersedia, 2) Tambahkan ke keranjang, 3) Checkout dan pilih metode pembayaran, 4) Konfirmasi pesanan Anda. Sangat mudah dan cepat!'
        },
        {
            category: 'order',
            question: 'Apakah saya bisa membatalkan pesanan?',
            answer: 'Ya, Anda dapat membatalkan pesanan sebelum status berubah menjadi "Diproses". Silakan hubungi customer service kami melalui WhatsApp atau email untuk pembatalan pesanan.'
        },
        {
            category: 'order',
            question: 'Berapa lama pesanan saya diproses?',
            answer: 'Pesanan akan diproses dalam waktu 1-2 jam setelah pembayaran dikonfirmasi. Untuk pesanan di luar jam operasional, akan diproses pada hari kerja berikutnya.'
        },
        {
            category: 'payment',
            question: 'Metode pembayaran apa saja yang tersedia?',
            answer: 'Kami menerima berbagai metode pembayaran: QRIS (semua e-wallet), Transfer Bank (BCA, Mandiri, BNI, BRI), Kartu Kredit/Debit, dan COD (Cash on Delivery) untuk area tertentu.'
        },
        {
            category: 'payment',
            question: 'Apakah pembayaran di Apotik POS aman?',
            answer: 'Ya, sangat aman. Kami menggunakan sistem pembayaran terenkripsi SSL dan bekerja sama dengan payment gateway terpercaya seperti Duitku. Data pembayaran Anda dilindungi dengan standar keamanan internasional.'
        },
        {
            category: 'payment',
            question: 'Berapa lama konfirmasi pembayaran?',
            answer: 'Untuk pembayaran QRIS dan kartu kredit, konfirmasi otomatis dalam hitungan detik. Untuk transfer bank, biasanya 1-15 menit. Jika lebih dari 1 jam, silakan hubungi customer service kami.'
        },
        {
            category: 'shipping',
            question: 'Berapa biaya pengiriman?',
            answer: 'Biaya pengiriman bervariasi tergantung lokasi dan berat paket. Kami menawarkan GRATIS ONGKIR untuk pembelian di atas Rp 100.000 untuk area Jakarta. Cek biaya pengiriman saat checkout.'
        },
        {
            category: 'shipping',
            question: 'Berapa lama waktu pengiriman?',
            answer: 'Untuk area Jakarta: Same Day Delivery (pesan sebelum jam 12 siang). Untuk luar Jakarta: 2-3 hari kerja (Jawa), 3-5 hari kerja (luar Jawa). Estimasi dapat berbeda saat peak season.'
        },
        {
            category: 'shipping',
            question: 'Bagaimana cara melacak pesanan saya?',
            answer: 'Setelah pesanan dikirim, Anda akan menerima nomor resi melalui email dan SMS. Anda dapat melacak pesanan di halaman "Pesanan Saya" atau langsung di website kurir yang bersangkutan.'
        },
        {
            category: 'product',
            question: 'Apakah semua produk dijamin original?',
            answer: 'Ya, 100% original. Semua produk kami bersertifikat BPOM dan berasal dari distributor resmi. Kami tidak menjual produk palsu atau kadaluarsa. Garansi uang kembali jika terbukti palsu.'
        },
        {
            category: 'product',
            question: 'Bagaimana cara menyimpan obat yang benar?',
            answer: 'Simpan obat di tempat kering, sejuk, dan terhindar dari sinar matahari langsung. Jauhkan dari jangkauan anak-anak. Perhatikan suhu penyimpanan yang tertera di kemasan. Untuk obat tertentu yang memerlukan kulkas, akan ada instruksi khusus.'
        },
        {
            category: 'product',
            question: 'Apakah saya bisa konsultasi dengan apoteker?',
            answer: 'Tentu! Kami memiliki tim apoteker profesional yang siap membantu Anda. Konsultasi gratis melalui chat di website, WhatsApp, atau telepon. Layanan konsultasi tersedia 24/7.'
        },
        {
            category: 'product',
            question: 'Bagaimana jika produk yang saya terima rusak?',
            answer: 'Jika produk rusak atau tidak sesuai, segera hubungi kami dalam 1x24 jam setelah penerimaan. Kirimkan foto produk dan kemasan. Kami akan melakukan penggantian atau refund sesuai kebijakan kami.'
        },
        {
            category: 'order',
            question: 'Apakah ada minimum pembelian?',
            answer: 'Tidak ada minimum pembelian. Anda dapat membeli produk mulai dari 1 item. Namun untuk mendapatkan gratis ongkir, minimal pembelian Rp 100.000 untuk area tertentu.'
        },
        {
            category: 'payment',
            question: 'Apakah ada biaya tambahan?',
            answer: 'Tidak ada biaya tersembunyi. Harga yang tertera sudah final, kecuali biaya pengiriman yang akan dihitung saat checkout berdasarkan lokasi Anda.'
        },
    ]

    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-16">
                <div className="container-responsive">
                    <div className="max-w-3xl mx-auto text-center">
                        <HelpCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
                        <h1 className="text-responsive-xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-responsive-base text-blue-100 mb-8">
                            Temukan jawaban untuk pertanyaan yang sering diajukan
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari pertanyaan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="container-responsive">
                    <div className="flex overflow-x-auto py-4 gap-2 sm:gap-4 scrollbar-hide">
                        {categories.map((category) => {
                            const Icon = category.icon
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                                        activeCategory === category.id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="text-sm sm:text-base">{category.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* FAQ List */}
            <div className="section-padding">
                <div className="container-responsive max-w-4xl">
                    {filteredFAQs.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Tidak ada pertanyaan yang ditemukan</p>
                            <p className="text-gray-400 text-sm mt-2">Coba kata kunci lain atau pilih kategori berbeda</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFAQs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
                                >
                                    <button
                                        onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                                        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-semibold text-gray-900 pr-4 text-sm sm:text-base">
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                                                openFAQ === index ? 'transform rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {openFAQ === index && (
                                        <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-gray-600 text-sm sm:text-base leading-relaxed animate-fade-in">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Still Have Questions */}
                    <div className="mt-12 card-responsive bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 text-center">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Masih Ada Pertanyaan?</h3>
                        <p className="text-gray-600 mb-6">
                            Tim kami siap membantu Anda 24/7
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                            >
                                Hubungi Kami
                            </a>
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                            >
                                Chat WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
